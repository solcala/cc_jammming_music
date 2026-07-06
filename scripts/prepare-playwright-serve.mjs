import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const buildDir = path.join(root, 'build');
const serveRoot = path.join(root, '.playwright-serve');
const homepagePath = '/cc_jammming_music';
const targetDir = path.join(serveRoot, homepagePath.slice(1));

if (!fs.existsSync(buildDir)) {
  console.error('build/ not found. Run npm run build first.');
  process.exit(1);
}

fs.rmSync(serveRoot, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

for (const entry of fs.readdirSync(buildDir)) {
  fs.cpSync(path.join(buildDir, entry), path.join(targetDir, entry), { recursive: true });
}

console.log(`Prepared ${targetDir} for Playwright (base path ${homepagePath})`);
