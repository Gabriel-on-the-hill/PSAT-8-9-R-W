# PSAT 8/9 R&W — Tutor Backend (Apps Script)

**This is the source of the script that is actually deployed.** Verified 17 Jul 2026 against the
live endpoint in [sheet-sync.js](../sheet-sync.js): its `doGet` reply is byte-identical to the
`'PSAT 8/9 R&W backend is running.'` string below, and it answers `?action=plan&student=…` with JSONP.

> **It is not the sister app's script.** `SAT GUIDES/WAYNE/MasteryApp/tutor-sheet/rw-apps-script.md`
> is a different script for a different sheet, with named columns, an `ensureHeaders_` and a
> `Retention` column. **This one still has none of those.** `PEDAGOGY_ALIGNMENT.md` used to tell you
> to add `'Retention'` to an `EXTRA_COLUMNS` array here — there is no such array, and there never
> was. Do not copy instructions between the two scripts without reading both. As of **10 Aug 2026**
> the one thing that HAS been ported across is the **`Questions` tab** — see below.

## What it writes

Eight fixed columns, on a **`Homework`** tab (`type === 'homework'`) or a **`Sessions`** tab (everything else):

```
Logged at · Student · Type · Day / Focus / Skills · Score · Total · Seconds · Raw payload
```

`Raw payload` is the whole posted JSON in one cell. That is why the tutor dashboard can show
**retention** without this script ever changing: the client has been posting `retention` all along,
so it is already in every homework row the sheet has ever logged — including rows written before the
metric had a name. `tutor-sheet/tutor-dashboard.test.js` parses the header list out of this file and
fails if the dashboard stops being able to read what it writes.

### …and, since 10 Aug 2026, one row per QUESTION on a `Questions` tab

```
Logged at · Student · Type · Day / Focus / Skills · # · Question ID · Skill · Difficulty
         · Chosen · Correct · Right · Seconds · On text · On options · Prediction
```

**Why this was worth porting.** The per-question array was always arriving — `homework-run.html`
has posted `questions[]` with `prediction`, `onText` and `onOpts` since 11 Jul, and
`homework/homework-run.test.js` §10 pins that wire contract. But this script only ever wrote the
session row, so all of it landed `JSON.stringify`d inside a single `Raw payload` cell: **captured,
and unreadable.** Fine while PSAT homework was never reviewed line by line. The moment you want to
read what a student actually predicted before you teach her, it is the whole point.

The join back to the session row is **(`Logged at`, `Student`)** — the same `Date` object is written
to both, so the timestamps are identical, not merely close. No session id is invented, because the
client does not send one and inventing one would mean a ninth column on a `Homework` tab whose
headers are only ever written when the sheet is empty.

Three deliberate properties:

- **The session row is never at risk.** `appendQuestions_` runs in its own `try/catch` after the
  session row is appended. A failure there loses the per-question detail and still returns `ok`.
- **The header row is written with `setValues`, not `appendRow`.** `tutor-dashboard.test.js` finds
  the sheet's headers by matching the *first* `appendRow` array literal in this file. A second one
  would be a coin-toss over which schema the test validates. Do not reintroduce one above `doPost`.
- **No `LockService`.** The existing script has none, and adding it here would change the behaviour
  of the session write too. Concurrent posts from one tutor's handful of students are not a real
  risk; revisit if that ever stops being true.

## Two known limits (neither is biting today)

1. **`buildPlan()` cannot express `sections`.** It reads `skills/diffs/count/minutes/tip` only. A
   sheet-authored day naming more than one skill would **silently collapse to a single skill** — the
   failure `AGENTS.md` calls the one that bites hardest. Harmless only because `HW_USE_SHEET = false`
   in `homework/assignments.js`. **Do not turn that flag on until this understands `sections`.**
2. **No `review` field either**, so a sheet-authored day always takes the default dose of 2.

## Deploy

Sheet → **Extensions → Apps Script** → paste the block below → **Deploy → Manage deployments** →
edit the existing web app → **New version → Deploy**. Keep the same URL, or `sheet-sync.js` and
`homework/assignments.js` both need the new one.

> ⚠ **The 10 Aug `Questions` tab change is not live until you redeploy.** Editing the script in the
> Apps Script editor does nothing to the published web app; the deployed version is a frozen
> snapshot. Until **New version → Deploy** is done, every set a student submits still writes only
> the session row, and the per-question detail for those sets is recoverable **only** by parsing
> `Raw payload` by hand afterwards. Redeploy before the next set is due, not after.
>
> Nothing needs to change on the client. `homework-run.html` has been posting `questions[]` all
> along; this is purely a matter of the backend finally writing it down.

