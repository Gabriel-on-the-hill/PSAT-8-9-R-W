# Working on this app

A no-build static site. Open the HTML, edit it, reload. No bundler, no package.json.

**Sister app:** `SAT GUIDES/WAYNE/MasteryApp` (SAT R&W). It runs the **same homework engine from
separate files**. There is no shared module — a fix to `homework-run.html` here is *not* a fix
there. **Change one, change both, and run both test suites.**

## Run the tests before you claim anything works

**This is the whole list. If a suite is not on it, it does not get run — and a suite nobody runs
goes red and stays red.** The five `baseline*.test.js` suites were missing from this list from the
day they were written. Three weeks later two of them were failing: the ranked focus queue the
whole screener exists to produce was being written to `localStorage` and posted nowhere, and the
sheet could not tell a first sitting from a retake. Both had been true since the module shipped,
and a rebuild note in the project folder was still claiming "85 tests passing" — which was the
count of the three suites that existed when it was written.

```
npm install jsdom --prefix /tmp/j
NODE_PATH=/tmp/j/node_modules node homework/homework-run.test.js      # the learning loop
NODE_PATH=/tmp/j/node_modules node homework/assignments.test.js       # the plans are sane
NODE_PATH=/tmp/j/node_modules node homework/bank.test.js              # the bank is classified right
NODE_PATH=/tmp/j/node_modules node homework/review-ladder.test.js     # spacing + calibration
NODE_PATH=/tmp/j/node_modules node homework/homework-nav.test.js      # moving inside a homework set
node homework/hub-count.test.js                                      # the card matches the set served
NODE_PATH=/tmp/j/node_modules node challenge/challenge-core.test.js   # challenge tally + set building
NODE_PATH=/tmp/j/node_modules node challenge/challenge-ui.test.js     # the challenge, driven for real
NODE_PATH=/tmp/j/node_modules node ratio-mix.test.js                 # custom practice in a ratio
NODE_PATH=/tmp/j/node_modules node ruletype.test.js                  # Conventions tagged by rule
NODE_PATH=/tmp/j/node_modules node gate.test.js                      # tutor pages stay tutor-only
NODE_PATH=/tmp/j/node_modules node session-responses.test.js         # moving between questions
NODE_PATH=/tmp/j/node_modules node session-nav.e2e.test.js           # ... in the real runner
node session-flush.test.js                                           # an unfinished sitting still reports
NODE_PATH=/tmp/j/node_modules node baseline.test.js                  # forms, bands, routing, weights
NODE_PATH=/tmp/j/node_modules node baseline-store.test.js            # the record survives the page
NODE_PATH=/tmp/j/node_modules node baseline.e2e.test.js              # the screener, driven for real
NODE_PATH=/tmp/j/node_modules node baseline-sync.test.js             # the tutor actually receives it
NODE_PATH=/tmp/j/node_modules node baseline-recover.test.js          # a stranded baseline can be sent
NODE_PATH=/tmp/j/node_modules node tutor-sheet/tutor-dashboard.test.js # the dashboard can read the sheet
node cache-tags.test.js                                              # students get the CURRENT files
```

They skip cleanly without jsdom. Every one of them exists because something was silently
broken and nothing failed. Read a test's header before you change what it guards.

**Four suites were missing from this list until 6 Sep 2026** — `homework-nav`, `hub-count`,
`challenge-core` and `challenge-ui` — which is the same omission the paragraph above describes,
happening a second time to a different set of files. Three were green. **`challenge/challenge-ui.test.js`
is RED and has been since it was written on 11 Aug 2026:** the session never starts under jsdom, so
the exam-mode guard assertions fail and the run dies on `$(w,'nextBtn').click()` with `nextBtn`
undefined. It is a real failure in the test's own driving of the page, not something you just broke,
and it is on the list so that it gets fixed rather than forgotten again. **Do not delete it to make
the list green.**

