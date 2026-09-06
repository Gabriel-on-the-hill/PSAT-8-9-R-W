// ══════════════════════════════════════════════════════════════════
// PSAT 8/9 — per-student homework assignments.
// The tutor "assigns" by editing this file: one entry per student
// (keyed by the name their password maps to in gate.js), a start date,
// and a day-by-day plan. Days unlock by date so the student gets a new
// task each day. No server needed for the plan itself.
//
// ── SPACED REVIEW: read this before you write the next plan ────────
//
// Every day now serves up to 2 REVIEW questions on top of its own draw, pulled by
// dueForReview() from the WHOLE bank — across skills and across difficulties. It is
// the only draw that can do that. A day narrows the bank to (say) "Words in Context
// / Hard" before prioritizePool() ever sees the pool, so a due Text Structure
// question, or a Medium miss on a Hard-only day, cannot surface there at any sort
// order. Without this, nothing taught a month ago ever came back. It didn't.
//
// It only ever returns questions the student has ALREADY attempted and that the
// ladder in progress.js says are genuinely overdue. It never serves an unseen
// question, so it can't hand anyone an untaught skill cold.
//
// THE DOSE resolves day → plan → 2 (the default).
//   • Write a new plan and do nothing: it gets review. That is deliberate. Spacing
//     should be what happens when the tutor forgets, not a thing to remember.
//   • `review: 0` on a DAY whose job is to teach one brand-new skill and needs the
//     full dose on it.
//   • `review: 0` on a PLAN freezes it entirely — which is why the plans below carry
//     it. They were mid-week when the ladder landed and nobody's homework should
//     grow by two questions overnight. **Drop the line when you next re-assign.**
//
// AUTHOR THE COUNTS AROUND IT. A six-question day is now 4 new + 2 review, not 6 + 2.
// Short sets she finishes still beat long sets she abandons.
// ══════════════════════════════════════════════════════════════════

