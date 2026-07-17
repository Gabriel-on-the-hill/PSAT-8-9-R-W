# PSAT 8/9 R&W — Tutor Backend (Apps Script)

**This is the source of the script that is actually deployed.** Verified 17 Jul 2026 against the
live endpoint in [sheet-sync.js](../sheet-sync.js): its `doGet` reply is byte-identical to the
`'PSAT 8/9 R&W backend is running.'` string below, and it answers `?action=plan&student=…` with JSONP.

> **It is not the sister app's script.** `SAT GUIDES/WAYNE/MasteryApp/tutor-sheet/rw-apps-script.md`
> is a different script for a different sheet, with named columns, an `ensureHeaders_`, a `Questions`
> tab and a `Retention` column. **This one has none of those.** `PEDAGOGY_ALIGNMENT.md` used to tell
> you to add `'Retention'` to an `EXTRA_COLUMNS` array here — there is no such array, and there never
> was. Do not copy instructions between the two scripts without reading both.

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
    sheet.appendRow([new Date(), data.student || '(unknown)', data.type || 'session',
      focus, (data.score != null ? data.score : ''), (data.total != null ? data.total : ''),
      (data.seconds != null ? data.seconds : ''), JSON.stringify(data)]);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
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