**Put jsdom on a local disk, not in the repo folder.** The four `data-*.js` files are about a
megabyte and jsdom itself is thousands of small files; loading either across a mounted or synced
directory turns a three-second suite into a three-minute one. `--prefix /tmp/j` above is not
decoration. The e2e suites are genuinely slow regardless — each stands up a fresh jsdom and parses
the whole bank — and Node buffers to a pipe, so they print nothing until they finish. Slow, not
hung.

**`SKIP` is not a pass, and it looks like one.** Without jsdom every suite above prints
`SKIP` and exits 0. On 17 Jul 2026 all five had been skipping while a doc asserted they
were green. Check the last line says `ALL n ASSERTIONS PASSED`.

## The tutor sheet is NOT shared with the sister app

`tutor-sheet/psat-apps-script.md` is the source of **this** app's deployed backend — eight fixed
columns (`Logged at · Student · Type · Day / Focus / Skills · Score · Total · Seconds · Raw payload`)
plus a JSONP `action=plan`. The sister's `rw-apps-script.md` is a **different script for a different
sheet** with named columns and a `Questions` tab.

So `tutor-dashboard.html` and `tutor-sheet/` are the one exception to "change one, change both."
Copying the sister's column map onto this app is a real bug that has already shipped once: it made
every figure render blank, which looks identical to a tutor with no data. `tutor-dashboard.test.js`
parses the header row out of the checked-in script so that drift fails loudly.

**`Raw payload` is load-bearing.** It holds the entire posted JSON, which is why the dashboard can
read retention with no redeploy and across the whole back-history. Anything the sheet has no column
for is read from there.

### The dashboard is tutor-only, and it is not a place to put secrets

It lists every student's accuracy, retention, weakest skills and tab-switches — an assessment, and
root rule 6 says a student never reads one, about themselves or anyone else. It declares
`window.GATE_REQUIRE = 'tutor'` **before** `gate.js`; the gate then accepts only the tutor passphrase
and, critically, re-prompts a session that is unlocked as a *student*. Before that, `mastery_unlocked`
just meant "somebody typed a valid password", so a student who had opened the app walked straight in.

**This gate is a deterrent, not security.** It is a public repo serving a static site: every hash in
`gate.js` is readable, and the student passwords are their own first names.

**Which makes the gate names the complete list of personal names this repo may contain.** Never add
another — not in code, a comment, a doc, a test fixture, or a **commit message**, which is as public
as the code and cannot be taken back. Never explain where a gate name came from, and do not
enumerate who the others are while discussing one: in the sister app at least one gate name is
deliberately *not* a real one, and subtracting the named from a known list is how the unnamed one
gets identified. The same discipline belongs here. Parts of both histories predate this rule and are
not precedent — the fix is to stop repeating a name, never to add a note pointing at it. The real protection is
that no student data is published — the dashboard ships with no data in it, and its preferred input
is a CSV file the tutor downloads, which never leaves their machine. "Publish to web" produces an
*unlisted* URL, not a private one. Do not put anything behind this gate that would harm someone if
opened, and do not add a student's name or result to a file in this repo.

## Assigning homework

**Edit `homework/assignments.js`. That is the only file.** The runner, the hub and the
progress engine are generic and read the plan from there. A brand-new student also needs a
one-time password entry in `gate.js`, but that is setup, not assignment.

### A day naming more than one skill MUST use `sections`

This is the rule that bites hardest, because breaking it fails *silently*.

A plain `skills/diffs/count` day builds ONE pool and takes the top N. The pool is ordered, so
the draw clusters. A real 7-question "mixed dress rehearsal" was serving **7 questions of a
single skill**. It looked completely fine in the file.

```js
// WRONG — silently collapses to mostly one skill
{ n:6, skills:["Words in Context","Inferences","Transitions"], diffs:["Hard"], count:6 }

// RIGHT — an exact count per skill
{ n:6, sections:[
    { skills:["Words in Context"], diffs:["Hard"], count:2 },
    { skills:["Inferences"],       diffs:["Hard"], count:2 },
    { skills:["Transitions"],      diffs:["Hard"], count:2 },
  ] }
```