const HOMEWORK = {
  // Maysa — 3 Sep class → the week to the 10 Sep class. THREE sets.
  //
  // ⚠ THE CLASS IS THE 3 SEP ONE; THE PLAN IS DATED THE 4th, AND THAT IS NOT A TYPO.
  // Her sessions run late and cross midnight — the 27 Aug class logged its three sittings at
  // 00:27, 00:40 and 01:06 on the 28th. `start` has to be the date the BROWSER will be on when
  // she opens the hub, because hwDaysAvailable() compares against local midnight. Date this the
  // 3rd and cumulative opens sets 1 AND 2 the moment the clock ticks over, which collapses the
  // whole with-help / on-your-own sequence into one night. The tutor note for this class is
  // filed under 3 Sep; the plan is dated for the clock, not for the lesson.
  //
  // SHAPE ONLY BELOW THIS LINE. The student data behind these choices is TUTOR-ONLY and lives in
  // the gitignored notes — it must never be written into this public, student-downloaded file
  // (root rule: no assessment of a student where the student can read it).
  //
  // ⚠ UNLOCK IS `cumulative`, AND THAT IS THE WHOLE POINT OF THIS RE-AUTHORING.
  // Sequential has now cost two consecutive weeks. The first was a bug: an untimed set wrote to
  // localStorage and posted nothing, so set 1 never registered as finished and sets 2–6 never
  // opened. logPartialSession() fixed that. The second was OUR DESIGN, and worse: the 27 Aug plan
  // made set 1 a set to be SAT IN CLASS, the class ran different content, and so sets 2 and 3
  // stayed locked behind a set nobody remembered to open. Eleven of fourteen days with nothing
  // reachable, and no symptom anywhere — the hub looked exactly as it should.
  //
  // Cumulative opens set N on start + (N-1) days. It cannot lock her out: a set she skips does
  // not hold up the ones behind it, and a set she never opens costs only itself. Three sets over
  // seven days still spaces properly. The trade sequential was making — earned rather than waited
  // for — is not worth a third week.
  //
  // THE RULE THAT FOLLOWS, AND IT IS NOT NEGOTIABLE: no set that gates another set is ever
  // assigned to be sat in class. Set 1 below IS sat in class, which is exactly why this plan
  // cannot be sequential.
  //
  // `start` IS TODAY, AND THAT IS DELIBERATE. Under cumulative, day 1 opens on the start date, so
  // dating this 3 Sep is what makes set 1 reachable during the class rather than tomorrow.
  // Completion is keyed psat89_hw_<student>_<start>_<n>; nothing was ever submitted under
  // 2026-08-27, so replacing that plan orphans nothing.
  //
  // ORDER IS THE TEACHING SEQUENCE, and this week it is a MEASUREMENT sequence:
  //   Set 1  in class, supervised   — the domain at true pace, with a tutor in the room
  //   Set 2  the next day, alone    — the same shape on unseen items, cold
  //   Set 3  the conventions rung   — the uneven budget, on what the class taught
  // Sets 1 and 2 are the same instrument run twice on purpose. A score earned with a tutor
  // present and a score earned alone are different measurements, and folding them together is a
  // mistake this file has made before. Set 2 is the one that counts.
  //
  // ⚠ SET 1 CARRIES `review: 0` AND SET 2 DOES NOT — read this before "fixing" the asymmetry.
  // Set 1 is a clean six-question read of ONE domain at a fixed per-question cost. The ladder
  // draws its two from the WHOLE bank, so a review question of unknown skill and unknown cost
  // would put two questions of something else inside the only domain measurement of the week.
  // Set 2 keeps the default 2 because spacing has to resume somewhere and its four new items are
  // still directly comparable to set 1's, question for question. Do not author six new and let
  // review push it to eight; short sets she finishes beat long sets she abandons.
  //
  // EVERY SET STATES ITS PER-QUESTION BUDGET IN ITS TIP, and every tip that carries a review dose
  // says SIX rather than four and says the two can appear ANYWHERE — the runner splices them at
  // random positions, not at the end. A tip that promises four questions and delivers six breaks
  // the one habit this whole month is building.
  //
  // SECTIONS ON EVERY MULTI-SKILL SET. A plain skills/diffs/count day orders one pool and slices
  // the top N, so a "mixed" set silently collapses to one skill. One difficulty per section is
  // also the only construction that makes a count exact, and it keeps _calibratedPick() out of
  // the draw entirely — which matters here, because in-class work feeds recordTrapOutcome and
  // would otherwise read as permission to lean Hard.
  //
  // BANK SUPPLY — read this before writing the next plan, it constrains what can be asked:
  // SPENT, and not askable cold again: Boundaries Medium (2 unseen), Cross-Text Medium (2),
  // Text Structure & Purpose Medium (2), Words in Context Hard (6). None of them are in this plan.
  // Boundaries can only be asked at HARD from here — the Medium rung is gone, which is why set 3
  // steps it. DEEP, and where this plan spends: Command of Evidence — Textual Hard 23, Inferences
  // Hard 18, Command of Evidence — Quantitative Hard 17, Central Ideas Hard 15, Boundaries Hard 29
  // (less whatever the class block spends), Form Structure & Sense Hard 19, Rhetorical Synthesis
  // Hard 30, Transitions Hard 10 / Medium 8.
  //
  // WHAT IS NOT IN THIS PLAN AND SHOULD BE NEXT: Expression of Ideas cold — Rhetorical Synthesis
  // and Transitions, at pace, with nobody naming the writing goal for her. Three slots, four
  // candidates; the conventions rung won the third because it is what the class taught and a rung
  // taught without follow-up does not land. If a full-length lands this week it tests Expression
  // of Ideas for free and this stays deferred.
  "Maysa": {
    title: "The same question twice — with help, then without",
    start: "2026-09-04",
    through: "2026-09-11",
    unlock: "cumulative",     // set N opens on start + (N-1) days; a skipped set blocks nothing
    days: [
      // SAT IN CLASS, the 3 Sep class, clock visible, tutor not speaking. `review: 0` — see the note above.
      // Six questions of one domain at a fixed cost is the instrument; anything else in the set
      // dilutes it.
      { n:1, focus:"Information and Ideas at real pace — no cushion", review:0, minutes:7,
        sections:[
          { skills:["Command of Evidence — Textual"], diffs:["Hard"], count:2 },
          { skills:["Inferences"],                     diffs:["Hard"], count:2 },
          { skills:["Central Ideas and Details"],      diffs:["Hard"], count:2 },
        ],
        tip:"Seventy seconds a question — what the real test gives you. No cushion this time, and six questions that are all the same kind of work: what does this text say, and where does it say it.\nRead first, but read ONCE. The depth goes in the first pass, not in going back. If you are re-reading the passage, you are not being careful, you are being slow.\nBefore you look at a single choice, say what the passage claims in one sentence of your own. Then take the choice that matches your sentence.\nWhen you are short of time, the thing you cut is NEVER the passage. Cutting the read is not speed — it is guessing with extra steps.\nAt sixty seconds on any question you say one of two things out loud: \"I have it\" or \"I'm choosing and moving.\" There is no third option and there is no going back." },

      // THE ONE THAT COUNTS. Same composition, unseen items, no tutor in the room. Set 1 measures
      // the habit with help available; this measures whether it survives without. Do not read
      // set 1's number as transfer — that mistake has already been made once on this student.
      { n:2, focus:"The same thing again, on your own", minutes:7,
        sections:[
          { skills:["Command of Evidence — Textual"], diffs:["Hard"], count:2 },
          { skills:["Inferences"],                     diffs:["Hard"], count:1 },
          { skills:["Central Ideas and Details"],      diffs:["Hard"], count:1 },
        ],
        tip:"The same set as in class, on questions you have not seen, and this time nobody is sitting next to you. That is the entire point of it: yesterday showed what you can do with help in the room, today shows what you can do without. Today is the one that counts.\nSeventy seconds a question. Same method, in the same order: read once, say the claim in your own words, then look at the choices.\nSIX questions, not four. Two of them come back from earlier weeks and can turn up ANYWHERE in the set, not at the end. They are on the same clock.\nIf a question will not come, choose and move. One you never reach scores exactly the same as one you got wrong, and it costs you the ones after it." },

      // THE CONVENTIONS RUNG, and the follow-up to the class teaching block. Boundaries steps to
      // HARD because Medium is spent — difficulty moves here because the bank forces it, not
      // because the ladder chose it, and the 45-second budget is what keeps that honest.
      { n:3, focus:"Punctuation fast, data slow — one clock, two budgets", minutes:8,
        sections:[
          { skills:["Boundaries"],                          diffs:["Hard"], count:2 },
          { skills:["Command of Evidence — Quantitative"],  diffs:["Hard"], count:2 },
        ],
        tip:"One clock, two very uneven budgets — that is the point of this set.\nAbout FORTY-FIVE SECONDS each on the two punctuation questions. About TWO MINUTES each on the two data questions. Budget it that way on purpose: the cheap questions are supposed to bank time for the expensive ones, and that is exactly what the real test rewards.\nPunctuation — use the procedure from class, in this order. First cover everything between commas that could come out: the extra description, the who/which clause. What is left is the spine. Now look for a subject and a verb on each side of the mark. Two complete sides need a full stop, a semicolon, or a comma plus and/but/or/so. One complete side and a fragment takes a comma, a colon or a dash, and a semicolon is always wrong there.\nThe trap at this level: however, therefore, moreover and consequently are NOT joining words. A comma before one of them, with a whole sentence on each side, is always wrong — it wants a semicolon or a full stop.\nThe data questions — read the axis labels and the units BEFORE you read a single choice. Then take the sentence the graph actually supports, not the one that sounds most like the passage.\nSIX questions, not four. Two come back from earlier weeks and can appear anywhere. That leaves about seventy-five seconds each for those two, so count them in from the start rather than meeting them with a minute left." },
    ]
  },

  // Faith — re-entry, 10 Aug, ahead of the 11 Aug class. ONE set, and it is a
  // DIAGNOSTIC rather than a teaching day: the 26 Jul plan was finished on ~29 Jul
  // and nothing has been assigned since, so the only question worth asking before
  // class is whether Boundaries survived the gap.
  //
  // TWO SECTIONS FOR ONE SKILL — this is the point of the day, not a quirk.
  // `diffs:["Medium","Hard"], count:10` does NOT yield four Medium and six Hard. It
  // orders one pool through prioritizePool() and slices the top ten, so the split
  // falls out however that sort happens to land — the same silent collapse that
  // turned a "mixed" day into one skill. Sections are the only construction that
  // fixes an exact count per difficulty. Each section here names exactly ONE
  // difficulty, which also keeps _calibratedPick out of the draw (it needs two or
  // more diffs before it leans), so 4/6 is exact rather than nudged.
  //
  // The Medium four are a CONTROL, not filler. Hard on its own cannot separate
  // "the Hard application slipped" from "the whole skill went", and those two
  // readings call for different classes the next day.
  //
  // UNTIMED on purpose. minutes:0 puts the runner in typed mode, so she answers the
  // Boundaries predict prompt — "Does each side stand alone as a sentence? Then say
  // which mark that forces." That verdict IS the diagnostic: a score alone cannot
  // tell "knew the rule, misapplied it" from "does not know the rule".
  //
  // review:0 — the ladder's two due questions come from the whole bank by design, and
  // on a day built around one skill they would dilute the only reading being taken.
  // Spacing resumes on Day 2, which is where the dose belongs.
  //
  // ── DAYS 2–5 APPENDED 19 AUG 2026, after that evening's class ──────────────
  //
  // `start` STAYS AT 2026-08-10. Completion is stored per plan as
  // psat89_hw_<student>_<start>_<n>, so a new start date orphans Day 1 and re-serves it.
  //
  // UNLOCK FLIPPED cumulative → sequential, and this is the one moment it is allowed.
  // The house rule is "do not flip a live plan mid-week" — but this plan is not mid-week,
  // it is being RE-AUTHORED nine days after its start with Day 1 long since submitted,
  // which is exactly the re-authoring the rule carves out. It has to flip: under
  // `cumulative`, day N opens on start + (N-1) days, so four days appended on 19 Aug
  // against a 10 Aug start would all be open the moment they land — the wall of
  // everything at once that sequential exists to prevent. Sequential opens Day 2 now and
  // earns each one after it. `through` is therefore required, and set: sequential stops
  // enforcing spacing, so the hub prints the window and asks for the sets to be spread.
  //
  // THE LADDER THIS WEEK IS THE CLOCK, and it is deliberately slow:
  //   Day 2  untimed, typed      — a brand-new skill, first solo reps, no clock at all
  //   Day 3  untimed, harder     — same skill, difficulty step, still no clock
  //   Day 4  ~90s a question     — first clock on this skill, with real cushion
  //   Day 5  ~80s a question     — mixed, closer to pace (the test itself gives ~71s)
  // Two rungs at once is the failure mode: a new skill AND a clock in the same set
  // measures neither. Difficulty moves on Day 3, time moves on Day 4, and only Day 5
  // moves both — by which point the skill has had four untimed reps behind it.
  //
  // REVIEW DOSE. Day 2 carries `review: 0` because its whole job is one brand-new skill
  // and the ladder's two due questions come from the WHOLE bank by design — on that day
  // they would spend the set's budget on skills that are not the point of it. From Day 3
  // the default 2 resumes and every set is authored as 4 new + 2 review = 6. Do not
  // author 6 new and let review push it to 8; short sets that get finished beat long
  // sets that get abandoned.
  //
  // SECTIONS EVERYWHERE, EVEN FOR ONE SKILL — see the Day 1 note above. A single
  // `diffs:["Medium","Hard"], count:4` day does NOT yield two and two: it orders one
  // pool through prioritizePool() and slices the top four, so the split falls out
  // wherever the sort lands. One difficulty per section is the only construction that
  // makes a count exact, and it also keeps _calibratedPick out of the draw.
  //
  // COLLISION WITH THE CLASS SET is self-limiting and needs no exclusion list here: the
  // draw is unseen-first, so anything worked inside the app during class sinks to the
  // bottom of the pool on its own. Ids worked on paper in class never enter progress at
  // all and can surface — which is fine for a second rep, and is why no day this week is
  // a cold diagnostic.
  //
  // Shape only. The student data behind these choices is TUTOR-ONLY and lives in the
  // gitignored LEDGER — it must never be written into this public, student-downloaded
  // file (root rule: no assessment of a student where the student can read it).
  "Faith": {
    title: "A new skill, four sets, and the clock comes back slowly",
    start: "2026-08-10",
    through: "2026-08-24",    // required: sequential unlock stops enforcing spacing, so we ask
    unlock: "sequential",     // Day 1 submitted → Day 2 open now; each later set opens when the one before is submitted
    days: [
      { n:1, focus:"Boundaries (Medium + Hard) — untimed check-in", review:0, minutes:0,
        sections:[
          { skills:["Boundaries"], diffs:["Medium"], count:4 },
          { skills:["Boundaries"], diffs:["Hard"],   count:6 },
        ],
        tip:"No clock. This is a check on where you are — answer the way you would on the day. → For every blank, first ask: is what's on EACH side a complete sentence? → Two complete → period or semicolon. One complete + a fragment → comma, colon, or dash. Joining two complete ones → comma + a FANBOYS word. → Type the verdict and the mark it forces BEFORE you look at the choices. → If you are not sure, say so in the box and pick anyway; that is far more useful to us than a lucky guess." },

      { n:2, focus:"Words in Context — first solo set, no clock, type your prediction", review:0, minutes:0,
        sections:[
          { skills:["Words in Context"], diffs:["Easy"],   count:2 },
          { skills:["Words in Context"], diffs:["Medium"], count:4 },
        ],
        tip:"No clock on this one. Take as long as you want — this is the set where the method gets built.\nCover the choices. Every one of these sentences contains a signal, so find it first: a colon, semicolon or dash that defines the blank; a contrast word (although, but, yet, however, despite, far from); a continuation (and, because, since); or an example that follows and shows you what the blank means.\nNow say what the blank means in ORDINARY words and type that. Not a fancy word — a plain one. \"Not deep enough.\" \"Copied from somewhere else.\" If you are reaching for a hard word here, you are guessing at the answer instead of working out the meaning.\nThen look at the choices and take the one closest to what you typed.\nLast step, every time: put your choice into the blank and read the whole sentence back. Wrong answers usually sound wrong on the second half of the sentence." },

      { n:3, focus:"Words in Context — same skill, harder texts, still no clock", minutes:0,
        sections:[
          { skills:["Words in Context"], diffs:["Medium"], count:2 },
          { skills:["Words in Context"], diffs:["Hard"],   count:2 },
        ],
        tip:"Still no clock. The sentences get longer here, not trickier — the method does not change.\nThe signal is harder to spot at this level and it is often not a signal WORD at all. Ask whether the sentence approves or disapproves of what it is describing; that tells you the direction of the blank even when there is no \"although\" to point at.\nTwo traps live at this level. First: a choice that is a perfectly true thing to say about the passage but is not what the blank is asking for — that is the one to watch for, always. Second: right direction, wrong strength. If the text says something has \"almost no effect\", the answer is not the word that means \"no effect at all\".\nType your plain-word prediction first, every question. That is what makes both traps visible." },

      { n:4, focus:"Words in Context meets the clock — about 90 seconds a question", minutes:9,
        sections:[
          { skills:["Words in Context"],              diffs:["Medium"], count:2 },
          { skills:["Words in Context"],              diffs:["Hard"],   count:1 },
          { skills:["Form, Structure, and Sense"],    diffs:["Hard"],   count:1 },
        ],
        tip:"First clock on this skill: about 90 seconds a question, which is more than the real test gives you. That extra room is the whole point — it is there so you can still do the method under time.\nDo not drop the prediction step because a timer is running. That is the first thing that goes, and it is the only thing holding the method up.\nThe grammar question in here is a change of gear on purpose. Read the options first on that one: if they start with different nouns, it is asking which noun the opening description belongs to, and the answer is the one the description is actually about.\nIf a question is not coming to you after about thirty seconds, choose and move on. Come back if the clock allows." },

      { n:5, focus:"Mixed — everything, at about 80 seconds a question", minutes:8,
        sections:[
          { skills:["Words in Context"],           diffs:["Hard"],   count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:2 },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:1 },
        ],
        tip:"About 80 seconds a question now — close to real pace, which is around 71.\nThree different jobs in one short set, and switching between them cleanly is the thing being practised. Name what each question is asking BEFORE you start answering it: a meaning, a punctuation mark, or which word goes with which noun.\nBoundaries: is each side a complete sentence? Two complete ones need a full stop or a semicolon; a complete one plus a fragment takes a comma, colon or dash.\nGrammar: cross out everything between the subject and the verb, then check they match.\nMeaning: cover the choices, find the signal, say the plain word.\nA question you never reach scores exactly the same as one you get wrong, and it costs you the ones after it. When something is taking too long, choose and move." },
    ]
  },

  // Gabe — sample/placeholder plan; edit to assign.
  "Gabe": {
    title: "This week — mixed Reading & Writing review",
    start: "2026-06-20",
    unlock: "cumulative",
    review: 0,                // ← FROZEN (predates the ladder). Drop this line when you re-assign.
    days: [
      { n:1, focus:"Transitions",          skills:["Transitions"], diffs:["Easy","Medium"], count:6, tip:"Name the connection between the two sentences before looking at the words." },
      { n:2, focus:"Boundaries",           skills:["Boundaries"], diffs:["Easy","Medium"], count:6, tip:"Decide if each part is a complete sentence, then walk the punctuation guide." },
      { n:3, focus:"Light review",          skills:["Words in Context"], diffs:["Easy","Medium"], count:5, tip:"Short set. Predict, then check." },
      // Days 4-6 name more than one skill, so they MUST use sections. A plain
      // skills/diffs/count day draws from one ordered pool and takes the top N, which
      // clusters — day 6 was serving six questions of a single skill, not a mix.
      // Same skills, same difficulties, same totals; sections just make the mix real.
      { n:4, focus:"Information & Ideas",
        sections:[
          { skills:["Central Ideas and Details"], diffs:["Medium"], count:4 },
          { skills:["Inferences"],                diffs:["Medium"], count:4 },
        ],
        tip:"For the main idea, cover the whole text. For inferences, stay close to what the text says." },
      { n:5, focus:"Command of Evidence",
        sections:[
          { skills:["Command of Evidence — Textual"],      diffs:["Medium"], count:4 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium"], count:4 },
        ],
        tip:"Match the evidence to the whole claim. Read the figure before the choices." },
      { n:6, focus:"Mixed review",
        sections:[
          { skills:["Transitions"],      diffs:["Easy","Medium","Hard"], count:2 },
          { skills:["Boundaries"],       diffs:["Easy","Medium","Hard"], count:2 },
          { skills:["Words in Context"], diffs:["Easy","Medium","Hard"], count:2 },
        ],
        tip:"A short mix before our session." },
    ]
  },

  // Luke — first assignment. Two skills were taught in the first class and are the
  // only two that appear here; nothing else has been taught, and the ledger rule is
  // that an untaught skill is never assigned cold.
  //
  // BANK SUPPLY IS THE TIGHTEST CONSTRAINT ON THIS WEEK, and it is why the
  // difficulties look lopsided. Both skills had a full class session worked inside
  // the app, so a chunk of each Medium pool is already spent and — because those
  // sessions DID reach progress.js — the runner correctly ranks them resting, below
  // unseen. What is left:
  //   Inferences / Medium   9 in bank, 5 spent, 4 unseen  → SPENT NOWHERE THIS WEEK
  //   Central Ideas / Medium 12 in bank, 5 spent, 7 unseen → 3 + 2 + 2 = all 7
  // Inferences Medium is deliberately held at zero new draws. Its five worked items
  // are on the ladder and already overdue, so the review dose on days 3 and 4 brings
  // them back at the 1→3→7-day rungs — delayed retrieval of what was actually taught
  // beats four fresh items, and it keeps a reserve for next week. Inferences instead
  // runs Easy (4, untouched) and Hard (25, untouched).
  //
  // ⚠ EVERY DIFFICULTY IS PINNED, ON PURPOSE. The class practice fed
  // recordTrapOutcome, so both skills carry a COACHED accuracy near the top of the
  // scale, and recommendDifficulty() would read that as permission to lean Hard. A
  // section pinning ONE difficulty is an explicit tutor choice and calibration is
  // forbidden from touching it. Do not author a ranged diffs:["Medium","Hard"] on
  // either skill until a mock has produced a number earned without a tutor present.
  //
  // THE LADDER IS THE CLOCK, and it is slow:
  //   Day 1  untimed, typed   — procedure rehearsal at Easy, both skills, low load
  //   Day 2  untimed, typed   — one skill alone, difficulty steps to Medium
  //   Day 3  untimed, typed   — difficulty steps to Hard on a PAIR, with a control
  //   Day 4  ~80s a question  — day 3's exact composition, so the CLOCK is the only
  //                             thing that moved and a drop reads as pace, not difficulty
  // Two rungs at once is the failure mode: difficulty moves on day 3, time on day 4.
  // Real pace (~71s) is not in this week at all.
  //
  // minutes:0 puts the runner in typed mode. That typed prediction is the only
  // instrument that tests the habit this plan is built around, so three of four days
  // keep it; day 4 spends it for pace data.
  //
  // ⚠ AN UNTIMED SET ONLY REACHES THE TUTOR IF IT IS FINISHED. In practice-nav mode
  // the ledger is written per question but postLog fires from finish(), which
  // advance() reaches by moving PAST the last question — there is no Submit button in
  // this mode. Day 1's tip says so in plain words. Sequential unlock is the safety
  // net: the completion flag and postLog are written together, so if the next set has
  // not opened, the previous one did not finish. Check the hub, not the sheet.
  //
  // review:0 on days 1 and 2 — day 1 because it is the first dose of the procedure
  // itself, day 2 because its whole job is one skill and the ladder draws from the
  // WHOLE bank. From day 3 the default 2 resumes and days are authored as 4 new + 2
  // review = 6, never 6 new plus review on top.
  //
  // SECTIONS ON EVERY MULTI-SKILL DAY. A plain skills/diffs/count day orders one pool
  // and slices the top N, so a "mixed" set silently collapses to one skill.
  //
  // Shape only. The student data behind these choices is TUTOR-ONLY and lives in the
  // gitignored notes — it must never be written into this public, student-downloaded
  // file (root rule: no assessment of a student where the student can read it).
  "Luke": {
    title: "Two skills, one habit — predict before you look",
    start: "2026-08-25",
    through: "2026-08-30",    // required: sequential unlock stops enforcing spacing, so we ask
    unlock: "sequential",     // set 1 open now; each later set opens when the one before is submitted
    days: [
      { n:1, focus:"Inferences and main idea — no clock, type your prediction first", review:0, minutes:0,
        sections:[
          { skills:["Inferences"],                diffs:["Easy"], count:4 },
          { skills:["Central Ideas and Details"], diffs:["Easy"], count:2 },
        ],
        tip:"Keep going until you reach the results screen at the end — a set you stop halfway through does not get saved for me to read.\nNo clock at all on this one. Take as long as you want — the typing IS the assignment, and the questions are the excuse for it.\nCover the choices. Read to the end. Then write the claim in ONE sentence of your own: what is this text actually saying?\nIf the text turns — but, however, regardless, although — your claim has to carry the turn. A claim that drops the \"but\" will match a wrong answer perfectly.\nOnly then look at the options, and take the one that matches your sentence.\nLast step every time, and it is the whole point: does the text SAY this, or does it just sound sensible? Reasonable and supported are not the same thing." },

      { n:2, focus:"Main idea on its own — still no clock", review:0, minutes:0,
        sections:[
          { skills:["Central Ideas and Details"], diffs:["Easy"],   count:2 },
          { skills:["Central Ideas and Details"], diffs:["Medium"], count:3 },
        ],
        tip:"Still no clock, and a short set on purpose. One skill today, and the texts get longer partway through — the method does not change.\nWrite the claim before you look, every single question.\nHere is the trap at this level, and it catches almost everyone: on a main-idea question, MOST of the wrong choices are true. They are real statements about the passage. They are just too small.\nSo \"is it true?\" is the wrong test. The test is: does it cover the WHOLE text, or only one corner of it?\nToo narrow is one detail wearing a main-idea costume. Too broad is a claim the text never grew big enough to make. Name which one each wrong option is before you move on." },

      { n:3, focus:"Harder inferences, mixed with main idea — no clock", minutes:0,
        sections:[
          { skills:["Inferences"],                diffs:["Hard"],   count:2 },
          { skills:["Central Ideas and Details"], diffs:["Medium"], count:2 },
        ],
        tip:"The step up you were told about — and still no clock, on purpose. Harder texts and a timer at once would measure neither.\nTwo of these are harder inference questions. The passages are denser; the method is identical. Claim first, in your own words, before the choices.\nAt this level the wrong answers stop being obviously wrong. Watch for four of them: something true-sounding about a topic the text never raised; a real finding widened into a sweeping claim; a cause the passage never mentioned; and an option that is perfectly accurate but does not finish THIS sentence.\nIf you cannot point at the words that force your answer, it is not your answer yet.\nSome questions from earlier this week will come back in here. That is deliberate — getting one right a second time, days later, is the only thing that proves it stuck." },

      { n:4, focus:"Same mix, now against a clock — about 80 seconds a question", minutes:8,
        sections:[
          { skills:["Inferences"],                diffs:["Hard"],   count:2 },
          { skills:["Central Ideas and Details"], diffs:["Medium"], count:2 },
        ],
        tip:"Same kind of set as last time — the only thing that changed is the clock. About 80 seconds a question, and the real test gives you around 71, so there is room in it.\nYou will not type your prediction this time; you commit with a click instead. Say the claim in your head anyway. That step is the one that goes first under time, and it is the only thing holding everything else up.\nMost of your time belongs to the passage, not the options. If you are still circling the choices after a minute, you did not read hard enough the first time.\nIf a question will not come, choose and move. One you never reach scores the same as one you get wrong, and it costs you the next two.\nPacing has never been your problem. Do not let the clock talk you out of the method." },
    ]
  }
};

