# The unfinished-sitting flush — applied to BOTH apps, 25 Aug 2026

**Status: done in both.** `PSAT 8-9/app` and `MasteryApp` (SAT R&W). Both full suites green.
This file is the record of what changed and, more importantly, **where the two had to diverge**.

> `AGENTS.md`: *"It runs the **same homework engine from separate files**. There is no shared module —
> a fix to `homework-run.html` here is not a fix there. **Change one, change both, and run both test
> suites.**"*

---

## The bug

The mastery ledger is written **per question**, the moment an answer is committed. The sheet was
written **once**, at the end of a set. In practice mode that end is reachable only by pressing **Next
past the last question**; in **untimed** homework, only by advancing past the last question. Neither
mode has a Submit button.

So a sitting that was fully answered and then navigated away from wrote everything locally and sent
the tutor **nothing**. `mode:'no-cors'` makes the response opaque, so a post that never happens looks
identical to one that succeeded.

It bit for real: two complete sessions in one lesson, one reached the sheet. It was found by comparing
the sheet against the lesson, not by anything in the app. **Untimed sets carry the typed
predictions**, which made this the expensive version rather than the cheap one.

---

## What changed, in both apps

| File | Change |
|---|---|
| `history.js` | Session id + `_sessionLogged` / `_partialLogged` hoisted to **sitting** scope; `logSession` stamps the id and sets `_sessionLogged`; new **`logPartialSession()`** |
| `app.js` | `launchSession()` mints a fresh id; `initSessionFlush()` registers the **`pagehide`** handler |
| `storage.js` | `saveSessionState` persists `sessionId` + `partialLogged`; `restoreSession` replays them |
| `sheet-sync.js` | Names the new payload keys — that object is built key by key and **drops anything unnamed** |
| `homework-run.html` | `postLog(secs, partial)`; `pagehide` handler; **`keepalive: true` added** |
| `session-flush.test.js` | New suite, added to each app's `AGENTS.md` run list |
| `AGENTS.md` | The rule, written down beside "running out of time must not destroy the set" |

Three properties `logPartialSession()` keeps in both:

- **Only committed answers.** A blank is not a result; an uncommitted selection is not an answer.
- **It does not touch local history.** An unfinished sitting is not a result and must not fill the
  hub's history list with fragments. It exists so the tutor sees the work, nothing more.
- **It marks itself.** A partial row that looks complete is worse than no row, because it
  under-reports a set the student may yet finish.

### Two things that are not negotiable

**`pagehide`, never `visibilitychange`.** These sessions are screen-shared and tab-switched
constantly; `visibilitychange` would post a row on every alt-tab. `pagehide` fires on navigate-away
and on close, which is the case that loses data. `session-flush.test.js` asserts the absence.

**`keepalive: true` on both fetches.** Without it the browser cancels the request mid-unload and the
whole handler is theatre. The PSAT homework runner **never had it** — so even a *finished* set
submitted as the tab closed could vanish. That is a second, older bug this fixed in passing.

---

## ⚠️ Where the two apps deliberately differ

### 1. The Session ID — this is the important one

**PSAT 8/9:** the backend has no dedupe. The partial and the later complete row **share** a
`sessionId`; the tutor prefers the one without the marker.

**MasteryApp:** `sessionId` is an **idempotency key** — `seenSessionIds_` in `rw-apps-script.md` skips
an id it has already stored, **first write wins**. A shared id would store the fragment and then
discard the real result as a duplicate: the exact data loss being fixed, inverted.

> So in MasteryApp the partial posts under **`<sessionId>_partial`**. Both rows land, dedupe still
> protects a genuine re-POST of either, and the shared prefix is what joins them.
> `session-flush.test.js` pins this in both apps, each to its own contract.

MasteryApp's `sessionId` was previously minted *inside* `logSession` — one per post. It is now one per
**sitting**, because a partial flush needs an id that exists before the session ends and survives a
resume.

### 2. Where the INCOMPLETE marker lives

**PSAT 8/9:** in **`focus`** → the "Day / Focus / Skills" column. Its backend is eight **fixed**
columns whose headers are only written when the sheet is empty; a ninth would need a script change
*and* a redeploy before it was visible. `focus` was also never sent from `sheet-sync.js` at all, so
that column had always fallen back to the skill list — fixed in passing.

**MasteryApp:** in **`assignmentTitle`** → the "Assignment" column, which is empty for a practice
session anyway. Both apps also send `partial: true` in the body.

### 3. The optional follow-up, MasteryApp only

Its backend has a real `EXTRA_COLUMNS` array and an `ensureHeaders_`, so a **`Partial`** column can be
added without a manual migration and would make it filterable. Documented in place in
`rw-apps-script.md` with the reason it is not already done: it costs a redeploy. **The note also warns
against "tidying" the two ids into one** — that would re-break dedupe.

The PSAT script has no such array. `psat-apps-script.md` is explicit: *"`PEDAGOGY_ALIGNMENT.md` used to
tell you to add `'Retention'` to an `EXTRA_COLUMNS` array here — there is no such array, and there
never was. Do not copy instructions between the two scripts without reading both."*

---

## Fixed in passing

- **PSAT homework `postLog` had no `keepalive`.** See above.
- **`focus` was never named in the PSAT payload**, so the column fell back to the skill list for every
  practice session ever logged.
- **Four stale `?v=` cache tags in each app** — `baseline-grade.js` and `baseline-store.js` tagged
  `20260822`, changed `20260823`. Pre-existing and unrelated, but `cache-tags.test.js` was red in both
  and a red suite stays red. Returning browsers were being served the old baseline code.
- **MasteryApp's homework fixture** gained `partial`, keeping `capture-fixtures.js` and
  `fixtures.json` in step with what the runner actually posts. Its schema guard caught the drift
  immediately — which is the guard working exactly as intended, and is a guard the PSAT app lacks.

---

## What this does NOT fix

**The missing `Sessions` row from 24 Aug is still open**, and it is a different problem. That session
*did* post — its per-question rows are in the sheet — so the fault is server-side, and it needs the
Apps Script execution log — the diagnosis for it is in the tutor's own notes, not here. **Do not read
this patch as having closed it.**

**A partial followed by a real finish still produces two rows** in both apps. They are joinable and
only one is marked, but nothing supersedes the other yet. In MasteryApp a `Partial` column plus
supersede-by-prefix is the natural next step; the PSAT app needs a backend redeploy regardless.

---

## Before this reaches a student

Both apps are static sites with no build step — **the `?v=` tag is the entire cache-busting
mechanism.** The tags are bumped to `20260825`; bump them again if these files change before the
commit lands, or returning browsers keep running the old code and nothing errors.

Then verify for real: start a practice set, answer two questions, **close the tab**, and confirm one
row appears marked INCOMPLETE with the shortfall in it.
