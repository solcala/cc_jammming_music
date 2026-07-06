const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const playwrightPath = path.join(root, 'test-results', 'playwright.json');
const outputPath = path.join(root, 'test-results', 'e2e.json');

const PAGES_FAILURES_BASE =
  process.env.PLAYWRIGHT_FAILURES_BASE ||
  'https://solcala.github.io/cc_jammming_music/failures';

function summaryFromOutcome(outcome) {
  return {
    status: outcome === 'success' ? 'success' : 'failure',
    passed: 0,
    failed: outcome === 'success' ? 0 : 1,
    skipped: 0,
    durationMs: 0,
  };
}

function traceArtifactName(tracePath) {
  if (!tracePath) {
    return null;
  }
  return `${path.basename(path.dirname(tracePath))}.zip`;
}

function collectFailedTests(suites, parentTitles = []) {
  const failures = [];

  for (const suite of suites || []) {
    const titles = [...parentTitles, suite.title].filter(Boolean);

    for (const spec of suite.specs || []) {
      const specTitle = [...titles, spec.title].filter(Boolean).join(' › ');

      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status === 'passed' || result.status === 'skipped') {
            continue;
          }

          const traceAttachment = (result.attachments || []).find(
            (attachment) =>
              attachment.name === 'trace' ||
              (attachment.path && attachment.path.endsWith('trace.zip')),
          );

          let tracePath = traceAttachment?.path;
          if (!tracePath) {
            const firstAttachment = (result.attachments || [])[0];
            if (firstAttachment?.path) {
              const candidate = path.join(
                path.dirname(firstAttachment.path),
                'trace.zip',
              );
              if (fs.existsSync(candidate)) {
                tracePath = candidate;
              }
            }
          }

          failures.push({
            title: specTitle,
            tracePath,
            artifactName: traceArtifactName(tracePath),
          });
        }
      }
    }

    failures.push(...collectFailedTests(suite.suites, titles));
  }

  return failures;
}

function buildTraceViewerUrl(runId, artifactName) {
  const publicTraceUrl = `${PAGES_FAILURES_BASE}/${runId}/${artifactName}`;
  return `https://trace.playwright.dev/?trace=${encodeURIComponent(publicTraceUrl)}`;
}

let summary;
if (fs.existsSync(playwrightPath)) {
  const report = JSON.parse(fs.readFileSync(playwrightPath, 'utf8'));
  const stats = report.stats || {};
  const unexpected = stats.unexpected ?? 0;
  const flaky = stats.flaky ?? 0;
  const failures = collectFailedTests(report.suites);
  const runId = process.env.GITHUB_RUN_ID;

  summary = {
    status: unexpected > 0 || flaky > 0 ? 'failure' : 'success',
    passed: stats.expected ?? 0,
    failed: unexpected + flaky,
    skipped: stats.skipped ?? 0,
    durationMs: stats.duration ?? 0,
  };

  if (failures.length > 0) {
    summary.failedTests = failures.map((failure) => failure.title);
    summary.traces = failures
      .filter((failure) => failure.artifactName)
      .map((failure) => ({
        test: failure.title,
        artifactName: failure.artifactName,
      }));

    if (runId) {
      summary.traceViewerUrls = summary.traces.map((trace) =>
        buildTraceViewerUrl(runId, trace.artifactName),
      );
    }
  }

  if (process.env.GITHUB_RUN_URL) {
    summary.htmlReportUrl = `${process.env.GITHUB_RUN_URL}#artifacts`;
  }
} else {
  summary = summaryFromOutcome(process.env.PLAYWRIGHT_STEP_OUTCOME || 'failure');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