// Parse a start date robustly: accepts "YYYY-MM-DD", a Date, ISO, or locale
// formats like "6/20/2026". Returns a local Date at midnight, or null.
function hwParseDate(s) {
  if (s instanceof Date) return isNaN(s) ? null : new Date(s.getFullYear(), s.getMonth(), s.getDate());
  if (!s) return null;
  s = String(s).trim();
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  var d = new Date(s);
  return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Is set `n` open to this student yet?
//
// THE DEFAULT IS `sequential`: set 1 is always open, and each later set opens
// when the one before it is SUBMITTED. A set is earned, not waited for. This
// replaced `cumulative` (one per calendar day) because a student who sat down
// on a free Saturday could only ever reach that day's set, and a student who
// fell behind was met by a wall of everything at once.
//
// The trade sequential makes is that it stops enforcing SPACING — nothing now
// prevents the whole week in one evening, which is the one thing the design
// cannot afford. So a sequential plan should also carry `through`, and the hub
// shows the student the window the sets are meant to be spread across. The
// pacing is asked for honestly rather than imposed by a lock.
//
// If localStorage cannot be read we OPEN the set rather than strand the
// student. Broken storage must never be able to lock someone out of homework.
//
// Plans already running under `cumulative` stay on it until they are next
// re-authored — same rule as the review freeze. Do not flip a live plan
// mid-week; it changes what the student sees halfway through.
// THE CALENDAR FLOOR, added 6 Sep 2026. Sequential on its own can DEADLOCK, and it
// did: a student answered all ten questions of set 1 on 14 Aug and closed the tab
// without reaching the score screen, so the completion flag was never written and
// sets 2-5 -- the whole of that week's new skill -- stayed shut for seventeen days.
// Nobody could see it. The hub prints every set, so she was looking at four sets she
// could not start, and the score screen showed her a finished-looking result.
//
// So a missing flag no longer LOCKS a later set, it only stops that set from being
// EARNED EARLY. Sequential keeps what it was built for -- submit set 1 and set 2
// opens at once, so a free Saturday is not wasted -- and falls back to the calendar
// rule when a set was not submitted. The worst case is now cumulative's pace, which
// is the behaviour this replaced, rather than a plan that never opens again.
//
// Fixing the flag itself is homework-run.html's job (a fully answered set now
// commits on pagehide). This is the floor under it: no submission path can be
// perfect, and no bug in one should ever be able to strand a student's whole week.
function hwDayOpen(student, plan, n) {
  if (!plan) return n === 1;
  if (plan.unlock === 'sequential') {
    if (n <= 1) return true;
    try {
      for (var i = 1; i < n; i++) {
        if (localStorage.getItem('psat89_hw_' + student + '_' + plan.start + '_' + i) !== '1') {
          return n <= hwDaysAvailable(plan.start);
        }
      }
      return true;
    } catch (e) { return true; }
  }
  return n <= hwDaysAvailable(plan.start);
}

// Days available so far, given a start date (cumulative unlock by calendar day).
// Only `unlock: "cumulative"` plans use this now — see hwDayOpen above.
function hwDaysAvailable(startStr) {
  var start = hwParseDate(startStr);
  if (!start) return 1;   // if the date is missing/odd, open Day 1 rather than lock everything
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - start) / 86400000) + 1);   // Day 1 on the start date
}