`assignments.test.js` fails if you forget. It also checks the pool actually holds enough
questions for the count, and that the skill names resolve (they use an em dash — `Command of
Evidence — Textual` — not a hyphen).

### Misses come back, but only from a matching pool

`prioritizePool()` draws questions the student has missed first. But it only draws from a pool
matching the set's skill **and** difficulty. So a Medium miss will never reappear in a
Hard-only set. If you want this week's misses to come back before the next class, the later
days must keep Medium in scope alongside Hard.

### `review: N` — the one draw that crosses the filter

Every day also serves up to **2 review questions by default**, drawn by `dueForReview()` in
`progress.js` from the **whole bank**, and mixed into the set at random positions. Set
`review: 0` on a day whose job is to teach one brand-new skill and needs the full dose on it.
Set `review: 4` to lean harder on maintenance.

This exists because reordering a pool **cannot** bring back a question the day's filter already
removed — which is the limitation above, and it is structural. A due Text Structure question
cannot appear in a Words-in-Context pool at any sort order. Review has to be drawn against the
whole bank or it does not happen.

It is self-limiting. It only returns questions the student has **already attempted** and that the
review ladder says are genuinely **overdue**, so early in a plan it adds nothing and the set is
exactly as authored. It never serves an unseen question — a "review" block that hands a student an
untaught skill cold is not review.

**The ladder** (`progress.js`): a correct answer does not finish a question, it *schedules* it.
1 day → 3 days → 1 week → 3 weeks → 6 weeks, climbing one rung per consecutive correct. A miss
drops it to the bottom. `homework/review-ladder.test.js` guards it, and its header explains the bug
it exists to prevent: for months, a question the student had *learned* was demoted into a tier that
sat behind `unseen`, and with 719 questions in the bank and 6 to a set, **it was never drawn
again.** Nothing taught in April came back in May. Not because anyone decided that — because a tier
was in the wrong place and no test looked.

## The homework runner is a learning loop, not a quiz

Guarded by `homework/homework-run.test.js`. Do not remove these without a reason better than
"it's simpler":

**These are not UI preferences. They are the house pedagogy, and the house rules are in the root
[AGENTS.md](../../AGENTS.md).** Each rule below has a name and a body of evidence behind it — the
prediction gate is retrieval practice (`PS-4`), untimed-before-timed is `AS-5`, `sections` is
interleaving (`MR-4`), misses coming back is spaced retrieval (`MR-1`). Look one up in
[Pedagogical-Design-Handbook.md](../../Pedagogical-Design-Handbook.md) before you decide it is
overhead. Every one of them makes the app feel *harder* than the obvious alternative. That is the
mechanism, not a bug in it.

- **The options stay hidden until the student commits a prediction.** This is the technique
  every student here is taught, and homework is the one place they can silently skip it.
- **Untimed → she TYPES the prediction. Timed → one click.** Never make her type under a
  clock: she cannot type on test day, and it corrupts the timing measurement. New skill →
  untimed. Known skill → clock. Set `minutes: 0` for untimed.
- **Time-on-text is recorded separately from time-on-options.** A Hard passage committed in
  four seconds means she did not read it. That is the signal; do not average it away.
- **Every question survives the set** — passage, her answer, the right answer, the explanation
  — re-readable, misses first, reopenable tomorrow from the hub.
- **A redo never rewrites the first attempt.** What she did under the clock is the honest
  record. The redo only adds "put right on the redo".
