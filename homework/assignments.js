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
  // Maysa — 24 and 25 Sep 2026. TWO short sets: one sat IN CLASS tonight, one on
  // Friday. Practice 3 (the full-length, Reading and Writing plus Math) is Saturday,
  // outside the app, and nothing is assigned after it until it has been reviewed.
  //
  // WHAT THIS PLAN IS FOR. Last week's plan trained the clock and it worked: sets
  // were reached to the end and reading ran at under a minute a question. What did
  // not come with the speed was a rule that ENDS a punctuation question. So this
  // plan is the procedure first, then the clock — the order last week skipped.
  // The procedure is taught in the room before day 1 opens:
  //   1. marks already printed in the sentence must be matched or closed;
  //   2. cover the blank — is the left side a complete sentence? the right side?
  //   3. both complete: a comma alone is out (period, semicolon, colon, dash, or
  //      comma + and/but/so);
  //   4. right side not complete: semicolon is out;
  //   5. left side not complete: colon and semicolon are both out.
  //   Pick the survivor and move. No re-reading the options.
  //
  // `ruleTypes` ON EVERY BOUNDARIES SECTION, because the decision this plan tests is
  // the one between Semi / Colon / Dash / Commas / NoPunct, and an unfiltered
  // Boundaries draw is mostly comma items. One rule per section so the counts are
  // exact. Supply checked against the bank before authoring.
  //
  // NO Mod SECTION. The unseen Hard Mod items include one held back for class use,
  // and a homework draw would spend it. SVA stands in: the sentence spine is the
  // same skill the Mod question rests on.
  //
  // review: 0 ON BOTH DAYS. These are two short, clean measurements of one
  // procedure the night before and two nights before a full-length; a spliced
  // review item from another skill would blur exactly the reading they exist for.
  //
  // CUMULATIVE: day 1 opens on the 24th, day 2 on the 25th. A set cannot open
  // before its day, so the two cannot be sat back to back ahead of time.
  //
  // Shape only. The student data behind these choices is TUTOR-ONLY and lives in
  // the ledger outside this repo — this file is downloaded in full by every student.
  "Maysa": {
    title: "The two-sides test — one set tonight, one on Friday",
    start: "2026-09-24",
    through: "2026-09-25",
    unlock: "cumulative",
    days: [
      { n:1, focus:"In class — the two-sides test, six questions on the clock", minutes:6, review:0,
        sections:[
          { skills:["Boundaries"],                 diffs:["Hard"],   ruleTypes:["Semi"],    count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   ruleTypes:["Commas"],  count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   ruleTypes:["Dash"],    count:1 },
          { skills:["Boundaries"],                 diffs:["Medium"], ruleTypes:["Colon"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   ruleTypes:["NoPunct"], count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   ruleTypes:["SVA"],     count:1 },
        ],
        tip:"We start this one together in class. Six questions, six minutes — one minute each.\nFor every punctuation question, run the two-sides test in order and stop when one choice is left:\n1. Any mark already printed in the sentence? Match it or close it.\n2. Cover the blank. Is the LEFT side a full sentence? Is the RIGHT side?\n3. Both full: a comma on its own is out.\n4. Right side not full: a semicolon is out.\n5. Left side not full: a colon and a semicolon are both out.\nPick what is left and move. If two choices survive, flag it, choose one, and come back at the end." },

      { n:2, focus:"Friday — the same test, five questions, then rest before Saturday", minutes:5, review:0,
        sections:[
          { skills:["Boundaries"],                 diffs:["Hard"], ruleTypes:["Semi"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"], ruleTypes:["Colon"],  count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"], ruleTypes:["Dash"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"], ruleTypes:["Commas"], count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"], ruleTypes:["SVA"],    count:1 },
        ],
        tip:"Friday only — not Thursday night, not Saturday morning. Five questions, five minutes.\nSame two-sides test as in class, in the same order, every time. Say the step that decides it, even if only in your head: \"right side not full — semicolon out.\"\nFor the verb question: cross out everything between the subject and the blank, then match the verb to the subject.\nThen stop. No extra practice tonight. Saturday is the full practice test, Reading and Writing and Math, in one sitting." },
    ]
  },

  // Faith — Sat 26 Sep 2026. ONE set, sat IN CLASS with the tutor watching.
  // The 15 Sep plan is cleared. Nothing is assigned after class: the next plan is
  // authored after the weekend practice test has been read, not before it.
  //
  // WHAT THE SET IS FOR. The class teaches a main-idea routine: find the claim
  // sentence, predict topic + point, and keep an option only if every word of it
  // can be pointed to in the text. The challenge set teaches and practises it in
  // Assisted mode; this day is the first test of it in Standard mode at test pace,
  // sat silently, so the result is a first attempt and not a coached one.
  //
  // 6 MINUTES FOR 4, about ninety seconds a question. Timed, so the gate is one
  // click, not typed: in the room she narrates nothing and the tutor watches the
  // time-on-text column instead.
  //
  // `review: 0` so the four questions are exactly the four authored. A spliced
  // review item from another skill would make the set measure something else.
  //
  // SAT AFTER THE CHALLENGE SET OF THE SAME DATE (ci-claim-1 in challenge/sets.js).
  // That set teaches the routine and scores eight Central Ideas items, four of them
  // Hard, and challenge answers write to the mastery ledger. Attempted first, they
  // are no longer unseen, so this day's Hard draw cannot serve one of them as a
  // first attempt. Sat the other way round, it can.
  //
  // `start` MOVES to today. Done flags are keyed by start date, so the new day 1
  // cannot inherit the old day 1's flag.
  //
  // Shape only. The evidence behind these choices is tutor-only and lives outside
  // this repo — this file is downloaded in full by every student.
  "Faith": {
    title: "In class today — main idea at test pace",
    start: "2026-09-26",
    through: "2026-09-26",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Main idea at test pace \u2014 in class", review:0, minutes:6,
        sections:[
          { skills:["Central Ideas and Details"],     diffs:["Hard"], count:3 },
          { skills:["Command of Evidence \u2014 Textual"], diffs:["Hard"], count:1 },
        ],
        tip:"Four questions, six minutes. Work on your own; your tutor will not help during the set.\nFirst, decide what kind of question it is. Main idea means the whole text. According to the text, or what the text suggests about something, means one part: find that sentence and say only what it says.\nMain idea: find the claim sentence. It is often the first sentence, or the one after However or But, or the one every other sentence supports. Say it to yourself as a topic plus a point, who or what, and what the text says about it. A topic on its own cannot rule anything out.\nThen every word of the option you choose has to point to a line in the text. If you cannot put a finger on it, it is out. Two to watch for: words the text never said, like widely, most, first, always or over time, and the text's own words attached to the wrong person or thing.\nNo route after about forty seconds: choose, flag it, move on. One attempt only." },
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

  // Luke — week of 22 Sep 2026. FOUR mixed sets, Tue to Fri, into a full-length
  // practice test on the weekend. Shape only; the reasoning and the evidence behind
  // it are tutor-only and live outside this repo.
  //
  // WHAT THE WEEK IS FOR. Every taught skill touched at least twice before the test,
  // so nothing goes stale, with the recent skills carrying the weight: each set leads
  // with them and the older skills fill the back half. Across the four sets:
  // Boundaries 5, Words in Context 5, Transitions 4, Form/Structure 3, Inferences 3,
  // Central Ideas 2, Rhetorical Synthesis 2 -- 24 new, plus the ladder's review.
  //
  // THE CLOCK COMES LAST, ONCE. Sets 1-3 are untimed with a typed prediction, because
  // minutes > 0 switches the runner to a one-click commit and the typed box is the
  // only record of HOW an answer was reached. Set 4 is the rehearsal: seven minutes,
  // exam navigation, questions in the order the real module serves them (Craft and
  // Structure, Information and Ideas, Conventions, Expression of Ideas), review:0 so
  // a spliced item cannot distort the pace.
  //
  // BOUNDARIES IS PINNED TO Colon + Semi in sets 1 and 3: both rule types test one
  // question -- can each side stand as a sentence -- and the wide Commas pool would
  // mostly test something else. Set 4 leaves it open, as transfer. Form/Structure
  // takes SVA in set 1 and Pron/Poss in set 3 for the same reason. Inferences is
  // Hard throughout: the Medium pool is too exposed to read.
  //
  // THE PREDICTION STANDARD differs by skill and each tip says it: Boundaries names
  // both sides, then the mark; Words in Context names the clue, then its own word;
  // Transitions names the relationship, never a transition word. One word is fine
  // when it is the right kind of word.
  //
  // UNLOCK: sequential with the calendar floor -- set n opens when set n-1 is
  // submitted OR on day n, whichever comes first. The days are named in the tips.
  "Luke": {
    title: "Four mixed sets before your practice test — one a night",
    start: "2026-09-22",
    through: "2026-09-25",
    unlock: "sequential",
    days: [
      { n:1, focus:"Punctuation first, then a bit of everything — no clock", minutes:0,
        sections:[
          { skills:["Boundaries"],                 diffs:["Medium"], count:1, ruleTypes:["Colon","Semi"] },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:2, ruleTypes:["Colon","Semi"] },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:1, ruleTypes:["SVA"] },
          { skills:["Inferences"],                 diffs:["Hard"],   count:1 },
          { skills:["Central Ideas and Details"],  diffs:["Hard"],   count:1 },
        ],
        tip:"Tuesday. One set tonight, no clock, about ten minutes. Four sets this week, one a night, then your practice test at the weekend.\nPunctuation: before you look at the choices, ask one thing about each side of the blank: could it stand on its own as a sentence? Type it: \"left complete, right complete, semicolon.\"\nTwo complete sides need a period or a semicolon. A comma can't join them unless a FANBOYS word comes right after it, and \"however\" isn't one. A colon needs a complete sentence on its LEFT.\nVerb questions: cross out everything between the subject and the blank, then match the verb to the subject.\nReading questions: type the claim in your own words before you look." },

      { n:2, focus:"Words in Context, then transitions and the rest — no clock", minutes:0,
        sections:[
          { skills:["Words in Context"],          diffs:["Medium"], count:1 },
          { skills:["Words in Context"],          diffs:["Hard"],   count:2 },
          { skills:["Transitions"],               diffs:["Hard"],   count:1 },
          { skills:["Rhetorical Synthesis"],      diffs:["Hard"],   count:1 },
          { skills:["Central Ideas and Details"], diffs:["Hard"],   count:1 },
        ],
        tip:"Wednesday. No clock, about ten minutes.\nWords in Context: cover the choices and find the clue — after a colon or dash, the same idea said again after a semicolon, or a contrast word like \"despite\". Type the clue and your own plain word: \"after the semicolon, comparison.\" One word is fine if it's yours. Then put your choice back into the sentence and read it.\nTransitions: type the link, not a transition word — \"opposite\", \"same again\", \"so\", \"for instance\", \"I'll admit that, but\".\nSynthesis: read the goal first and pick the option that does that job." },

      { n:3, focus:"Transitions and a mix of everything — no clock", minutes:0,
        sections:[
          { skills:["Transitions"],                diffs:["Medium"], count:1 },
          { skills:["Transitions"],                diffs:["Hard"],   count:1 },
          { skills:["Words in Context"],           diffs:["Hard"],   count:1 },
          { skills:["Inferences"],                 diffs:["Hard"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:1, ruleTypes:["Colon","Semi"] },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"],   count:1, ruleTypes:["Pron","Poss"] },
        ],
        tip:"Thursday. No clock, about ten minutes. Last untimed set before the test.\nTransitions: read to the END of the sentence after the blank. If it already has its own \"but\", the blank is the part that agrees first: \"granted\", \"of course\". \"For example\" adds a new case; \"in other words\" says the same thing again.\nDon't pick by the shape of the word. \"Similarly\" and \"consequently\" both end in -ly and mean different things.\nPronouns: find the noun it points back to. Singular or plural? Owning something (its, their) or a contraction (it's, they're)?\nEvery question: say what it needs before you look." },

      { n:4, focus:"Dress rehearsal — six questions in test order, seven minutes", minutes:7, review:0,
        sections:[
          { skills:["Words in Context"],           diffs:["Hard"], count:1 },
          { skills:["Inferences"],                 diffs:["Hard"], count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"], count:1 },
          { skills:["Form, Structure, and Sense"], diffs:["Hard"], count:1 },
          { skills:["Transitions"],                diffs:["Hard"], count:1 },
          { skills:["Rhetorical Synthesis"],       diffs:["Hard"], count:1 },
        ],
        tip:"Friday. Six questions, seven minutes: the same pace as the real test, about seventy seconds each, in the same order.\nThat's more time than you've been using. Spend it on the method, not on second-guessing.\nIf one is taking too long, put something down, flag it, and come back. Never leave a square blank.\nKeep going to the results screen, or it doesn't save. Then rest. Test at the weekend." },
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