// Load a student's plan: try the tutor's Google Sheet first (JSONP, so it works
// cross-origin), and fall back to the built-in plan above if there's no endpoint,
// no sheet entry, or the network is slow. Either way the callback gets a plan or null.
// Where homework PLANS come from:
//   false = from this file (reliable, instant, works for every student, no backend) ← default
//   true  = fetch from your Google Sheet's Plans tab (needs the backend fully working)
// The homework/session LOG to your sheet works either way.
var HW_USE_SHEET = false;

// A sheet-authored day cannot say `sections`, and that is a silent collapse waiting.
//
// The tutor backend's buildPlan() (tutor-sheet/psat-apps-script.md) reads
// skills/diffs/count/minutes/tip and nothing else. So a sheet day naming three skills
// arrives as ONE pool of three skills — and the runner takes the top N of an ordered
// pool, which serves a block of one skill while looking perfectly fine. That is the
// exact failure AGENTS.md calls the one that bites hardest, and the reason a plain
// multi-skill day is banned in this file.
//
// Splitting it here, on the client, is what makes the sheet path safe: it needs no
// redeploy, it cannot be forgotten in a script nobody runs tests against, and an
// assertion can see it. An even split is what "3 skills, 6 questions" means; the
// remainder goes to the earliest skills rather than being dropped.
function hwNormalizeSheetPlan(plan) {
  if (!plan || !plan.days) return plan;
  plan.days.forEach(function (d) {
    if (!d || d.sections || !d.skills || d.skills.length < 2) return;
    var count = Number(d.count) || 5, k = d.skills.length;
    var base = Math.floor(count / k), extra = count % k;
    d.sections = d.skills.map(function (s, i) {
      return { skills: [s], diffs: (d.diffs || []).slice(), count: base + (i < extra ? 1 : 0) };
    }).filter(function (s) { return s.count > 0; });
  });
  return plan;
}

