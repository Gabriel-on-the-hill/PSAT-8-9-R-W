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
         · Chosen · Correct · Right · Seconds · On text · On options · Prediction · Crossed out
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

## One login at a time (29 Sep 2026)

A student password opens the app in **one tab, on one device, at a time.** `gate.js` asks this script
for a lease on the student's name when the password is accepted (`doGet`, `action=lease`, JSONP),
beats it once a minute, and releases it when the tab closes (`doPost` via `sendBeacon`; a released
name frees 20 seconds later, so moving between pages never drops it). A second tab or device asking
for a name that is already live is **refused**. A lease nobody has beaten for 150 seconds is dead.

Two tabs appear on first use (or run `setupLogins` once): **Active Logins** — one row per student; a
blank Token means not logged in, and **clearing a student's Token cell frees a stuck login** — and
**Login Log** (granted / refused / lost). Tutor logins never take a lease.

**Redeploy is required** (Deploy → Manage deployments → edit → New version, same deployment so the
`/exec` URL does not change). Until then the gate gets no readable answer and lets the student in —
it fails open by design. `tutor-sheet/lease.test.js` runs `lease_()` against an in-memory sheet.

## What the 8 Sep 2026 outage was, and what changed here

Between **24 Aug and 7 Sep** every question row landed with a **blank `Logged at`**, and the
matching session rows stopped arriving. Because the blank started on a date rather than on a
student, it looked student-specific only by accident: Luke's first sitting was 24 Aug, so *all* of
his work fell on the broken side and none of it could be dated. That is what made the September
performance write-up unable to say when anything happened.

Black-box probes of the live endpoint on 8 Sep (POST a throwaway payload, read the reply) established:

- `doPost` returns `ok` and **the session rows write correctly** to both `Homework` and `Sessions`,
  timestamps included. The tab routing and the summary write are fine.
- **`appendQuestions_` was throwing on every call** and the empty `catch` was eating it. `ok` was
  being returned for a post that wrote half of what it claimed.

Three changes above, in order of how much they matter:

1. **The catch no longer swallows.** The reply is now `ok | questions failed: <the actual error>`.
   This is the change that matters most — the previous failure was invisible for two weeks purely
   because the only signal was the word `ok`.
2. **The grid is grown before `setValues`.** `setValues` throws if the range runs past the last row
   of the sheet; `appendRow` would have grown it. A `Questions` tab that has had its spare rows
   deleted stops accepting rows silently, which matches the observed behaviour exactly.
3. **Column A can no longer be blank.** If a `Date` does not arrive, `new Date()` is used. A
   timestamp that is off by milliseconds is recoverable; a blank one is not.

**Still unverified, and worth one look in the Apps Script UI:** whether more than one web-app
deployment is live. Maysa's 27–28 Aug sittings produced session rows while Luke's never have, which
is hard to explain from one deployment. **Deploy → Manage deployments** lists them; there should be
exactly one, and its URL must match `SHEET_SYNC_ENDPOINT` in `sheet-sync.js`.

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
    // gate.js releases its login with navigator.sendBeacon when a tab closes.
    // It is not a completion, so it must never reach the Homework/Sessions tabs.
    if (data.action === 'lease') return leaseReply_(lease_(data));
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
    // writing the per-question detail is caught here, on purpose: a Questions tab
    // that is missing a set is a nuisance, a Homework tab that is missing a set is a
    // hole in the record.
    //
    // BUT IT IS NO LONGER SWALLOWED. Until 8 Sep 2026 this catch block was empty, and
    // appendQuestions_ failed silently for weeks: the reply said 'ok', the session rows
    // kept arriving, and nobody could see that the per-question detail had stopped.
    // The reply now names the error. The client still cannot read it — the POST is
    // `no-cors` — but a hand-run smoke test can, and that is the whole point: one curl
    // or one fetch from the console now tells you what is actually wrong, instead of
    // 'ok'. Do not put the empty catch back.
    var qErrMsg = '';
    try { appendQuestions_(ss, data, loggedAt, focus); }
    catch (qErr) { qErrMsg = ' | questions failed: ' + qErr; }

    return ContentService.createTextOutput('ok' + qErrMsg);
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
  'Seconds', 'On text', 'On options', 'Prediction', 'Crossed out'];

