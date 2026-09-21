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
  // Maysa — week of 21 Sep 2026. THREE sets, Mon/Tue/Thu, and the challenge card
  // con-rules-1 on Wed and Fri. Practice 3 is Saturday, so Friday carries no set.
  //
  // NO UNTIMED SET THIS WEEK, and that is the reversal of the 18 Sep candidate,
  // which was three-quarters untimed because it was written before the class.
  // On 20 Sep she answered every conventions question she REACHED correctly, two
  // of them Boundaries at Hard, on a fresh draw rather than a replay — and spent
  // 377 of 420 seconds doing it, leaving three questions unseen. Untimed is the
  // condition she has already passed. The clock is the one she has not.
  //
  // THE FINDING THIS PLAN IS BUILT ON: it is not reading time. On 20 Sep she
  // settled each sentence in 15–26 seconds of `onText` and then took two to three
  // minutes to choose. The untimed 17 Sep set shows it from the other side, where
  // the options field still works: 21s on the text and 97s on the options for her
  // Dash miss. She has no procedure that TERMINATES, so she cycles the choices.
  //
  // AND SHE DOES NOT NAVIGATE. A timed set runs in exam mode — flag button,
  // question grid, dashed cells for blanks, free movement — because the real test
  // allows all of it. She works straight through in order, so the two expensive
  // questions take the clock and the tail is never seen. Five September items were
  // assigned and never reached, every one of them Form, Structure, and Sense
  // sitting behind Boundaries in its set. Day 1's whole job is to break that.
  //
  // review: 0 ON DAYS 1 AND 2. Both are pace instruments on a stated budget, and
  // 17 Sep's day 4 collapsed into a two-question measurement when a spliced review
  // item took 128 seconds. Day 3 takes the default dose, because it is the mixed
  // one and the ladder should bring this week's misses back inside it.
  //
  // `through` LOCKS NOTHING — homework-hub.html uses it only to print the sentence
  // asking her to spread the sets out. The levers that actually work are fewer
  // sets and named days, so this is three sets with the days written into the tips.
  "Maysa": {
    title: "Three sets on the clock — Monday, Tuesday, Thursday",
    start: "2026-09-21",
    through: "2026-09-24",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Flag and move — four questions, and none of them left blank", minutes:5, review:0,
        sections:[
          { skills:["Form, Structure, and Sense"], diffs:["Medium"], count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:2 },
        ],
        tip:"Monday. Four questions, five minutes, seventy-five seconds each. The verb-form ones come first and the two hardest punctuation ones come last, on purpose.\nThis set has a Flag button and a row of question squares at the bottom. USE THEM. At seventy-five seconds on any question, put something down, flag it, and move on. You can come back, change your mind, and the squares show you what is still blank.\nLast time three questions took six of your seven minutes and the last three were never seen. Every one of those scored zero, and you knew how to do them.\nCount the verbs: if the sentence already has its main verb, the blank needs an -ing or a to- phrase, not another one. For punctuation, read the sentence for the marks it already carries, cover what could come out, then let the two sides force the mark." },

      { n:2, focus:"The same rules at Medium — 45 seconds each, nothing harder", minutes:3, review:0,
        sections:[
          { skills:["Form, Structure, and Sense"], diffs:["Medium"], count:2 },
          { skills:["Boundaries"],                 diffs:["Medium"], count:2 },
        ],
        tip:"Tuesday. Four questions, three minutes. These are deliberately easier than Monday, because the only thing being tested today is the clock.\nRun the check in the same order every time. Read the sentence for the marks it already carries. Cover what could come out. Subject and finite verb on each side. Let the structure force the mark.\nDo not audition the options. At forty-five seconds, choose and move. If you finish with time over, that is the set working." },

      { n:3, focus:"Mixed transfer at real pace — the rehearsal for Saturday", minutes:8,
        sections:[
          { skills:["Form, Structure, and Sense"],         diffs:["Medium","Hard"], count:1 },
          { skills:["Boundaries"],                         diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                         diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Thursday. Four new questions and up to two due review questions in eight minutes. This is Saturday in miniature.\nStart the proof routine on question one, not question four. Name the job before you read the choices: for punctuation, what the structure forces; for data, the title, the headings and the units before any option; for inference, finish the logic in your own words first.\nGive the data question two minutes and not a second more. Everything else gets about a minute. Change an answer only when you find new evidence." },
    ]
  },

  // Faith — week of 15 Sep 2026. Four sets across four days, one a day.
  //
  // CUMULATIVE, NOT SEQUENTIAL, deliberately. Sequential opens the next set the
  // moment one is submitted, so a whole week can be finished in a single sitting —
  // and spacing is this plan's purpose, not its packaging. Cumulative keeps the
  // same calendar floor (n <= hwDaysAvailable(start), with no dependence on a
  // submission flag, so it cannot deadlock) and adds the ceiling sequential lacks:
  // a set cannot be opened before its date. Catching up stays possible.
  //
  // start: 2026-09-15. The 8 Sep plan is complete through day 5 and its `through`
  // date has passed, so nothing finished is orphaned by the move.
  //
  // THE ORDER OF THE FOUR DAYS IS THE DESIGN:
  //   1 — punctuation with NO clock and a typed prediction. Untimed comes before
  //       timed, and the typed reasoning is the only way to tell a wrong rule from
  //       a rushed one.
  //   2 — main idea and data, slower on purpose, two minutes a question.
  //   3 — the same punctuation, now on the clock, two days after day 1, with the
  //       transitions reps beside it. Same skill, harder condition, spacing between.
  //   4 — eight questions in real domain order: Conventions, then Expression of
  //       Ideas. That is the shape of the last third of a module, and no short
  //       single-skill set rehearses switching between them.
  //
  // `review` IS PART OF THE DESIGN, NOT A DEFAULT. Day 1 sets 0 so a typed,
  // untimed punctuation set is not interrupted by another skill. Day 4 sets 0
  // because review questions splice in at RANDOM POSITIONS, and that day's whole
  // point is the order. Days 2 and 3 take the dose and let the ladder work.
  //
  // 90 SECONDS, STILL NOT 71. Real pace is ~71s, but the front of the module is
  // cheap for this student and the last third is expensive. 90s is that stretch
  // practised at the rate it deserves. 71s belongs to a full-length rehearsal
  // under real conditions, not to a six-question set.
  //
  // ONE DIFFICULTY PER SECTION, always. A single diffs:["Medium","Hard"] section
  // orders one pool and slices the top N, so the split lands wherever the sort
  // does. Separate sections are the only construction that makes a count exact.
  //
  // ── 21 SEP: TWO DAYS ADDED. The plan is EXTENDED, not replaced. ──────────
  //
  // Days 3 and 4 have not been sat. Re-authoring now would take the only timed
  // punctuation set and the only test-order set off the hub before either had
  // produced a first attempt — and those two are the whole reason the first four
  // days were ordered the way they are. So days 1-4 stand untouched, two days go
  // on the end, and `through` moves to 24 Sep.
  //
  // STILL `cumulative`, because it is already running and a live plan does not get
  // flipped. Seven days in, cumulative locks nothing, so the ORDER lives in the
  // tips: day 5 says Wednesday, day 6 says Thursday, and 3 and 4 come first.
  //
  // WHY THE WEEK TURNS TOWARD READING. Days 1-4 are punctuation, transitions and
  // writing goal — the back half of a module. The front half has had one set in
  // six weeks of plans. Day 5 is the first untimed typed set pointed at reading
  // rather than at punctuation, and that is the point: the typed prediction is the
  // only condition in this app where the text has to be settled before the options
  // are allowed to speak.
  //
  // DAY 5 IS `minutes: 0` ON PURPOSE. That is what makes the gate a typed one
  // rather than a one-click commit (predictMode()), and `review: 0` goes with it
  // for the same reason day 1 carries it.
  //
  // DAY 6 TAKES THE DEFAULT DOSE — four new plus two review. Day 5 freezes the
  // ladder, so day 6 carries the week's spacing.
  //
  // DAY 6 NAMES A `ruleType`, which a homework day could not do until today.
  // Boundaries at Hard is 102 questions and 47 of them are comma items. The rule
  // this set exists to test is the one where a mark is already open in the
  // sentence and the blank has to close it. Without naming it, the set cannot
  // reach it — which is how a set can be built for a rule and never serve it.
  //
  // NOTHING UNTAUGHT IS ASSIGNED. Text Structure and Purpose and Cross-Text
  // Connections have not been taught in class, so neither is in either day.
  // `cs.html` carries the move for both and that is reading; a full-length serves
  // them and that is a measurement. A homework set is neither, and assigning a
  // skill cold is the fastest way to lose a student.
  //
  // Shape only. The student data behind these choices is TUTOR-ONLY and lives in
  // the gitignored ledger — this file is downloaded in full by every student.
  "Faith": {
    title: "Six short sets — the back half of a module, then the front",
    start: "2026-09-15",
    through: "2026-09-24",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Punctuation, no clock — say which mark and why before you look", review:0, minutes:0,
        sections:[
          { skills:["Boundaries"], diffs:["Hard"], count:4 },
        ],
        tip:"No clock on this one at all, and you will have to type your reasoning before the choices appear. Take as long as you want. This set is about being right for the right reason, not about speed.\nBefore you type, do this in order. Cover the extra description, the who/which clause, anything sitting between two commas. What is left is the spine of the sentence. Now look at each side of the blank and ask whether it could stand on its own as a sentence.\nTwo complete sides: full stop, semicolon, or comma plus and/but/or/so. One complete side and a fragment: comma, colon or dash — and a semicolon is always wrong there. Never a mark between a subject and its verb. If the sentence has already opened a dash or a bracket, the interruption closes with the SAME mark.\nThen type what the structure forces, in your own words — \"both sides complete, needs a semicolon\" — and only then uncover the options.\nThe question is never \"does a comma look alright here?\" A comma almost always looks alright. The question is what the sentence has already done, and what that leaves you no choice about." },

      { n:2, focus:"Main idea and data — slower on purpose", minutes:10,
        sections:[
          { skills:["Central Ideas and Details"],          diffs:["Hard"], count:2 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Hard"], count:2 },
        ],
        tip:"About two minutes a question, and that is deliberate. These are the two types where hurrying costs you the answer.\nMain idea: say what the whole text is about in one sentence of your own before you look at anything. Then hold every option against it. An option can be a true detail from the text and still be too narrow to be the main idea; an option can also say more than the text did. Watch for only, proves, all, always — when the text said may, or one or both.\nData: read the title, the axis labels and the units BEFORE you read a word of the options. Then say what the claim needs the figure to show: which groups, which years, which direction. A choice that describes one year accurately cannot prove a change across two.\nThe trap is the same in both, and it is the same trap as everywhere else. The option is true. It is not the thing you were asked for." },

      { n:3, focus:"Punctuation on the clock, and transitions beside it", minutes:9,
        sections:[
          { skills:["Boundaries"],  diffs:["Hard"], count:2 },
          { skills:["Transitions"], diffs:["Hard"], count:2 },
        ],
        tip:"About ninety seconds a question, and read that as generous rather than tight. Tuesday's set was the same punctuation with no clock at all; this is the same procedure with a timer running, which is the only thing that has changed.\nPunctuation: cover what could come out, find the spine, check each side for a subject and a verb, and let the structure choose the mark. Do not audition the options.\nTransition: this one is not about going faster. Say what the sentence before claims. Say what the sentence after claims. Name the link between them in ordinary words — same again, opposite, so, for instance, then, I will admit that but — and only then look.\nTwo to keep in mind at this level. If the sentence after the blank already contains its own but, the blank is a concession, not a contrast: a sentence only turns once. And on a sequence question, find the dates before you find the transition — the order the sentences appear in tells you nothing about the order the events happened in.\nIf a question has not come to you after about forty seconds, choose, mark it and move on." },

      { n:4, focus:"The last ten questions of a module, in test order", review:0, minutes:12,
        sections:[
          { skills:["Boundaries"],                 diffs:["Hard"],   count:2 },
          { skills:["Form, Structure, and Sense"], diffs:["Medium"], count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:1 },
          { skills:["Transitions"],                diffs:["Medium"], count:1 },
          { skills:["Transitions"],                diffs:["Hard"],   count:1 },
          { skills:["Rhetorical Synthesis"],       diffs:["Hard"],   count:2 },
        ],
        tip:"Eight questions in twelve minutes, and they arrive in the order the real test uses: punctuation and grammar first, then transitions and writing-goal questions. This is the stretch of the module that decides your score, and moving cleanly between the jobs is the thing being practised.\nBefore each question, name which job it is, then make that job's first move.\nPunctuation — what could come out of this sentence, and is each side complete?\nGrammar — what is being tested: subject and verb agreeing, tense, verb form, pronoun, possession, or a description sitting next to the wrong thing? Cross out the phrase in the middle and find the real subject.\nTransition — what does each sentence claim, and what is the link in plain words?\nWriting goal — say the goal in two or three words taken from the question itself, then choose the option that does that job and ignore the ones that are merely accurate.\nIf you have no route after about forty seconds, choose, mark it and move. One question is not allowed to eat the time the rest of them need.\nOne attempt at this set. It is the closest thing to the real thing you will do this week, and it is only worth anything the first time." },

      { n:5, focus:"Reading \u2014 say what the question wants before you look", review:0, minutes:0,
        sections:[
          { skills:["Central Ideas and Details"],          diffs:["Hard"], count:2 },
          { skills:["Command of Evidence \u2014 Quantitative"], diffs:["Hard"], count:2 },
        ],
        tip:"Wednesday. No clock, and you type before the choices appear. Take as long as you want.\nType two things every time: what the question is actually asking, in your own words, and which sentence in the text answers it. If you cannot point at a sentence, you are not ready to look.\nThen the rule that matters more than any of the rest of this: once you have typed it, the prediction does not change. You may cross out a choice for contradicting it. You may not talk yourself into a different answer because an option sounds better written than yours.\nMain idea: say what the whole text is doing in one sentence before you look at anything. An option can be a true detail from the text and still be far too small to be the answer. Watch for only, proves, all, always, when the text said may, or one, or both.\nData: title, axis labels, units, before a word of the options. Then say what the claim needs the figure to show \u2014 which groups, which years, which direction. A choice that describes one year accurately cannot prove a change across two.\nThe trap is the same in both and it is the same trap as everywhere else. The option is true. It is not the thing you were asked for." },

      { n:6, focus:"The mark the sentence has already opened, on the clock", minutes:9,
        sections:[
          { skills:["Boundaries"],  diffs:["Hard"], ruleTypes:["Dash"], count:2 },
          { skills:["Transitions"], diffs:["Hard"], count:2 },
        ],
        tip:"Thursday. Four new questions and up to two review ones, about ninety seconds each.\nPunctuation, in this order \u2014 and notice that the question you have been starting with is now the last one:\n1. Is a mark already open anywhere in this sentence, a dash, a bracket, a colon? Then the blank closes it, with the SAME mark.\n2. Is one side a description rather than a clause \u2014 making..., a pioneering..., which...? Comma, colon or dash. Never a semicolon.\n3. Is this a list whose items already contain commas? Then semicolons separate the items.\n4. Only now: is each side a whole sentence?\nTransitions: name the link in ordinary words before you look. Three to have ready.\nConcession \u2014 if the turn comes later inside the sentence, the blank agrees first: granted, admittedly, of course, though. A sentence only turns once.\nRestatement \u2014 for example adds a new instance; that is re-says the same fact in plainer words. No new information means restatement, not example.\nCulmination \u2014 if the second sentence finishes the first rather than opposing it, the word is Ultimately, not However.\nNo route after about forty seconds: choose, flag it, move on. One question is not allowed to eat the time the rest of them need." },
    ]
  },
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

  // Luke — week of 15 Sep, into the full-length mock on Sat 19 Sep. Four short sets,
  // finished before Friday night. Transitions is the new skill, taught in the 14 Sep
  // class, and the only thing added to the plan.
  //
  // THE WEEK IS AUTHORED AT HARD, AND THAT IS THE DECISION HERE. The independent
  // record has been running at Hard since late August: the fourth homework day of the
  // engagement was Hard and came back clean untimed, and every solo sitting since has
  // been Hard or Hard-plus-a-control. The Medium-frontier line in the notes is a
  // pre-teaching snapshot that got quoted forward through four classes; it is retired.
  //
  // WHAT LIMITS HIM IS FLUENCY AND OWNERSHIP, NOT TIER. The most informative sitting on
  // file is ten unseen Hard items at roughly seventy seconds each, then every miss
  // repaired on a second pass at four minutes each. The method is there and is not yet
  // automatic, and the only thing that moves that is unguided repetition at the tier
  // with the method forced — which is what an untimed, typed set is. Three of the four
  // sets are therefore untimed, and the clock appears once.
  //
  // A MEDIUM CONTROL SITS IN EVERY SET AFTER THE FIRST. Hard alone cannot separate "the
  // Hard application slipped" from "the whole skill went", and those two readings call
  // for different classes. The control is also what stops any set coming back all-red in
  // the week before a full-length sitting.
  //
  // SET 1 IS THE ONE MEDIUM NIGHT, AND IT IS NOT A TIER JUDGEMENT. Transitions is a day
  // old and has never been run without the tutor — the items before the teaching are
  // uninterpretable and the ones after it were guided. Night one asks whether it landed,
  // and asks it where a miss is unambiguous. Night two steps to Hard.
  //
  // THE RAMP MOVES ONE RUNG AT A TIME: difficulty on night two, the clock on night four,
  // never both in one set. Set 4 runs at ~70s, which is real module pace (27 questions
  // in 32 minutes), and minutes COVERS THE REVIEW QUESTIONS TOO — so every later day is
  // authored as 4 new + 2 review = 6, never 6 plus review on top.
  //
  // SET 2'S TIP CARRIES TWO RULES THE CLASS DID NOT REACH — concession, and example
  // versus restatement — and set 2 is where the Hard pair sits, so the rule arrives in
  // the same set as the items that need it. Set 1's tip carries a warning against
  // picking by word shape, which matters more than any single relationship.
  //
  // review:0 ON SET 1 ONLY. The ladder has been idle for over two weeks, so from set 2
  // the default dose of 2 resumes and pulls the most-overdue items from the WHOLE bank —
  // the only draw that can reach the reading skills, since no set this week names them.
  //
  // EVERY DIFFICULTY IS PINNED. Class practice feeds recordTrapOutcome, so coached
  // accuracy sits near the top of the scale and recommendDifficulty() would lean any
  // ranged section further toward Hard than authored, in places nobody chose. Pinning is
  // what makes the Hard dose exact. Author ranged diffs once a mock has produced numbers
  // earned without a tutor in the room.
  //
  // ⚠ AN UNTIMED SET ONLY REACHES THE TUTOR IF IT IS FINISHED. In practice-nav mode the
  // ledger is written per question but postLog fires from finish(), which advance()
  // reaches by moving PAST the last question — there is no Submit button in this mode.
  // Set 1's tip says so in plain words. Sequential unlock is the safety net: if the next
  // set has not opened, the previous one did not finish. Check the hub, not the sheet.
  //
  // SECTIONS ON EVERY MULTI-SKILL DAY, and on every mixed-difficulty day. A plain
  // skills/diffs/count day orders one pool and slices the top N, so a "2 Medium and 2
  // Hard" day would land wherever the sort does. One difficulty per section is the only
  // construction that makes a per-tier count exact.
  //
  // Shape only. The student data behind these choices is TUTOR-ONLY and lives in the
  // gitignored notes — it must never be written into this public, student-downloaded file.
  "Luke": {
    title: "Four short sets before Saturday — name it before you look",
    start: "2026-09-15",
    through: "2026-09-18",    // sequential unlock stops enforcing spacing, so the hub asks for these to be spread
    unlock: "sequential",     // set 1 open now; each later set opens when the one before is submitted
    days: [
      { n:1, focus:"Transitions — no clock, type the link before you look", review:0, minutes:0,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:4 },
        ],
        tip:"Keep going until you reach the results screen at the end — a set you stop halfway through does not get saved for me to read.\nNo clock at all, and a short set. This is where the method gets built, so the typing IS the assignment and the questions are the excuse for it.\nCover the choices before you read them. Every option on a transition question is a real transition naming a real relationship, so they are all convincing on their own. That is exactly why looking first ruins the question.\nRead the sentence BEFORE the blank and say what it claims. Read the sentence AFTER it and say what it claims. Then type the link between them in ORDINARY words — \"same again\", \"opposite\", \"so\", \"for instance\", \"then\". Not a transition word. A plain phrase.\nOnly then uncover the choices, and take the one whose family matches what you typed.\nOne warning worth more than any single relationship: DO NOT PICK BY THE SHAPE OF THE WORD. \"Similarly\", \"consequently\", \"additionally\", \"specifically\" and \"subsequently\" all end the same way and belong to four different families. The commonest one you will meet is \"Similarly\", and it means SAME AGAIN, not SO. The ending tells you nothing. The two sentences tell you everything." },

      { n:2, focus:"Transitions — harder texts, and the two that catch everyone", minutes:0,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:2 },
          { skills:["Transitions"], diffs:["Hard"],   count:2 },
        ],
        tip:"Still no clock. The texts get longer partway through and the four steps do not change — name the link in your own words first, every time.\nThree things get harder here. First, the blank often sits INSIDE the sentence instead of opening it. Read it with the blank closed up — \"Jordan has yet to ratify the treaty\" — and then ask how that sits against the sentence before it.\nSecond: FOR EXAMPLE introduces a new instance of the thing just claimed. IN OTHER WORDS re-says the same fact in different words. If the sentence after the blank contains no new information it is restatement; if it does contain new information, \"in other words\" is wrong no matter how smoothly it reads.\nThird, and this is the one to write down: IF THE SENTENCE AFTER THE BLANK ALREADY CONTAINS ITS OWN \"BUT\", THE BLANK IS A CONCESSION, NOT A CONTRAST. A sentence only turns once. If the turn happens later in the sentence, the blank is the part that AGREES first — \"granted\", \"admittedly\", \"of course\", \"to be sure\" — and \"however\" is wrong there however right it feels.\nOn a sequence question, find the dates before you find the transition. The order the sentences appear in tells you nothing about the order the events happened in.\nSome questions from other weeks will come back in here. That is deliberate — getting one right a second time, days later, is the only thing that proves it stuck." },

      { n:3, focus:"Goals and punctuation — no clock, type the reason first", minutes:0,
        sections:[
          { skills:["Rhetorical Synthesis"], diffs:["Medium"], count:1 },
          { skills:["Rhetorical Synthesis"], diffs:["Hard"],   count:1 },
          { skills:["Boundaries"],           diffs:["Hard"],   count:2 },
        ],
        tip:"No clock on this one either, and it is the most important set of the week — so type a real sentence every time, not three characters. These are the harder ones, and you have done this tier before.\nTwo different jobs in here, and naming which one you are looking at is the first move.\nGOAL QUESTIONS: read the goal BEFORE the notes and write down, in your own words, the job the sentence has to do — compare two things in this order, define a term then give an example, introduce something to an audience that already knows it. Then find the option that does THAT job. Here is the trap, and it is the same trap in every skill on this test: an option can be perfectly accurate about the notes and still not be the answer, because it does not do the job the goal asked for. True is not the test.\nPUNCTUATION: cover everything that could come out — the extra description, the who/which clause, anything sitting between two commas. What is left is the spine. Then find the subject and the verb on each side of the mark. Two complete sides means full stop, semicolon, or comma plus and/but/or/so. One complete side and a fragment means comma, colon or dash, and a semicolon is always wrong there. Never put a mark between a subject and its verb, and if the sentence has already opened a dash or a bracket, the interruption closes with the SAME mark.\nThe question is not \"does a comma look right here?\" It is \"what has this sentence already done, and what does that force?\"\nTake the time. On a hard question the answer usually comes on the second look at the text, not the first look at the options — and if you cannot point at the words that force your answer, it is not your answer yet." },

      { n:4, focus:"Warm-up for Saturday — four kinds of question, about 70 seconds each", minutes:7,
        sections:[
          { skills:["Transitions"],                diffs:["Hard"],   count:1 },
          { skills:["Rhetorical Synthesis"],       diffs:["Medium"], count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:1 },
        ],
        tip:"Short, and it is a warm-up rather than a test. The score on this one does not matter and I am not reading it as a result — it is here so Saturday's clock is not the first clock you have seen this week.\nSix questions in seven minutes is about seventy seconds each, which is the real rate on the day.\nBefore each question, name which job it is: a link between two sentences, a goal to accomplish, a punctuation mark, or a subject and its verb. They need different first moves and running the wrong one costs you the question.\nYou will not type your prediction this time; you commit with a click. Say it in your head anyway. That step is the first one to go under a clock and it is the only thing holding the rest up.\nIf a question has not come to you after about forty seconds, choose it, note the number, and move. One you never reach scores exactly the same as one you get wrong, and it costs you the next two as well.\nThen stop. Nothing the night before Saturday, and nothing on Saturday morning." },
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
