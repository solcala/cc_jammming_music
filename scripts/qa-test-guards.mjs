#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const failures = [];

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function rel(filePath) {
  return relative(root, filePath);
}

for (const file of walk(join(root, 'e2e'))) {
  const text = readFileSync(file, 'utf8');
  if (text.includes('waitForTimeout')) {
    failures.push(`${rel(file)}: waitForTimeout is forbidden in e2e`);
  }
}

for (const file of walk(join(root, 'e2e/pages'))) {
  const text = readFileSync(file, 'utf8');
  if (/\bexpect\s*\(/.test(text)) {
    failures.push(`${rel(file)}: expect() is forbidden in page objects`);
  }
}

if (failures.length > 0) {
  console.error('QA test guards failed:\n');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('QA test guards passed.');