function appendQuestions_(ss, data, loggedAt, focus) {
  var qs = Array.isArray(data.questions) ? data.questions : [];
  if (!qs.length) return;

  // Column A is the documented join key back to the session row. Every question row
  // logged between 24 Aug and 7 Sep 2026 has it BLANK, which cost the ledger the
  // ability to date any of Luke's work at all. Whatever reached this function with no
  // usable Date, it must never write an empty timestamp again: fall back to now, which
  // is wrong by milliseconds rather than wrong by everything.
  var at = (loggedAt instanceof Date && !isNaN(loggedAt)) ? loggedAt : new Date();

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
  } else if (sheet.getLastColumn() < QUESTION_COLUMNS.length) {
    // A tab created before a column was added (5 Oct 2026: "Crossed out") keeps its old
    // header row. Write only the missing header cells, so old rows stay aligned and the
    // new column is named.
    var have = sheet.getLastColumn();
    sheet.getRange(1, have + 1, 1, QUESTION_COLUMNS.length - have)
         .setValues([QUESTION_COLUMNS.slice(have)]).setFontWeight('bold');
  }

  var student = data.student || '(unknown)';
  var type    = data.type || 'session';
  var rows = qs.map(function (q, i) {
    return [
      at, student, type, focus, i + 1,
      val_(q.id), val_(q.skill), val_(q.difficulty),
      val_(q.chosen), val_(q.correct),
      (q.isCorrect === undefined || q.isCorrect === null) ? '' : !!q.isCorrect,
      val_(q.secs), val_(q.onText), val_(q.onOpts),
      // Untimed sets ask her to TYPE the reasoning; this column is the reason the
      // tab exists. Keep it last — it is long, and it should not push the numbers
      // off the right-hand edge of the screen.
      val_(q.prediction),
      // eliminator.js (5 Oct 2026): the letters she crossed out, and a flag when the
      // RIGHT answer was among them at any point — eliminating on "sounds wrong".
      // Last, so every column before it keeps the position old rows already have.
      (q.elim || '') + (q.elimAnswer ? ' (crossed out the answer)' : '')
    ];
  });
  // setValues writes into the EXISTING grid and throws if the range runs off the
  // bottom of it — unlike appendRow, which grows the sheet for you. A tab whose spare
  // rows have been deleted (tidying a log tab is the most natural thing in the world)
  // therefore stops accepting question rows the moment it fills up, and every failure
  // after that is one line of red in a log nobody reads. Grow the grid first.
  var firstRow = sheet.getLastRow() + 1;
  var overflow = (firstRow + rows.length - 1) - sheet.getMaxRows();
  if (overflow > 0) sheet.insertRowsAfter(sheet.getMaxRows(), overflow);

  sheet.getRange(firstRow, 1, rows.length, QUESTION_COLUMNS.length)
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
  if (p.action === 'lease') return leaseReply_(lease_(p), p.callback);   // gate.js — see section 3
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

// ---- 3. One login at a time ---------------------------------------
// gate.js asks for a LEASE on a student's name the moment a student password
// is accepted, and keeps it alive with a beat once a minute. One live lease per
// name: a second tab, browser or device asking for the same name while a lease
// is live is REFUSED, not given a takeover. A lease not beaten for
// LEASE_TTL_SEC is dead, so a laptop that sleeps frees the name on its own.
//
// Two tabs you can read and edit:
//   Active Logins — one row per student. A blank Token means "not logged in".
//                   To free a stuck login, clear that student's Token cell.
//   Login Log     — granted / refused / lost, with the time.
//
// Tutor sessions never ask for a lease. This is a deterrent against sharing a
// login, not security: the gate runs in the browser. The log is the useful part.
// Same logic as the sister app's lease_() in rw-apps-script.md; this script has
// none of that one's helpers, so it carries its own.
var LEASE_TAB         = 'Active Logins';
var LEASE_LOG_TAB     = 'Login Log';
var LEASE_TTL_SEC     = 150;   // two missed beats (gate.js beats every 60s)
var LEASE_GRACE_SEC   = 20;    // how long a released lease still answers to its own token
var LEASE_COLUMNS     = ['Student', 'Token', 'Since', 'Last seen', 'App'];
var LEASE_LOG_COLUMNS = ['Timestamp', 'Student', 'Event', 'Token', 'Detail'];

