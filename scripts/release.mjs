#!/usr/bin/env node
/**
 * Bump version, update CHANGELOG, commit, tag, and push.
 *
 * Usage:
 *   npm run release -- patch "Fix notification crash"
 *   npm run release -- minor "Add AI plant identify"
 *   npm run release -- major "1.0 store launch"
 *   npm run release -- 0.3.0 "Named version with notes"
 *
 * Options (env):
 *   SKIP_PUSH=1   — commit + tag only, do not push
 *   DRY_RUN=1     — print actions only
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.env.DRY_RUN === '1';
const skipPush = process.env.SKIP_PUSH === '1';

function run(cmd) {
  console.log(`$ ${cmd}`);
  if (!dry) execSync(cmd, { cwd: root, stdio: 'inherit' });
}

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function write(path, content) {
  if (dry) {
    console.log(`[dry-run] write ${path}`);
    return;
  }
  writeFileSync(resolve(root, path), content);
}

function parseSemver(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid semver: ${v}`);
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

function bump(ver, kind) {
  const s = parseSemver(ver);
  if (kind === 'major') return `${s.major + 1}.0.0`;
  if (kind === 'minor') return `${s.major}.${s.minor + 1}.0`;
  if (kind === 'patch') return `${s.major}.${s.minor}.${s.patch + 1}`;
  // explicit version
  parseSemver(kind);
  return kind;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const [, , kind, ...noteParts] = process.argv;
const notes = noteParts.join(' ').trim();

if (!kind) {
  console.error(`Usage: npm run release -- <patch|minor|major|x.y.z> "Release notes"`);
  process.exit(1);
}
if (!notes) {
  console.error('Please provide release notes in quotes.');
  process.exit(1);
}

const pkg = JSON.parse(read('package.json'));
const oldVersion = pkg.version;
const newVersion = bump(oldVersion, kind);

console.log(`\nVerdant release: ${oldVersion} → ${newVersion}\n`);

// package.json
pkg.version = newVersion;
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

// package-lock top-level version if present
const lockPath = resolve(root, 'package-lock.json');
if (existsSync(lockPath)) {
  const lock = JSON.parse(read('package-lock.json'));
  lock.version = newVersion;
  if (lock.packages?.['']) lock.packages[''].version = newVersion;
  write('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
}

// app.json
const appJson = JSON.parse(read('app.json'));
appJson.expo.version = newVersion;
write('app.json', JSON.stringify(appJson, null, 2) + '\n');

// APP_VERSION constant
let colors = read('constants/Colors.ts');
if (!colors.includes('APP_VERSION')) {
  throw new Error('APP_VERSION not found in constants/Colors.ts');
}
colors = colors.replace(
  /export const APP_VERSION = '[^']+';/,
  `export const APP_VERSION = '${newVersion}';`
);
write('constants/Colors.ts', colors);

// CHANGELOG — move Unreleased planned notes stay; insert new section after Unreleased block
const changelogPath = 'CHANGELOG.md';
let changelog = existsSync(resolve(root, changelogPath))
  ? read(changelogPath)
  : '# Changelog\n\n';

const section = `## [${newVersion}] - ${today()}

### Notes

- ${notes}

`;

if (changelog.includes('## [Unreleased]')) {
  // Insert after the Unreleased section's following --- or before first ## [version]
  const unreleasedIdx = changelog.indexOf('## [Unreleased]');
  const afterUnreleased = changelog.slice(unreleasedIdx);
  const nextVersion = afterUnreleased.search(/\n## \[\d+\.\d+\.\d+\]/);
  if (nextVersion === -1) {
    changelog = changelog.trimEnd() + '\n\n' + section;
  } else {
    const abs = unreleasedIdx + nextVersion;
    changelog =
      changelog.slice(0, abs + 1) + section + changelog.slice(abs + 1);
  }
} else {
  changelog = `# Changelog\n\n${section}` + changelog;
}

// Ensure compare links footer optional — skip for simplicity
write(changelogPath, changelog);

// Git commit + tag + push
const tag = `v${newVersion}`;
run('git add package.json package-lock.json app.json constants/Colors.ts CHANGELOG.md');
run(
  `git commit -m "chore(release): v${newVersion}\n\n${notes.replace(/"/g, '\\"')}"`
);
run(`git tag -a ${tag} -m "v${newVersion}: ${notes.replace(/"/g, '\\"')}"`);

if (!skipPush) {
  run('git push origin HEAD');
  run(`git push origin ${tag}`);
} else {
  console.log('SKIP_PUSH=1 — not pushing');
}

console.log(`\n✓ Released ${tag}`);