- **Running out of time must not destroy the set.** Submit what she has; show the review.
- **Walking away must not destroy the set either.** The ledger is written per question; the
  sheet was written only from the end of a set, which practice mode and untimed homework reach
  only by advancing PAST the last question — neither has a Submit button. A set answered and
  then navigated away from wrote everything locally and sent the tutor nothing, and
  `mode:'no-cors'` meant nothing could tell. A `pagehide` flush now posts what was committed,
  marked `— INCOMPLETE (n of m answered)` in the focus cell. `session-flush.test.js` holds it.
  **Use `pagehide`, never `visibilitychange`** — these sessions are screen-shared and
  tab-switched constantly, and visibilitychange would post a row on every alt-tab. And
  **keepalive must stay on both fetches**, or the browser cancels the request mid-unload.

## The baseline screener

`baseline.html` plus `baseline-spec.js` (form construction), `baseline-grade.js` (routing,
bands, projection, skill weights) and `baseline-store.js` (the durable record). Five suites,
all on the list above. `baseline-recover.html` re-sends a sitting that was saved to a browser
but never reached the sheet.

**The anchor is Medium, and that is a data decision, not a preference.** The bank is 50 Easy /
138 Medium / 276 Hard. Easy is the *scarce* tier — nine of eleven skills hold four or five Easy
items in total, which cannot supply three parallel forms at two per skill. Easy is therefore
spent only as a floor probe, where it is decisive. Anyone changing `BASELINE_ITEMS_PER_SKILL`
or `BASELINE_FORMS` must re-run `baselinePreflight()` first: it is the thing that says out loud
that the bank cannot do what the design just asked of it.

### The baseline does NOT write to the mastery ledger

It used to, tagged `'baseline'`, and that looked careful. It was the opposite. A ledger row makes
a question *seen*; a miss puts it on rung zero of the review ladder, due again in one day; and
`dueForReview()` draws from the whole bank filtered on nothing but "seen and overdue". A baseline
is designed to produce misses across all eleven skills, so every sitting seeded the next
morning's homework with review questions from skills nobody had taught — the one thing the review
block must never do (see `review: N` above). Nothing is lost by not writing: the baseline record
already stores every item with the chosen letter, the correct letter and the elapsed seconds,
which is more than the ledger kept. Two assertions in `baseline.e2e.test.js` hold this.

### Order: spread WITHIN a domain, never across the set

`orderBaselineSAT` builds the real domain blocks and `spreadBaseline` keeps the two items of a
skill apart. For months the spread round-robined all eleven skill lanes across the whole set,
which destroyed the domain blocks *and* made the served sequence one repeating cycle — item *n*
and item *n+11* were always the same skill, on every form. The unit test was checking
`buildBaselineForm`'s output, which the page never serves, and the e2e test only checked
non-adjacency. **Test the array that reaches the student.** §ORDER of `baseline.test.js` now does.

### The review panel carries the whole question

Same rule as the runner: passage, stem, every option with the chosen and correct ones marked,
then the explanation. It used to print the skill, two letters and a rationale about a text that
was no longer on the page, which is not something a student can work through — and the baseline
is the sitting most likely to be reviewed with a tutor afterwards. Misses first.

### The record, and what reaches the tutor

`saveBaseline()` writes the instant the screener ends, before the optional probes, because the
probes may never happen. It stamps `sitting`, and the focus queue goes *into* the record as well
as into its own key — a plan that lives only in `psat89_focus_*` reaches nobody. Records append;
a retake is a second data point, never a correction of the first. `baselineSheetPayload()` builds
the sheet row from the **saved record**, not from live page state, so a row recovered months later
is identical to the one that would have gone up at the time.

### Known limits — say them, do not quietly fix them wrong

- **Two items per skill is triage, not certification.** That is what the `measured` / `low` /
  `not-measured` marker is for. `measured` means only "these two items were genuinely attempted" —
  never that the skill is settled.
- **The 120–720 projection is uncalibrated** — anchored to the range, not to score data. It is
  reported as a 60-point band, and `baselineDelta()` refuses to call movement real unless two
  bands fail to overlap. Do not turn it into a point estimate.
- **Only three forms exist.** A fourth sitting re-serves Form A while the intro still says
  "different questions from last time".
