# Pedagogy Alignment — PSAT 8/9 R&W app

> **The backlog that carries this app to 100% handbook alignment.** Implementation-ready: every item
> says *what, why, where, how,* and *how to prove it.* Work top to bottom — items are ranked by
> learning impact per unit of effort, not by difficulty.

**Read first:** [AGENTS.md](AGENTS.md) (this app's mechanics) · root [AGENTS.md](../../AGENTS.md)
(the house rules — *whether*) ·
[Pedagogical-Design-Handbook.md](../../Pedagogical-Design-Handbook.md) (the *why*, by ID). The
full evaluation this backlog comes from is the "app-pedagogy-eval" artifact.

> **Sister app:** `SAT GUIDES/WAYNE/MasteryApp` runs the same engine from separate files and carries
> an identical copy of this backlog. **Every change here is a change there. Do both, keep both files
> in sync, run both test suites.**
>
> **The one standing exception is the tutor sheet** (§3). The two apps post to *different Apps
> Scripts with different schemas*: this one writes eight fixed columns with a `Raw payload` catch-all,
> the sister writes named columns with a `Questions` tab. **`tutor-dashboard.html` and `tutor-sheet/`
> must NOT be mirrored between them** — copying the sister's column map onto this app is exactly the
> bug §3 documents, and it has already happened once. Everything else (the runner, the ladder,
> `progress.js`) still moves in lockstep.

---

## Where this app stands (16 Jul 2026)

The reference implementation — closest of the three app families to the handbook. The active loop
*is* the product: prediction-before-options (retrieval), un-telegraphed interleaved quizzes,
untimed→timed, a redo that never overwrites the clocked attempt, real spaced retrieval, and — since
this session — a durable-learning metric and difficulty that calibrates itself toward ~85%.

| Category | Status | |
|---|---|---|
| Cognitive load | ◐ partial | scaffolding fades untimed→timed |
| Memory & retention | ● solid | spacing ladder + `sections` interleaving |
| Mastery & sequencing | ◐ partial | tutor-authored, not graph-gated (by design) |
| Assessment & feedback | ● solid | immediate, un-telegraphed, truth-preserving |
| Motivation & UX | ◐ partial | honest progress; no gamification |
| Adaptive & analytics | ● solid | rich diagnostics **and** a retention metric |

Items 1 and 2 are **shipped**. Item 3 is by design and is documented, not built. What is left is one
follow-on that needs the tutor, in §4.

---

## 1 · Measure retention, not just acquisition — `AN-4`, `MR-8` · **SHIPPED 16 Jul 2026**

**The gap it closed.** The app recorded whether an answer was right, but never whether it was right
*after a delay*. So it could not tell "learned and retained" from "learned and forgotten" — the exact
claim the monthly reports make to parents. The spacing ladder *created* delayed retrievals; nothing
*counted* them.

**What shipped.**
- `progress.js` — a sibling store, `psat89_retention_<user>`, shape `{ [skill]: { correct, total } }`.
  `recordAnswer(id, isCorrect, source, meta)` takes a 4th argument, `{ skill, review }`, and tallies
  retention only when `review` is true. `getRetention()` returns
  `{ bySkill: { [skill]: {correct,total,rate} }, overall: {…} }` — **rates always ship with their
  counts**, because "100%" off one retrieval is not a retention claim and a surface that cannot say
  `1/1` will imply it was. `mergeRetention()` + `resetLedger()` clear-down.
- `homework-run.html` — tags the `dueForReview()` picks (`_isReviewQ`) and passes
  `{ skill, review }` on every answer. The student is **never** told which questions are reviews: a
  flagged question is answered differently, and the measurement would be of the flag, not the memory.
- `progress.html` — a **Retention** summary cell next to Overall accuracy, and a per-skill **kept
  N% (c/t)** figure next to each accuracy bar. The pair is the point: a 90% bar beside a 50% kept is
  practice landing and memory not.
- `storage.js` — backup and restore carry `retention`.

**Why `meta` rather than the `source: 'review'` this backlog originally specified.** `source` says
*where* an answer happened (`practice` / `exam` / `homework`); `review` says *why the question was
drawn*. Folding them together would have lost provenance and broken the exam-counts-double rule for
any review inside an exam. They are orthogonal, so they are separate arguments.

**What does NOT count, and why each one would flatter the number:** a first attempt (that is
acquisition), a redo (untimed, notes open — not a memory test), and any legacy 3-argument caller.
`homework/review-ladder.test.js` §10–11 holds all of it.

---

## 2 · Calibrate difficulty toward ~85% success — `AS-4` · **SHIPPED 16 Jul 2026**

**The gap it closed.** Difficulty was whatever the tutor typed into the day. Nothing nudged a
cruising student up or an overloaded one down toward the ~85%-success band where learning is
maximised.

**What shipped.**
- `progress.js` — `getSkillAccuracy()` rebuilds rolling per-skill accuracy from the trap buckets
  (the only per-skill record the app keeps; the mastery ledger is keyed by question id and does not
  know a question's skill). `recommendDifficulty(skills)` takes a name or an array and returns a
  **bias**, never a difficulty: `>0.90 → 'up'`, `<0.80 → 'down'`, else `'hold'`.
- `homework-run.html` — `_calibratedPick()` replaces `_pick()` in the section builder. A section
  listing a **range** (`diffs:["Medium","Hard"]`) leans ~70% of its count toward the target end and
  still mixes the other in; the result is shuffled so the section does not serve a Hard block then a
  Medium block, which is the blocking `sections` exists to prevent.
- `homework-run.html` also now calls `recordTrapOutcome()` — **homework never fed the per-skill
  stats; only the practice app did.** The trap analytics, and calibration with them, were blind to
  the work the students actually do most of. This was not in the original plan for this item and is
  what makes it work at all.

**Two design calls this backlog did not specify.**
- **`MIN_CALIBRATION_ATTEMPTS = 8`.** 3-for-3 on a skill is a coin landing heads three times, not
  evidence of cruising. Under the threshold it holds, so a student's first day on a new skill runs
  exactly as authored.
- **It leans, it does not lurch** (`CALIBRATE_LEAN = 0.7`). A cruising student gets harder work, not
  a wall; a drowning one gets relief, not a demotion.

**The guardrails, and where they are held.** Calibration only ever acts inside a range the tutor
allowed; a day that pins one difficulty is a decision, not a range, and is untouched. The per-skill
exact count survives calibration even when the leaning end is thin. `homework/homework-run.test.js`
§11 drives the real page and asserts all three.

---

## 3 · Retention on the tutor dashboard — `AN-4` · **SHIPPED 17 Jul 2026 · NOTHING LEFT TO DO**

> ### ✅ No redeploy. No manual step. It reads your back-history.
> **The 16 Jul entry that stood here was wrong on both of its claims, and acting on it would have
> wasted an afternoon.** It said this app's Apps Script source "exists in neither repo" and told the
> tutor to add `'Retention'` to `EXTRA_COLUMNS` plus a row-builder line, copying the sister app.
>
> - **The source was never missing.** It was `PSAT 8-9/Tutor Backend (Apps Script).gs` — one directory
>   *above* the `app/` git repo, which is why a search inside the repo concluded it did not exist. It
>   is now checked in at [`tutor-sheet/psat-apps-script.md`](tutor-sheet/psat-apps-script.md), verified
>   against the live endpoint (its `doGet` reply is byte-identical, and it answers `?action=plan`), and
>   the loose root copy was deleted on 17 Jul 2026 so the two can never drift.
> - **The prescription was for a different script.** There is no `EXTRA_COLUMNS` here, no
>   `ensureHeaders_`, no named-column row builder. Those two lines have nothing to attach to. This
>   backend writes eight fixed columns:
>   `Logged at · Student · Type · Day / Focus / Skills · Score · Total · Seconds · Raw payload`.
>
> **And the data was never missing either.** `Raw payload` holds the entire posted JSON, so
> `retention` has been landing in the sheet since the day the client started posting it. The fix was
> to *read* it. That is why this needs no redeploy and works on every row already logged — a schema
> change to the script could only ever have started collecting from deploy day.

The retention pair now reaches the tutor without the student's device:

- `homework-run.html` — `sessionRetention()` tallies the session's delayed retrievals per skill and
  posts them as `retention`. Same rules as the ledger's own counter, because two numbers for one
  thing that disagree are worse than one: only questions the ladder chose, and **only ones actually
  reached** — `finish()` backfills not-reached questions as `ok:false` so the review screen can show
  them, and counting those would report a student as forgetting work they never saw.
- The Apps Script — **unchanged, and deliberately so.** It already stores everything.
- `tutor-dashboard.html` — accuracy and retention as one framed reading, per student and overall.

**Blank is not zero, and the UI says so.** No review due means "we don't know yet". A `review: 0`
plan never generates any.

### What this uncovered — the dashboard has been wrong about its own sheet TWICE

Both times it rendered blanks rather than failing, because a missing column returns `''` instead of
throwing — so it looked exactly like a tutor with no data.

1. **It asked for the *payload's* field names** (`pct`, `date`, `blurCount`, `skillStats`) when a
   sheet's headers are the Apps Script's.
2. **The 16 Jul "fix" copied the sister app's headers** (`Percent`, `Timestamp`, `Focus Losses`,
   `Breakdown`) — which **this sheet has never had either**. The map was corrected onto the wrong
   sheet. Only `Student`, `Type`, `Score` and `Total` ever matched by luck; date, percent,
   tab-switches, "Weakest" and retention all still rendered blank.

Fixed properly on 17 Jul: `COL` now lists **this** sheet's names first, and anything without a column
of its own is read out of `Raw payload`. Three readings are derived rather than shown as `—`, and
each is arithmetic on real numbers, never an invented one:

- **Percent** — homework posts `score`/`total` and no `pct`, so every homework row read `—`.
- **Pace** — practice posts `avgSecs`, homework posts whole-session `seconds`.
- **The per-skill breakdown** — practice posts `skillStats`; homework posts none, but its `questions`
  array carries every question's skill and outcome. Deriving it is what lets **"Weakest" see homework
  at all**, and homework is most of the work the students actually do. (Precisely the blind spot §2
  found in the app itself: the per-skill picture was built only from practice, the smaller half.)

**Accuracy is now summed as marks over marks, not averaged across sessions.** A mean of session
percentages lets a 6-question day weigh as much as a 20-question mock, and it was not comparable with
retention beside it, which is a true `c/t` ratio. Comparing two differently-computed numbers and
calling the difference a finding is how a report says something false while looking careful.

**`tutor-sheet/tutor-dashboard.test.js` (31 assertions) now guards all of it, and it does not trust
this document**: it parses the header row **out of the checked-in script** and fails if the dashboard
stops being able to read what the backend writes. That is the guard whose absence let this file
assert a fix that had never worked.

**The sister app found two further live bugs in the shared tooling** — the per-question predictions
never reaching the sheet, and two rotten guards. Both live in
`SAT GUIDES/WAYNE/MasteryApp/tutor-sheet/`, which this repo does not carry. Read that app's §3 before
touching this one's sheet, because this app has no `apps-script.test.js` to catch the same class of
bug: its script is not in version control.

---

## 4 · Mastery gating — `M5`, `CD-2` · **by design; documented, not built**

This app gates on mastery through *tutor discipline* (`assignments.js` only names taught skills) plus
the student's `LEDGER.md`, not through a code-enforced knowledge graph. That is the deliberate
architecture: the tutor authors the path. **Do not "fix" this into automated gating** without a
decision — it would be a re-architecture, and the tutor's judgement is the feature. The one code
guard already exists: `assignments.test.js` fails on empty/thin pools. Leave this here as a known,
accepted stance, not a task.

---

## The bar for anything new (future-proofing)

Any new skill, question bank, homework shape, or feature added to this app must clear this before it
ships — this is the handbook's §19 checklist, scoped to here:

- [ ] **Attempt before answer.** The predict-first gate is never bypassed for a new question type.
- [ ] **Mixed, not blocked.** A multi-skill day uses `sections`. A new bank has enough Medium *and*
      Hard to interleave and to calibrate (guarded by `bank.test.js`).
- [ ] **Enrolled in spacing.** Any new practice surface records answers through `progress.js` so the
      ladder schedules them. Nothing is "answer once and done."
- [ ] **Measured, and honestly.** A new surface passes `{ skill, review }` to `recordAnswer`, so its
      delayed retrievals count toward retention and its first attempts never do. If it can be
      answered with notes open or after the answer has been seen, it counts as neither.
- [ ] **Un-telegraphed assessment.** No new quiz previews its contents, and none goes timed before the
      student has untimed competence.
- [ ] **No answer-revealing help.** A new hint coaches the next move; it never contains the answer.
- [ ] **Truth preserved.** A new redo/retry path never overwrites the first clocked attempt.
- [ ] **Nothing student-readable assesses the student** (`assignments.js` is public — root rule 6).
- [ ] **A test guards it.** If it broke silently, there is a `*.test.js` that now fails.

## Definition of 100% aligned

**Reached, in code *and* in fact, on 17 Jul 2026.** Items 1, 2 and 3 are shipped and green;
acquisition and retention sit side by side both on `progress.html` (with the student) and on
`tutor-dashboard.html` (when writing the report). Every handbook category above is ● except
mastery-gating, which is ◐ **by choice** and documented in §4.

**Nothing is outstanding on the tutor's side.** The 16 Jul claim that a manual Apps Script edit stood
between this app and alignment was a misdiagnosis (§3): the script was never missing, it never needed
the column, and the retention data was already in the sheet. It is now checked in at
`tutor-sheet/psat-apps-script.md` and a test parses its headers — an unversioned script is exactly how
the sister app lost its per-question predictions for months without one test going red, and how this
file came to assert a fix that had never worked.

**Verification, 17 Jul 2026** — all five suites green, 291 assertions:
`assignments` 116 · `bank` 6 · `review-ladder` 51 · `homework-run` 73 · `tutor-dashboard` 45.
Note that they **skip silently without jsdom**, and a `SKIP` reads a great deal like a pass in a
terminal. Install it before you believe them — on 17 Jul all five had been skipping while this file
asserted they were green.

## A note on the storage namespace

Nothing to do here. This app has always used the app-level `psat89_` prefix. The sister app's keys
carried a legacy `wayne_` prefix, inherited from the directory that app was first built in and
belonging to nobody. They were
renamed to `satrw_` on 16 Jul 2026 behind a one-shot migration. If you ever rename these, read
`SAT GUIDES/WAYNE/MasteryApp/ns-migrate.js` first: the risk is never the rename, it is the students'
existing keys, and a rename without a migration wipes every ledger silently.

## What this leaves for the tutor to notice

**The dashboard is at `tutor-dashboard.html`, and nothing links to it** — it was built and never put
in any nav, which is why it went unnoticed long enough to be wrong twice. Open it directly, locally or
at the Pages URL.

**Feed it a downloaded CSV, not a published one.** `File → Download → CSV`, once per tab, then pick
the files. The backend writes homework to a `Homework` tab and practice/mocks to a `Sessions` tab, and
both matter: **retention is only ever posted by homework**, while tab-switches and the practice
breakdown only come from sessions. One tab gives a real but partial read — and a partial read that
looks complete is the thing this file keeps having to apologise for.

The URL path still works and auto-refreshes, but **"Publish to web" is an unlisted URL, not a private
one**, and that sheet carries minors' names, scores and per-question history. The file path was added
17 Jul 2026 so the convenient option is not the only option. Nothing is uploaded; the read is local.

**The dashboard is tutor-only as of 17 Jul 2026** (`GATE_REQUIRE = 'tutor'`). It previously loaded the
same gate as the app, whose passwords are the students' own first names — so any student could open a
page showing every student's record, which is rule 6 exactly. Note what this gate is: a **deterrent**.
The repo is public, so every hash in `gate.js` is readable. The protection that actually holds is that
no student data is published in the first place.

Retention starts at `—` and stays there for days: it can only count questions the ladder brings
*back*, so it earns its first data point one rung after a question is first answered. **An empty
retention figure is not a bug and not a zero.** It is the honest state of "we do not know yet", which
is the state the app was silently asserting an answer to before this.

The gap sentence under the pair **stays silent below 5 spaced reviews.** A confident sentence about
a 1-of-2 sample is noise wearing a lab coat, and it is exactly the "reads as diligence while being
false" line the house rules forbid.

Calibration is quieter still. It does nothing until a skill has 8 attempts, and nothing at all on a
day that pins one difficulty — which, today, is nearly every day in `assignments.js`. **To actually
use it, author a day with a range** (`diffs:["Medium","Hard"]`) and let the student's record pick the
end.

**The `HW_USE_SHEET` landmine is defused** (17 Jul 2026). Found while reading the backend for §3:
`buildPlan()` understands `skills/diffs/count/minutes/tip` and **not `sections`**, so a sheet-authored
day naming more than one skill would have arrived as one pool and silently collapsed to a single
skill — the failure `AGENTS.md` calls the one that bites hardest. Every rule protecting against that
is enforced on `assignments.js`, which the sheet path bypasses entirely; it was the one door left
open, and the flag being `false` was all that stood in front of it.

`hwNormalizeSheetPlan()` now splits any multi-skill sheet day into an exact count per skill before
the runner ever sees it. It is on the **client** on purpose: no redeploy, and `assignments.test.js`
can watch it — a fix living only in an Apps Script is a fix nothing tests, which is the whole of §3.
The flag stays `false` (the file plans are what the tutor actually writes), but flipping it is no
longer dangerous. A sheet day still cannot say `review:`, so it takes the default dose of 2.
