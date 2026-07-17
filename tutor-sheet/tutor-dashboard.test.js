// ─────────────────────────────────────────────────────────────────
// tutor-dashboard.test.js — the dashboard must be able to read THIS app's sheet.
//
//   npm install jsdom --prefix /tmp/j
//   NODE_PATH=/tmp/j/node_modules node tutor-sheet/tutor-dashboard.test.js
//
// Skips cleanly if jsdom is absent.
//
// This file exists because the dashboard has now been wrong about its own sheet
// TWICE, and both times it rendered blanks instead of failing:
//
//   1. It asked for the PAYLOAD's field names (`pct`, `date`, `blurCount`) when the
//      sheet's headers are the Apps Script's.
//   2. That was "fixed" by copying the SISTER app's headers (`Percent`, `Timestamp`,
//      `Focus Losses`, `Breakdown`) — which this sheet has never had either, because
//      `psat-apps-script.md` is a completely different script from the sister's
//      `SAT GUIDES/WAYNE/MasteryApp/tutor-sheet/rw-apps-script.md`.
//
// A missing column returns '' rather than throwing, so both times every figure went
// blank and the dashboard looked exactly like a tutor with no data. Nothing failed.
//
// So the headers here are not typed in by hand — they are PARSED OUT OF THE CHECKED-IN
// SCRIPT (`psat-apps-script.md`). If someone changes what the backend writes, this
// suite goes red instead of the dashboard going quiet.
//
//   §1 The header row comes from the deployed script, not from memory.
//   §2 Every logical field the dashboard asks for resolves against that header row.
//   §3 Retention is read out of `Raw payload` — no redeploy, and it works on history.
//   §4 A percent is derived for homework rows, which never post one.
//   §5 The per-skill breakdown falls back to `questions`, so homework feeds "Weakest".
//   §6 Both tabs merge, and a half-failure is reported rather than silently shown.
//   §7 Blank retention is "we don't know yet" — never a zero.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');

let JSDOM;
try { ({ JSDOM } = require('jsdom')); }
catch (e) { console.log('SKIP — jsdom not installed (see header).'); process.exit(0); }

const APP = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(APP, f), 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } };
const section = s => console.log('\n' + s);

// ── §1 · The header row, taken from the script that actually writes it ────────────
// Parsing rather than transcribing is the whole point: a transcribed copy is just a
// third place for the schema to drift.
const SCRIPT = read('tutor-sheet/psat-apps-script.md');
const m = SCRIPT.match(/appendRow\(\[([^\]]*)\]\)/);
const HEADERS = m ? m[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [];

section('1 · The header row is read from the deployed script, not from memory');
ok('the checked-in script contains its header row', HEADERS.length > 0);
ok('it is the eight-column PSAT schema', HEADERS.length === 8);
ok("and it starts with 'Logged at', not the sister's 'Timestamp'", HEADERS[0] === 'Logged at');
ok("it carries the 'Raw payload' catch-all", HEADERS.includes('Raw payload'));

// ── The two payload shapes, exactly as the clients post them ─────────────────────
const AT = '2026-07-14T10:30:00.000Z';
const HW_PAYLOAD = {
  type: 'homework', student: 'TestStudent', day: 3, focus: 'Words in Context',
  score: 5, total: 6, seconds: 300, at: AT,
  // Only the ladder's picks are tallied here — see homework-run.html sessionRetention().
  retention: { 'Words in Context': { correct: 1, total: 2 } },
  questions: [
    { id: 'q1', skill: 'Words in Context', difficulty: 'Medium', chosen: 'A', correct: 'A', isCorrect: true,  secs: 40, prediction: 'guessed it means cautious' },
    { id: 'q2', skill: 'Transitions',      difficulty: 'Medium', chosen: 'B', correct: 'C', isCorrect: false, secs: 55, prediction: 'contrast' },
    { id: 'q3', skill: 'Transitions',      difficulty: 'Medium', chosen: 'D', correct: 'C', isCorrect: false, secs: 60, prediction: 'addition' },
    { id: 'q4', skill: 'Transitions',      difficulty: 'Medium', chosen: 'C', correct: 'C', isCorrect: true,  secs: 30, prediction: 'however' },
  ],
};
const SESS_PAYLOAD = {
  date: '2026-07-15T09:00:00.000Z', student: 'TestStudent', type: 'practice',
  assignmentTitle: 'Practice set', score: 9, total: 10, pct: 0.9,
  skills: ['Inferences'], mode: 'timed', duration: 450, avgSecs: 45,
  skillStats: { 'Inferences': { correct: 9, total: 10 } },
  blurCount: 3,
};

const csv = rows => {
  const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
  return [HEADERS.map(esc).join(',')].concat(rows.map(r => HEADERS.map(h => esc(r[h] ?? '')).join(','))).join('\n');
};
const HW_ROW = {
  'Logged at': AT, 'Student': 'TestStudent', 'Type': 'homework',
  'Day / Focus / Skills': 'Day 3 · Words in Context',
  'Score': 5, 'Total': 6, 'Seconds': 300, 'Raw payload': JSON.stringify(HW_PAYLOAD),
};
const SESS_ROW = {
  'Logged at': '2026-07-15T09:00:00.000Z', 'Student': 'TestStudent', 'Type': 'practice',
  'Day / Focus / Skills': 'Practice set',
  'Score': 9, 'Total': 10, 'Seconds': 450, 'Raw payload': JSON.stringify(SESS_PAYLOAD),
};

// ── Drive the real page ─────────────────────────────────────────────────────────
const RAW = read('tutor-dashboard.html');
const HTML = RAW.replace(/<script\b[^>]*src=[^>]*><\/script>/gi, '');   // drop gate.js; keep the inline script

function build(tabs) {
  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    url: 'http://localhost/tutor-dashboard.html',
    beforeParse(w) {
      w.fetch = (url) => {
        const body = tabs[url];
        if (body === undefined) return Promise.resolve({ ok: false, status: 404 });
        return Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
      };
    },
  });
  return dom.window;
}

