const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'test-results', 'ci-report.json');

const jobs = ['build_and_unit', 'e2e', 'deploy'];

const summaryPaths = {
  build_and_unit: [
    'ci-reports/build_and_unit/build_and_unit.json',
  ],
  e2e: ['ci-reports/e2e/e2e.json'],
  deploy: ['ci-reports/deploy/deploy.json'],
};

const PAGES_FAILURES_BASE =
  process.env.PLAYWRIGHT_FAILURES_BASE ||
  'https://solcala.github.io/cc_jammming_music/failures';

function buildTraceViewerUrl(runId, artifactName) {
  const publicTraceUrl = `${PAGES_FAILURES_BASE}/${runId}/${artifactName}`;
  return `https://trace.playwright.dev/?trace=${encodeURIComponent(publicTraceUrl)}`;
}

function enrichE2eSummary(summary) {
  if (!summary || !summary.failed || summary.failed <= 0) {
    return summary;
  }

  const runId = process.env.GITHUB_RUN_ID;
  const enriched = { ...summary };

  if (!enriched.htmlReportUrl && process.env.GITHUB_RUN_URL) {
    enriched.htmlReportUrl = `${process.env.GITHUB_RUN_URL}#artifacts`;
  }

  if (
    runId &&
    (!enriched.traceViewerUrls || enriched.traceViewerUrls.length === 0) &&
    Array.isArray(enriched.traces)
  ) {
    enriched.traceViewerUrls = enriched.traces
      .filter((trace) => trace.artifactName)
      .map((trace) => buildTraceViewerUrl(runId, trace.artifactName));
  }

  return enriched;
}

const resultEnv = {
  build_and_unit: process.env.BUILD_AND_UNIT_RESULT,
  e2e: process.env.E2E_RESULT,
  deploy: process.env.DEPLOY_RESULT,
};

function findSummary(jobName) {
  for (const relativePath of summaryPaths[jobName]) {
    const absolutePath = path.join(root, relativePath);
    if (fs.existsSync(absolutePath)) {
      return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    }
  }
  return null;
}

function fallbackSummary(jobName) {
  const result = resultEnv[jobName];

  if (result === 'success') {
    return {
      status: 'success',
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      ...(jobName === 'deploy' ? { deployed: false } : {}),
    };
  }

  if (result === 'skipped') {
    return {
      status: 'skipped',
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      ...(jobName === 'deploy' ? { deployed: false } : {}),
    };
  }

  return {
    status: 'failure',
    passed: 0,
    failed: 1,
    skipped: 0,
    durationMs: 0,
    ...(jobName === 'deploy' ? { deployed: false } : {}),
  };
}

const report = {
  workflow: process.env.GITHUB_WORKFLOW || 'CI',
  ref: process.env.GITHUB_REF_NAME || 'unknown',
  event: process.env.GITHUB_EVENT_NAME || 'unknown',
  runUrl: process.env.GITHUB_RUN_URL || '',
  jobs: {},
};

for (const jobName of jobs) {
  let jobSummary = findSummary(jobName) || fallbackSummary(jobName);
  if (jobName === 'e2e') {
    jobSummary = enrichE2eSummary(jobSummary);
  }
  report.jobs[jobName] = jobSummary;
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