function lease_(p) {
  var op      = String(p.op || '');
  var student = String(p.student || '').replace(/[^A-Za-z '\-]/g, '').trim().slice(0, 24);
  var token   = String(p.token || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 64);
  if (['acquire', 'beat', 'release'].indexOf(op) < 0) return { ok: false, error: 'bad op' };
  if (!student || !token) return { ok: false, error: 'missing student or token' };

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);                         // two tabs asking at once must not both win
  try {
    var sheet = leaseTab_(LEASE_TAB, LEASE_COLUMNS);
    var W = LEASE_COLUMNS.length;               // Student, Token, Since, Last seen, App
    var now = new Date();

    var last = sheet.getLastRow(), rowNo = 0, row = null;
    if (last >= 2) {
      var vals = sheet.getRange(2, 1, last - 1, W).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (String(vals[i][0]).trim().toLowerCase() === student.toLowerCase()) { rowNo = i + 2; row = vals[i]; break; }
      }
    }
    var heldBy = row ? String(row[1] || '').trim() : '';
    var seen   = row ? leaseTime_(row[3]) : 0;
    var live   = !!heldBy && seen > 0 && (now.getTime() - seen) < LEASE_TTL_SEC * 1000;
    var mine   = live && heldBy === token;

    function write(tok, since, lastSeen) {
      if (!rowNo) rowNo = sheet.getLastRow() + 1;
      sheet.getRange(rowNo, 1, 1, W).setValues([[
        row ? row[0] : student, tok, since, lastSeen, tok ? String(p.app || 'PSAT 8/9 R&W').slice(0, 40) : ''
      ]]);
    }

    // A release is sent on EVERY pagehide, including moving from one page of the
    // app to the next, so it must not free the name outright or write a log row.
    // The lease is aged to die LEASE_GRACE_SEC from now instead: the same tab
    // walks straight back in, a closed tab frees the name shortly after.
    if (op === 'release') {
      if (live && heldBy === token) {
        write(heldBy, row[2], new Date(now.getTime() - (LEASE_TTL_SEC - LEASE_GRACE_SEC) * 1000));
        return { ok: true, released: true };
      }
      return { ok: true, released: false };     // not ours: never free someone else's login
    }

    if (mine) {                                 // a beat, or a new page in the same tab
      write(token, row[2] || now, now);
      return { ok: true };
    }

    if (live) {                                 // somebody else holds it — refuse
      var idle = Math.round((now.getTime() - seen) / 1000);
      leaseLog_(student, op === 'beat' ? 'lost' : 'refused', token,
                'held by ' + heldBy.slice(0, 6) + ', last seen ' + idle + 's ago');
      return { ok: false, reason: 'held', idleSecs: idle, ttlSecs: LEASE_TTL_SEC };
    }

    write(token, now, now);                     // free, or the old lease went stale
    leaseLog_(student, 'granted', token,
              op === 'beat' ? 're-claimed on a beat' : (heldBy ? 'previous login had expired' : ''));
    return { ok: true, granted: true };
  } finally {
    lock.releaseLock();
  }
}

function leaseTab_(name, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, cols.length).setValues([cols]);   // setValues, not appendRow: see the note above QUESTION_COLUMNS
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function leaseTime_(v) {
  if (!v) return 0;
  var t = (v instanceof Date) ? v.getTime() : new Date(v).getTime();
  return isNaN(t) ? 0 : t;
}

function leaseLog_(student, event, token, detail) {
  var row = [new Date(), student, event, String(token || '').slice(0, 6), detail || ''];
  leaseTab_(LEASE_LOG_TAB, LEASE_LOG_COLUMNS).appendRow(row);
}

/** JSON for the beacon, JSONP for the gate. The callback name is validated. */
function leaseReply_(obj, callback) {
  var cb = String(callback || '');
  if (/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to create the two tabs (they also appear on first use). */
function setupLogins() {
  leaseTab_(LEASE_TAB, LEASE_COLUMNS);
  leaseTab_(LEASE_LOG_TAB, LEASE_LOG_COLUMNS);
}
```