```javascript
// ══════════════════════════════════════════════════════════════════
// PSAT 8/9 R&W — Tutor Backend (Google Apps Script)
// ------------------------------------------------------------------
// Two jobs, both run from one Google Sheet you own:
//   1. LOG  (doPost)  — records every homework day and practice/mock
//      session a student finishes, one timestamped row each.
//   2. ASSIGN (doGet) — serves each student's weekly plan from a "Plans"
//      tab, so you assign homework by editing the sheet, not any file.
//
// Setup steps and the "Plans" tab columns are in "Tutor Backend - Setup.md".
// ══════════════════════════════════════════════════════════════════

// ---- 1. Logging: the app POSTs completions here -------------------
function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var tab  = (data.type === 'homework') ? 'Homework' : 'Sessions';
    var sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Logged at', 'Student', 'Type', 'Day / Focus / Skills',
                       'Score', 'Total', 'Seconds', 'Raw payload']);
      sheet.setFrozenRows(1);
    }
    var focus = (data.day ? ('Day ' + data.day + ' · ') : '') +
                (data.focus || (data.skills ? [].concat(data.skills).join(', ') : ''));

    // ONE Date, written to the session row and to every question row, so the two
    // tabs join on an exact equality rather than "within a second of each other".
    var loggedAt = new Date();

    sheet.appendRow([loggedAt, data.student || '(unknown)', data.type || 'session',
      focus, (data.score != null ? data.score : ''), (data.total != null ? data.total : ''),
      (data.seconds != null ? data.seconds : ''), JSON.stringify(data)]);

    // The session row is the thing that must never be lost. Anything that goes wrong
    // writing the per-question detail is swallowed here, on purpose: a Questions tab
    // that is missing a set is a nuisance, a Homework tab that is missing a set is a
    // hole in the record.
    try { appendQuestions_(ss, data, loggedAt, focus); } catch (qErr) {}

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}

// ---- 1b. One row per question, on a "Questions" tab ---------------
// homework-run.html posts questions[] as:
//   { id, skill, difficulty, chosen, correct, isCorrect, secs, onText, onOpts, prediction }
// pinned by homework/homework-run.test.js §10. Rename a field there and it must be
// renamed here in the same commit, or the column silently goes blank.
//
// NOTE the header row is written with setValues, NOT appendRow. tutor-dashboard.test.js
// locates the sheet's headers by matching the FIRST appendRow array literal in this
// file; a second literal would make which schema it validates a coin toss.
var QUESTION_COLUMNS = ['Logged at', 'Student', 'Type', 'Day / Focus / Skills',
  '#', 'Question ID', 'Skill', 'Difficulty', 'Chosen', 'Correct', 'Right',
  'Seconds', 'On text', 'On options', 'Prediction'];

function appendQuestions_(ss, data, loggedAt, focus) {
  var qs = Array.isArray(data.questions) ? data.questions : [];
  if (!qs.length) return;

  var sheet = ss.getSheetByName('Questions') || ss.insertSheet('Questions');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, QUESTION_COLUMNS.length)
         .setValues([QUESTION_COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Question ids are 8-char hex. Sheets will happily read "4e56" as 4×10^56 and
    // "12345678" as a number, and then the id no longer matches the bank. Pin the
    // whole column to plain text before a single row lands in it.
    var idCol = QUESTION_COLUMNS.indexOf('Question ID') + 1;
    sheet.getRange(1, idCol, sheet.getMaxRows(), 1).setNumberFormat('@');
  }

  var student = data.student || '(unknown)';
  var type    = data.type || 'session';
  var rows = qs.map(function (q, i) {
    return [
      loggedAt, student, type, focus, i + 1,
      val_(q.id), val_(q.skill), val_(q.difficulty),
      val_(q.chosen), val_(q.correct),
      (q.isCorrect === undefined || q.isCorrect === null) ? '' : !!q.isCorrect,
      val_(q.secs), val_(q.onText), val_(q.onOpts),
      // Untimed sets ask her to TYPE the reasoning; this column is the reason the
      // tab exists. Keep it last — it is long, and it should not push the numbers
      // off the right-hand edge of the screen.
      val_(q.prediction)
    ];
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, QUESTION_COLUMNS.length)
       .setValues(rows);
}

// Blank rather than the string "null"/"undefined" — an empty cell reads as "no data",
// which is what a skipped question actually is.
function val_(v) {
  return (v === undefined || v === null) ? '' : v;
}

// ---- 2. Assignments: the app GETs a student's plan here -----------
// Browser reads cross-origin via JSONP, so we honour a ?callback= param.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'plan' && p.student) {
    var plan = buildPlan(p.student);
    var json = JSON.stringify(plan);
    if (p.callback) {
      return ContentService.createTextOutput(p.callback + '(' + json + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('PSAT 8/9 R&W backend is running.');
}

// Build one student's plan object from the "Plans" tab (one row per day).
function buildPlan(student) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Plans');
  if (!sh || sh.getLastRow() < 2) return null;
  var rows = sh.getDataRange().getValues();
  var head = rows.shift();
  var col = {};
  head.forEach(function (h, i) { col[String(h).trim().toLowerCase()] = i; });
  var want = String(student).trim().toLowerCase();
  var days = [], start = '', title = '';
  rows.forEach(function (r) {
    if (String(r[col['student']]).trim().toLowerCase() !== want) return;
    if (!start && r[col['start']]) start = fmtDate(r[col['start']]);
    if (!title && r[col['title']]) title = String(r[col['title']]);
    if (r[col['day']] === '' || r[col['day']] == null) return;
    days.push({
      n: Number(r[col['day']]),
      focus: String(r[col['focus']] || ''),
      skills: splitList(r[col['skills']]),
      diffs: splitList(r[col['difficulties']]),
      count: Number(r[col['count']]) || 5,
      minutes: Number(r[col['minutes']]) || 0,
      tip: String(r[col['tip']] || '')
    });
  });
  if (!days.length) return null;
  days.sort(function (a, b) { return a.n - b.n; });
  return { title: title || 'This week', start: start, unlock: 'cumulative', days: days };
}

function splitList(v) {
  return String(v || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}

function fmtDate(v) {
  var dt = (v instanceof Date) ? v : new Date(v);
  if (isNaN(dt)) return String(v);
  var m = ('0' + (dt.getMonth() + 1)).slice(-2), d = ('0' + dt.getDate()).slice(-2);
  return dt.getFullYear() + '-' + m + '-' + d;   // always YYYY-MM-DD
}
```
