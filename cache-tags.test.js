// ─────────────────────────────────────────────────────────────────
// cache-tags.test.js — a returning student must not be served last month's app.
//
//   node cache-tags.test.js
//
// Needs no jsdom. Skips cleanly outside a git checkout.
//
// There is no build step here. The `?v=YYYYMMDD` on every <script> and <link> IS
// the entire cache-busting mechanism: change a file without changing its tag and
// every browser that already has the old copy keeps it, indefinitely. Nothing
// errors. The page loads, the app runs, and it runs the old code.
//
// That is not hypothetical. It happened in the sibling SAT app on 25 Jul 2026 —
// ELEVEN files stale, some by nineteen days: app.js tagged 3 Jul but changed
// 22 Jul, so students kept the draw order from before the change; the question
// bank tagged before the month's new questions were added; homework/assignments.js
// serving the previous week's plan. The tutor read those results as if they came
// from the current app. Wrong homework, wrong questions, wrong conclusions about
// the student, and not one symptom anywhere.
//
// The convention this asserts: a file's tag is the date that file last changed.
// Bump the tag in the same commit as the file, or this fails.
//
//   1. Every ?v= tag is at least as new as the file's last commit date.
//   2. Every versioned reference points at a file that exists — a typo is a 404,
//      and a 404'd bank is a global that never defines and a page that silently
//      serves half a set.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const APP = __dirname;

function lastCommitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ad',
      '--date=format:%Y%m%d', '--', file], { cwd: APP, encoding: 'utf8' }).trim();
    return out || null;   // untracked: nothing to compare against
  } catch (e) { return undefined; }   // git missing or not a repo
}

if (lastCommitDate('AGENTS.md') === undefined) {
  console.log('SKIP — not a git checkout (see header).');
  process.exit(0);
}

const REF = /(?:src|href)="([^"?]+)\?v=(\d{8})"/g;

// Every .html in the app root, plus the ones in sub-folders that carry their
// own script tags. A page missed here is a page whose tags nothing checks.
const SUBDIRS = ['homework', 'tutor-sheet', 'question-search'];
const htmls = fs.readdirSync(APP).filter(f => f.endsWith('.html'));
for (const dir of SUBDIRS) {
  const abs = path.join(APP, dir);
  if (!fs.existsSync(abs)) continue;
  fs.readdirSync(abs)
    .filter(f => f.endsWith('.html'))
    .forEach(f => htmls.push(dir + '/' + f));
}

let checked = 0;
const stale = [];
const missing = [];

for (const html of htmls) {
  const src = fs.readFileSync(path.join(APP, html), 'utf8');
  const base = path.dirname(path.join(APP, html));
  for (const m of src.matchAll(REF)) {
    const [, file, tag] = m;
    if (/^(https?:)?\/\//.test(file)) continue;      // off-site asset, not ours
    checked++;
    // References are relative to the page that makes them, not to the app root.
    const abs = path.resolve(base, file);
    if (!fs.existsSync(abs)) {
      missing.push(`${html} -> ${file}`);
      continue;
    }
    const changed = lastCommitDate(path.relative(APP, abs));
    if (changed && changed > tag) {
      stale.push(`${html} -> ${file}  tagged ${tag}, changed ${changed}`);
    }
  }
}

const fail = [];
if (!checked) fail.push('no versioned references found at all — has the ?v= convention been dropped?');
for (const m of missing) fail.push('MISSING FILE  ' + m);
for (const s of new Set(stale)) fail.push('STALE TAG     ' + s);

if (fail.length) {
  console.error(`cache-tags.test.js: ${fail.length} problem(s)\n`);
  fail.forEach(f => console.error('  ' + f));
  console.error('\nFix: set each tag to the date that file last changed (YYYYMMDD).');
  console.error('A stale tag means returning browsers keep serving the OLD file.');
  process.exit(1);
}

console.log(`cache-tags.test.js: OK — ${checked} versioned references, none stale.`);
