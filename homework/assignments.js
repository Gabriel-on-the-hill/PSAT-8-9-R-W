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
  // 12–17 Sep 2026. Five short sets, with an untimed build before timed transfer.
  "Maysa": {
    title: "Five short sets — spread them across the week",
    start: "2026-09-12",
    through: "2026-09-17",
    unlock: "sequential",
    days: [
      { n:1, focus:"Conventions proof — build the method without a clock", minutes:0, review:0,
        sections:[
          { skills:["Boundaries"],                    diffs:["Medium"], count:1 },
          { skills:["Boundaries"],                    diffs:["Hard"],   count:2 },
          { skills:["Form, Structure, and Sense"],    diffs:["Medium"], count:1 },
          { skills:["Form, Structure, and Sense"],    diffs:["Hard"],   count:2 },
        ],
        tip:"No clock. Type the proof before you reveal the choices.\nFor a verb-form question, name the true subject and the finite verb the sentence needs. For punctuation, remove any optional description, then label each side: complete clause, dependent clause, or phrase.\nA dependent clause can contain a finite verb; a non-finite -ing or to- phrase is not a clause. Keep going past the last question until the results screen appears so the set is saved." },

      { n:2, focus:"The same conventions method — now under time", minutes:7, review:0,
        sections:[
          { skills:["Boundaries"],                    diffs:["Medium"], count:1 },
          { skills:["Boundaries"],                    diffs:["Hard"],   count:2 },
          { skills:["Form, Structure, and Sense"],    diffs:["Medium"], count:1 },
          { skills:["Form, Structure, and Sense"],    diffs:["Hard"],   count:2 },
        ],
        tip:"Six questions in seven minutes. Timed mode will not ask you to type the proof, but run it mentally before choosing.\nRemove interruptions, find the true subject and finite verb, and label each side complete clause, dependent clause, or phrase. Let that structure force the answer.\nAt sixty seconds, decide. At ninety seconds, choose and move." },

      { n:3, focus:"Reading proof — function, inference, and data", minutes:9,
        sections:[
          { skills:["Text Structure and Purpose"],          diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                          diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium","Hard"], count:2 },
        ],
        tip:"Four new reading questions and up to two due review questions in nine minutes.\nName the job before reading the choices. For function, state what the exact detail does. For inference, complete the logic in your own words. For data, read the title, headings, and units, then prove every part of the choice.\nAllow about two minutes for each data question; due review questions count in the nine minutes." },

      { n:4, focus:"Conventions at pace — mixed Medium and Hard", minutes:7,
        sections:[
          { skills:["Boundaries"],                 diffs:["Medium","Hard"], count:2 },
          { skills:["Form, Structure, and Sense"], diffs:["Medium","Hard"], count:2 },
        ],
        tip:"Four new conventions questions and up to two due review questions in seven minutes.\nRemove interruptions. Find the true subject and finite verb. For punctuation, label each side complete clause, dependent clause, or phrase, then let the structure force the mark.\nAt sixty seconds, decide. At ninety seconds, choose and move." },

      { n:5, focus:"Mixed transfer — prove the answer, then move", minutes:8, review:1,
        sections:[
          { skills:["Boundaries"],                         diffs:["Medium","Hard"], count:1 },
          { skills:["Form, Structure, and Sense"],         diffs:["Medium","Hard"], count:1 },
          { skills:["Text Structure and Purpose"],         diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                         diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Five new mixed questions and up to one due review question in eight minutes.\nName the job first, state the proof, then choose. Give data questions a little more time, but do not accept any option without proof. Change an answer only when you find new evidence." },
    ]
  },

  // Faith — week of 8 Sep 2026. Five short sets across seven days.
  //
  // START MOVES to 2026-09-08. Completion is stored per plan as
  // psat89_hw_<student>_<start>_<n>, so a new start date orphans finished days and
  // re-serves them. That is safe here and only here: on the 10 Aug plan only Day 1
  // was ever submitted, and Days 2-5 were never served at all, so nothing that was
  // completed is lost and nothing completed is re-served.
  //
  // SEQUENTIAL IS NOW THE RIGHT CHOICE, where before it was the dangerous one.
  // Under the old hwDayOpen() a missing submission flag locked every later set
  // indefinitely. It now has a CALENDAR FLOOR: a missing flag only stops a set being
  // EARNED early, and the day releases on its own date regardless. So sequential
  // gives cumulative's floor plus the ability to run ahead on a free evening, and it
  // can no longer deadlock. Prefer it over cumulative from here.
  //
  // THE LADDER IS ASYMMETRIC ACROSS THE TWO SKILLS, on purpose:
  //   Boundaries  -> the clock arrives immediately, on day 3. It is the older skill
  //                  in this plan and the only variable this week isolates for it.
  //   Transitions -> two untimed days first (1, 2), clock on day 4. It is the newest
  //                  skill in the plan, and a new skill plus a clock in one set
  //                  measures neither of them.
  // Day 5 is the only set that mixes both under a clock. Switching cleanly between a
  // punctuation question and a meaning question is its own skill and nothing earlier
  // in the week practises it.
  //
  // 90 SECONDS, NOT 71. Real pace is ~71s (27 questions / 32 minutes), but a flat
  // budget is the wrong model: the module puts Conventions and Expression of Ideas
  // in its last third, and those questions are worth more time than the reading
  // questions that open it. 90s is that stretch practised at the rate it should get.
  // Do not tighten toward 71 before the dress rehearsal.
  //
  // minutes COVERS THE REVIEW QUESTIONS TOO. Every day here is 4 new + 2 review = 6,
  // so 9 minutes is ~90s each, not ~135s. Author 4 new and let the ladder make it 6;
  // short sets that get finished beat long sets that get abandoned.
  //
  // SECTIONS EVERYWHERE, EVEN FOR ONE SKILL. A single diffs:["Medium","Hard"] day
  // does NOT yield an even split: it orders one pool through prioritizePool() and
  // slices the top N, so the split lands wherever the sort does. One difficulty per
  // section is the only construction that makes a count exact, and it also keeps
  // _calibratedPick out of the draw.
  //
  // BANK SUPPLY. Transitions has 23 items unspent by the 5 Sep class set (1 E, 8 M,
  // 15 H) and this week spends 13. Boundaries draws only on Commas and NoPunct,
  // which are the best-supplied rules in the Conventions bank; the Semi/Colon/Dash
  // items are nearly exhausted and are NOT reachable from here anyway, because a
  // section takes skills/diffs/count and has no id field. Those are class-set items.
  //
  // Shape only. The reasoning that produced these choices is TUTOR-ONLY and lives in
  // the gitignored notes: this file is loaded by three pages, so a student's browser
  // downloads all of it — every student's plan, not just their own.
  "Faith": {
    title: "The end of the module — five short sets, and the clock where it belongs",
    start: "2026-09-08",
    through: "2026-09-14",    // sequential unlock stops enforcing spacing, so the hub asks for these to be spread
    unlock: "sequential",
    days: [
      { n:1, focus:"Transitions — no clock, type the link before you look", review:0, minutes:0,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:4 },
        ],
        tip:"No clock at all. Take as long as you want — this is the set where the method gets built.\nCover the choices before you read them. Every option on a transition question is a real transition naming a real relationship, so they are all convincing on their own. That is exactly why looking first ruins the question.\nRead the sentence BEFORE the blank and say what it claims. Read the sentence AFTER it and say what it claims. Then type the link between them in ORDINARY words — \"same again\", \"opposite\", \"so\", \"for instance\", \"then\", \"I'll admit that, but\". Not a transition word. A plain phrase.\nOnly then uncover the choices, and take the one whose family matches what you typed.\nOne distinction to carry all week: FOR EXAMPLE introduces a new instance of the thing just claimed. IN OTHER WORDS re-says the same fact in different words. If the sentence after the blank contains no new information, it is restatement, not example." },

      { n:2, focus:"Transitions — same method, harder texts, still no clock", minutes:0,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:2 },
          { skills:["Transitions"], diffs:["Hard"],   count:2 },
        ],
        tip:"Still no clock. The texts get longer here; the five steps do not change.\nTwo things get harder at this level. First, the blank often sits INSIDE the sentence, after the subject, instead of at the front. Read it with the blank closed up — \"Jordan has yet to ratify the treaty\" — and then ask how that sits against the sentence before it.\nSecond, and this is the one worth writing down: IF THE SENTENCE AFTER THE BLANK ALREADY CONTAINS ITS OWN \"BUT\", THE BLANK IS A CONCESSION, NOT A CONTRAST. A sentence only turns once. If the turn happens later in the sentence, the blank is the part that agrees first — \"of course\", \"granted\", \"admittedly\" — and \"however\" is wrong there no matter how right it feels.\nOn a sequence question, find the dates before you find the transition. The order the sentences appear in tells you nothing about the order the events happened in." },

      { n:3, focus:"Punctuation with a clock — about 90 seconds a question", minutes:9,
        sections:[
          { skills:["Boundaries"], diffs:["Hard"], count:4 },
        ],
        tip:"About ninety seconds a question. Read that as room, not pressure — the clock is the only new thing in this set, so the clock is the only thing being practised.\nRun the procedure in this order, every time. First cover everything that could come out: the extra description, the who/which clause, anything sitting between two commas. What is left is the spine. Now look for a subject and a verb on each side of the mark.\nTwo complete sides -> full stop, semicolon, or comma plus and/but/or/so. One complete side and a fragment -> comma, colon or dash, and a semicolon is always wrong there.\nNever put a mark between a subject and its verb. And if the sentence has already opened a dash or a bracket, the interruption closes with the SAME mark and nothing after it — look left and read off what the sentence already did rather than judging what looks right.\nThe question to ask is not \"does a comma look OK here?\" It is \"what has this sentence already done, and what does that force?\"" },

      { n:4, focus:"Transitions meets the clock — about 90 seconds a question", minutes:9,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:2 },
          { skills:["Transitions"], diffs:["Hard"],   count:2 },
        ],
        tip:"First clock on this skill, and there is deliberate room in it.\nDo not drop the naming step because a timer is running. It is the first thing that goes and it is the only thing holding the method up — saying \"opposite\" to yourself costs about two seconds and it decides the question.\nIf you catch yourself reading all four choices and weighing which sounds best, stop and go back to the two sentences. That weighing feeling IS the wrong method — there is nothing to weigh once you have named the link.\nIf a question has not come to you after about forty seconds, choose and move on. Come back to it if the clock allows." },

      { n:5, focus:"The last stretch of a module — mixed, at about 90 seconds", minutes:9,
        sections:[
          { skills:["Boundaries"],                        diffs:["Hard"], count:2 },
          { skills:["Transitions"],                       diffs:["Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Hard"], count:1 },
        ],
        tip:"This set is shaped like the end of a real module, and switching cleanly between the three jobs is the thing being practised.\nBefore you start each question, name which job it is: a punctuation mark, a link between two sentences, or a claim that has to match a table. They need different first moves, and running the wrong one costs you the question.\nPunctuation: is each side a complete sentence, and what has the sentence already opened?\nTransition: what do the two sentences claim, and what is the link in plain words?\nData: read the heading, the axis labels and the units BEFORE you read a single choice. Then find the choice the table actually supports — not the one that sounds most like the passage.\nOn these, a choice can be perfectly true about the topic and still not be the one the question asked for. That is the trap, and it is the same trap in every skill on this test.\nOne pacing rule for the real thing: the module runs 27 questions in 32 minutes, and the punctuation and transition questions are all in its last third. Aim to be at question 18 with sixteen minutes still on the clock. The reading questions at the front are the ones to move through." },
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
