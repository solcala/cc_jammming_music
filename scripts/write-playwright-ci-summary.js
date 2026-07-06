const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const playwrightPath = path.join(root, 'test-results', 'playwright.json');
const outputPath = path.join(root, 'test-results', 'e2e.json');

function summaryFromOutcome(outcome) {
  return {
    status: outcome === 'success' ? 'success' : 'failure',
    passed: 0,
    failed: outcome === 'success' ? 0 : 1,
    skipped: 0,
    durationMs: 0,
  };
}

let summary;
if (fs.existsSync(playwrightPath)) {
  const report = JSON.parse(fs.readFileSync(playwrightPath, 'utf8'));
  const stats = report.stats || {};
  const unexpected = stats.unexpected ?? 0;
  const flaky = stats.flaky ?? 0;

  summary = {
    status: unexpected > 0 || flaky > 0 ? 'failure' : 'success',
    passed: stats.expected ?? 0,
    failed: unexpected + flaky,
    skipped: stats.skipped ?? 0,
    durationMs: stats.duration ?? 0,
  };
} else {
  summary = summaryFromOutcome(process.env.PLAYWRIGHT_STEP_OUTCOME || 'failure');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
