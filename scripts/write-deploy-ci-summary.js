const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'test-results', 'deploy.json');
const appUrl = 'https://solcala.github.io/cc_jammming_music/';

const deployed = process.env.DEPLOYED === 'true';
const jobFailed = process.env.JOB_FAILED === 'true';

const summary = {
  status: jobFailed ? 'failure' : 'success',
  passed: 0,
  failed: jobFailed ? 1 : 0,
  skipped: 0,
  durationMs: 0,
  deployed,
  ...(deployed ? { appUrl } : {}),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