function hwLoadPlan(student, cb) {
  var local = (typeof HOMEWORK !== "undefined" && HOMEWORK[student]) ? HOMEWORK[student] : null;
  var ep = (typeof SHEET_SYNC_ENDPOINT === "string") ? SHEET_SYNC_ENDPOINT : "";
  if (!HW_USE_SHEET || !ep) { cb(local, "local"); return; }
  var done = false, name = "__hwcb" + Math.random().toString(36).slice(2), sc;
  function finish(plan) { if (done) return; done = true;
    try { delete window[name]; } catch (e) {}
    if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
    var ok = plan && plan.days && plan.days.length;
    cb(ok ? hwNormalizeSheetPlan(plan) : local, ok ? "sheet" : "default"); }
  var timer = setTimeout(function(){ finish(null); }, 9000);
  window[name] = function(data){ clearTimeout(timer); finish(data); };
  sc = document.createElement("script");
  sc.src = ep + (ep.indexOf("?") < 0 ? "?" : "&") + "action=plan&student=" + encodeURIComponent(student) + "&callback=" + name;
  sc.onerror = function(){ clearTimeout(timer); finish(null); };
  document.body.appendChild(sc);
}

if (typeof window !== "undefined") { window.HOMEWORK = HOMEWORK; window.hwDaysAvailable = hwDaysAvailable; window.hwDayOpen = hwDayOpen; window.hwLoadPlan = hwLoadPlan; window.hwParseDate = hwParseDate; window.hwNormalizeSheetPlan = hwNormalizeSheetPlan; }
