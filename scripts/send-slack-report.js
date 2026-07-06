#!/usr/bin/env node
/**
 * Send a CI test summary to Slack via Incoming Webhook.
 *
 * Usage:
 *   node scripts/send-slack-report.js --report path/to/report.json
 *   TEST_PASSED=10 TEST_FAILED=0 node scripts/send-slack-report.js
 *
 * Requires: process.env.SLACK_WEBHOOK_URL
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

function parseArgs(argv) {
  const args = { reportPath: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--report' && argv[i + 1]) {
      args.reportPath = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function readNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function loadReportFromEnv() {
  const passed = readNumber(process.env.TEST_PASSED);
  const failed = readNumber(process.env.TEST_FAILED);
  const skipped = readNumber(process.env.TEST_SKIPPED);
  const durationMs = readNumber(process.env.TEST_DURATION_MS);

  return {
    workflow: process.env.WORKFLOW_NAME || 'CI',
    ref: process.env.GITHUB_REF_NAME || process.env.REF || 'unknown',
    event: process.env.GITHUB_EVENT_NAME || process.env.EVENT || 'workflow_run',
    runUrl: process.env.RUN_URL || process.env.GITHUB_RUN_URL || '',
    jobs: {
      summary: {
        status:
          process.env.WORKFLOW_STATUS ||
          (failed > 0 ? 'failure' : 'success'),
        passed,
        failed,
        skipped,
        durationMs,
        jobName: process.env.JOB_NAME || 'tests',
      },
    },
  };
}

function loadReport(reportPath) {
  if (reportPath) {
    const raw = fs.readFileSync(reportPath, 'utf8');
    return JSON.parse(raw);
  }
  return loadReportFromEnv();
}

function aggregateTotals(report) {
  const jobs = Object.values(report.jobs || {});
  if (jobs.length === 0) {
    return { passed: 0, failed: 0, skipped: 0, durationMs: 0, failedJobs: 0 };
  }

  return jobs.reduce(
    (acc, job) => {
      acc.passed += readNumber(job.passed);
      acc.failed += readNumber(job.failed);
      acc.skipped += readNumber(job.skipped);
      acc.durationMs += readNumber(job.durationMs);
      if (job.status && job.status !== 'success') {
        acc.failedJobs += 1;
      }
      return acc;
    },
    { passed: 0, failed: 0, skipped: 0, durationMs: 0, failedJobs: 0 },
  );
}

function formatDuration(durationMs) {
  if (!durationMs) {
    return 'n/a';
  }
  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function buildBlocks(report) {
  const totals = aggregateTotals(report);
  const allGreen = totals.failed === 0 && totals.failedJobs === 0;
  const headerEmoji = allGreen ? ':large_green_circle:' : ':red_circle:';
  const headerText = allGreen ? 'CI Passed' : 'CI Failed';

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${headerEmoji} ${headerText} — ${report.workflow || 'CI'}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Branch*\n\`${report.ref || 'unknown'}\`` },
        { type: 'mrkdwn', text: `*Event*\n\`${report.event || 'unknown'}\`` },
        { type: 'mrkdwn', text: `*Passed*\n${totals.passed}` },
        { type: 'mrkdwn', text: `*Failed*\n${totals.failed}` },
        { type: 'mrkdwn', text: `*Skipped*\n${totals.skipped}` },
        { type: 'mrkdwn', text: `*Duration*\n${formatDuration(totals.durationMs)}` },
      ],
    },
  ];

  const jobLines = Object.entries(report.jobs || {}).map(([name, job]) => {
    const icon = job.status === 'success' ? ':white_check_mark:' : ':x:';
    const coverage =
      job.coverage && job.coverage.lines !== undefined
        ? ` | coverage ${job.coverage.lines}%`
        : '';
    const deployed = job.deployed === true ? ' | deployed' : '';
    return `${icon} *${name}* — ${readNumber(job.passed)} passed, ${readNumber(job.failed)} failed (${formatDuration(job.durationMs)})${coverage}${deployed}`;
  });

  if (jobLines.length > 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: jobLines.join('\n') },
    });
  }

  if (report.runUrl) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `<${report.runUrl}|View workflow run>` },
    });
  }

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: 'Jammming CI report' }],
  });

  return blocks;
}

function postToSlack(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseBody);
            return;
          }
          reject(
            new Error(
              `Slack webhook failed (${res.statusCode}): ${responseBody || 'no body'}`,
            ),
          );
        });
      },
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL is not set; skipping Slack notification.');
    process.exit(0);
  }

  const { reportPath } = parseArgs(process.argv);
  const report = loadReport(reportPath);
  const blocks = buildBlocks(report);
  const fallbackText = aggregateTotals(report).failed > 0 ? 'CI Failed' : 'CI Passed';

  await postToSlack(webhookUrl, { text: fallbackText, blocks });
  console.log('Slack notification sent.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
