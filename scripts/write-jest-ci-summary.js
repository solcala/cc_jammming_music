const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jestPath = path.join(root, 'test-results', 'jest.json');
const coveragePath = path.join(root, 'coverage', 'coverage-summary.json');
const outputPath = path.join(root, 'test-results', 'build_and_unit.json');

if (!fs.existsSync(jestPath)) {
  console.error('test-results/jest.json not found. Run npm run test:coverage first.');
  process.exit(1);
}

const jestReport = JSON.parse(fs.readFileSync(jestPath, 'utf8'));

const durationMs = Array.isArray(jestReport.testResults)
  ? jestReport.testResults.reduce((total, suite) => {
      if (
        typeof suite.startTime === 'number' &&
        typeof suite.endTime === 'number'
      ) {
        return total + (suite.endTime - suite.startTime);
      }
      return total;
    }, 0)
  : 0;

let coverage;
if (fs.existsSync(coveragePath)) {
  const { total } = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  coverage = { lines: total.lines.pct };
}

const summary = {
  status: jestReport.success ? 'success' : 'failure',
  passed: jestReport.numPassedTests ?? 0,
  failed: jestReport.numFailedTests ?? 0,
  skipped: jestReport.numPendingTests ?? 0,
  durationMs,
  ...(coverage ? { coverage } : {}),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