- **Everything is device-local** — the record, the form rotation, the growth delta.

## Custom practice in a ratio

The setup screen can divide a sitting between skills in a proportion — "five Transitions, three
Boundaries, two Words in Context" is the ratio toggle plus shares of 3 / 2 / 1 and a limit of 10.
Ported from the sister SAT app (`app.js`, `allocateByRatio` / `apportion`). Guarded by
`ratio-mix.test.js`.

**The toggle decides whether a ratio applies. Not whether the numbers differ.** Inferring intent
from unequal shares costs you the even split: 1-and-1 is how you would ask for a five-and-five
split, and it is also exactly what an untouched screen looks like — so that request becomes
unaskable, and fails silently as "whatever the queue had", which for two skills is frequently ten
of one and none of the other. The switch says it out loud. Do not replace it with a heuristic.

With the toggle off, `buildActiveQuestions` returns precisely the slice it returned before any of
this existed. That is the property everything rests on: the default screen, every Quick Preset, the
weak-area drill and the homework runner never turn it on, so if the allocator ever started
constraining an un-toggled draw it would quietly change every set the app has ever built, with no
error and no symptom. §5 of `ratio-mix.test.js` is the tripwire, and it pins `Math.random` because
`prioritizePool` shuffles.

Three things the allocator must keep doing:

- **The difficulty split is PER SKILL, not across the set.** Apportion by skill, then apportion each
  skill's quota by difficulty. Treating the two as independent marginals is the obvious
  implementation and it is wrong in a way only the interior shows: Cross-Text 1 : Transitions 1
  crossed with Medium 1 : Hard 1 at a limit of 10 gives five of each skill and five of each
  difficulty — both sets of totals exactly right — with **four of the five Hard on one skill.** A
  tutor who sets both dimensions means "half of *each* skill hard", which is a claim about cells,
  and marginals prove nothing about cells. The cost is that per-skill rounding makes the overall
  difficulty totals drift off the stated ratio (1:3 over 12 lands 4/8, not 3/9). That is the right
  trade. §3 of `ratio-mix.test.js` holds it.
- **A quota the pool cannot fill bends; the set does not shrink.** Ask for five Hard Cross-Text when
  none exist and you still get a full-length sitting: the shortfall is spent on that skill's other
  difficulties first, because **the skill split is the stronger promise** — it is the one the tutor
  states first — and only then on raw queue order. A short session is indistinguishable, to the
  student, from having finished.
- **The ratio picks how MANY, the queue picks WHICH.** Every pass walks the already-prioritised
  pool in order and only filters, so inside a quota the weakest questions still come first.

**R&W orders the result in domain blocks, easy → hard — `orderSATStyle`, keyed to `RW_DOMAIN_ORDER`.
A Math app shuffles its custom set; do not copy that here.** Math genuinely is presented mixed and
R&W is not: the real module runs Craft & Structure → Information & Ideas → Standard English
Conventions → Expression of Ideas. Shuffling would drill a question order the student never meets.
`buildMockModule` uses the same function, so the two cannot drift — `MOCK_DOMAIN_MIX` says only how
many per domain, never in what order.

## Shipping a change: bump the file's `?v=` tag in the same commit

There is no build step. The `?v=YYYYMMDD` on every `<script>` and `<link>` is the whole
cache-busting mechanism, and **the tag is the date that file last changed**. Edit a file
without bumping its tag and every browser holding the old copy keeps it — no error, no
symptom, the app simply runs last month's code for the students who use it most.

That had happened here to 28 references at once: `data-info-ideas.js` and
`data-expression-of-ideas.js` tagged 3 July after changing on 26 July, so students were
served the bank without the late-July questions; `homework/assignments.js` tagged 3 July
after changing on 4 August, so `homework-hub.html` handed out a month-old plan. The tutor
was reading those results as if they came from the current app.