const HW_URL = 'http://sheet/homework.csv';
const SESS_URL = 'http://sheet/sessions.csv';

(async () => {
  const w = build({ [HW_URL]: csv([HW_ROW]), [SESS_URL]: csv([SESS_ROW]) });

  // §2 — every logical field resolves against a row built from the REAL headers.
  section('2 · Every field the dashboard asks for resolves against the real header row');
  const row = w.parseCSV(csv([HW_ROW]))[0];
  ok('date resolves (the sheet says "Logged at")', w.val(row, 'date') !== '');
  ok('student resolves', w.val(row, 'student') === 'TestStudent');
  ok('type resolves', w.val(row, 'type') === 'homework');
  ok('score resolves', String(w.val(row, 'score')) === '5');
  ok('total resolves', String(w.val(row, 'total')) === '6');
  ok('the detail column resolves', w.val(row, 'title') !== '');
  ok('retention resolves out of the raw payload', w.val(row, 'retention') !== '');

  // §3/§4/§5 — the derived readings.
  section('3 · Retention comes out of Raw payload, with no redeploy');
  const ret = JSON.parse(w.val(row, 'retention'));
  ok('the ladder\'s delayed retrievals survive the round trip', ret['Words in Context'].total === 2);
  ok('and their correct count with them', ret['Words in Context'].correct === 1);

  section('4 · A percent is derived for homework rows, which never post one');
  ok('5 of 6 reads as 83%, not as a blank', Math.round(w.pctRow(row)) === 83);
  ok('pace is derived from whole-session seconds', Math.round(w.avgSecsRow(row)) === 50);

  section('5 · The breakdown falls back to `questions`, so homework feeds "Weakest"');
  const bd = w.breakdownOf(row);
  ok('homework yields a per-skill breakdown at all', !!bd);
  ok('Transitions is counted across its three questions', bd && bd['Transitions'].total === 3);
  ok('and only one of them was right', bd && bd['Transitions'].correct === 1);
  ok('a practice row still prefers its own skillStats', (() => {
    const s = w.parseCSV(csv([SESS_ROW]))[0];
    const b = w.breakdownOf(s);
    return b && b['Inferences'] && b['Inferences'].total === 10;
  })());

  // §6 — both tabs, merged, and honest about a half-failure.
  section('6 · Both tabs merge, and a half-failure is reported not swallowed');
  await w.load(HW_URL + '\n' + SESS_URL);
  const html = w.document.getElementById('output').innerHTML;
  const status = w.document.getElementById('status').textContent;
  ok('both tabs are loaded', /2 of 2 tabs/.test(status));
  ok('the student appears once, not once per tab', (html.match(/TestStudent/g) || []).length >= 1);
  ok('retention renders as a rate WITH its counts', /50% kept \(1\/2\)/.test(html));
  ok('the date renders rather than sitting blank', /14 Jul/.test(html));
  // 14 of 16 marks = 87.5% → 88%. A mean of the two session percentages would be
  // (83+90)/2 = 87%, which is the bug this asserts against: it lets a 6-question day
  // weigh the same as a 10-question one, and it is not comparable with retention's c/t.
  ok('accuracy is marks over marks (14/16 → 88%), not a mean of percents', /88% avg/.test(html));
  ok('tab-switches come out of the payload', />3</.test(html) || /3 tab-switch/.test(html));
  ok('"Weakest" names the skill homework actually shows as weak', /Transitions/.test(html));

  const w2 = build({ [HW_URL]: csv([HW_ROW]) });   // the sessions tab 404s
  await w2.load(HW_URL + '\n' + SESS_URL);
  ok('a failed tab is named in the status, not hidden', /1 tab failed/.test(w2.document.getElementById('status').textContent));
  ok('and the rows that did load still render', /TestStudent/.test(w2.document.getElementById('output').innerHTML));

  // §7 — the honest blank.
  section('7 · No review due is "we don\'t know yet", never a zero');
  const noRet = Object.assign({}, HW_ROW, {
    'Raw payload': JSON.stringify(Object.assign({}, HW_PAYLOAD, { retention: {} })),
  });
  const w3 = build({ [HW_URL]: csv([noRet]) });
  await w3.load(HW_URL);
  const h3 = w3.document.getElementById('output').innerHTML;
  ok('a student with no reviews due shows "kept —"', /kept —/.test(h3));
  ok('and is never reported as 0% retained', !/0% kept/.test(h3));
  ok('the gap sentence stays silent on a thin sample', !/spacing problem/.test(h3));

  console.log('\n' + '─'.repeat(64));
  console.log(fail ? `${fail} ASSERTION${fail !== 1 ? 'S' : ''} FAILED (${pass} passed)` : `ALL ${pass} ASSERTIONS PASSED`);
  process.exit(fail ? 1 : 0);
})();