`cache-tags.test.js` fails on a stale tag and on a `?v=` pointing at a file that does not
exist. Run it before you claim a change is live.

## Writing a week of homework

Judgement, not code — but it is what the plans encode, and it is easy to lose:

- **Short sets she finishes beat long sets she abandons.** A student who opened three 8-question
  sets late and answered one question learned nothing. Six 6-question sets, one a day.
- **Only assign skills whose strategy has been taught in class.** Assigning a known weak spot
  cold, with no strategy to meet it, is the fastest way to lose a student.
- **Pace is a ladder.** Untimed → ~90s → ~80s → the real thing (PSAT 8/9 is ~71s/question — 32 min ÷ 27 questions).

### Sets unlock on completion, and the order is the teaching sequence

`unlock: "sequential"` is the default for new plans: set 1 is open, and each later set opens when
the one before it is **submitted**. `unlock: "cumulative"` (one per calendar day) is legacy — it
meant a student with a free Saturday could still only reach that day's set, while a student who
fell behind was met by a wall. **Do not flip a plan that is already running**; re-author it
instead. The plans live here when this landed (Maysa, Faith, Gabe) stay on `cumulative` until
their next re-author, for the same reason the review freeze exists.

Because the student now meets the sets in exactly the authored order, every time, **order them so
that finishing one helps with the ones after it.** Name the chain in the plan's comment block:

- an **untimed** rep of a skill before the **timed** rep of that same skill;
- a **pace ladder** across sets (~90s before ~71s);
- a skill from an early set **returning inside a later mixed set**;
- the **most startable** set first — under sequential unlock, a stall on set 1 blocks the week.

If the sets genuinely do not relate, the order is a judgement call. Say so in the comment so the
next person knows it was a decision and not an oversight.

**A sequential plan MUST carry `through: "YYYY-MM-DD"`.** Sequential unlock stops enforcing
spacing — nothing prevents the whole week in one sitting, which is the one thing the design cannot
afford. The hub prints the window and asks the student to spread the sets out. That request is the
only spacing mechanism left, so it is not optional, and the student has to meet it *before* the
first set: a locked card with no explanation reads as a broken app.

`hwDayOpen()` in `homework/assignments.js` is the shared gate; the hub and the runner both call it,
so the order cannot be walked past with a bookmark. It deliberately **opens** a set when
`localStorage` cannot be read — broken storage must never lock a student out of their homework.

### Tips are plain text with newlines

The hub renders a tip with `innerHTML`; the runner sets it with `textContent`. HTML tags therefore
show up literally in the runner. **Newlines are the only formatting that works in both**, and both
`.tip` rules carry `white-space: pre-line` so they survive. Keep tips short and scannable — a wall
of prose gets skipped, and a skipped tip is a tip that was never written.

## The bank

`data-*.js` are generated from the source question-bank PDFs (see the build scripts in the
project root). If you rebuild them, run `homework/bank.test.js`.

**The source PDFs label evidence questions only "Command of Evidence" — never which kind.**
The parser has to infer it. It used to infer by counting digits in the extracted passage text,
which mis-filed every question whose data lives in a *chart*: a bar graph is an image and
contributes no digits. Eleven questions reading "which choice most effectively uses data from
the graph…" sat in the Textual bucket, and Quantitative was left with **3 Medium questions in a
719-question bank** — too thin to build a homework section from.

That bug was in the SAT app's parser; this bank is currently clean (Quantitative: 37). But the
lesson generalises, and `bank.test.js` guards it here too: classify by the **stem**, not by
counting digits. **If a skill's pool ever looks implausibly thin, that is a build bug, not a
fact about the test.**

## A note on this codebase

`const questionBank_* = [...]` in `data-*.js` is a global *lexical* binding — a classic script
can see it, but it is **not** a property of `window`. Tests must inject a probe script to reach
it. `prioritizePool` and `recordAnswer` are function declarations, so they *are* on `window`,
which is how tests stub them.
