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
  // Maysa — 11 Aug → the 14 Aug class, then a full-length Bluebook mock immediately after.
  // Four short sets, one a day, and the last one lands the day before class so class can work
  // off it and the mock lands on a rehearsed pace. Six questions a set (4 new + 2 review) —
  // she abandons long ones, and she has just had a 13-day gap with nothing assigned.
  //
  // THE READING THAT SHAPED THIS WEEK is not the score column, it is where the seconds went.
  // Across 27 Jul → 7 Aug she spent a median 426s on a Cross-Text question and 164s on a Hard
  // Transitions question — and got every one of them right — then committed a Hard Words in
  // Context question in TWENTY SECONDS and missed it. The pace problem from July is fixed;
  // what replaced it is a triage problem. She is spending her budget on the skills she already
  // owns and starving the one she does not. So this week is not a speed ladder. Three of the
  // four sets are timed with deliberate CUSHION (~80s against the real 71s), and only the last
  // one runs at true pace. Cushion is the teaching instrument here: it gives her room to do the
  // habit under a clock, which is the thing she cannot do at 20 seconds and does not need to
  // practise at 400.
  //
  // Where she is (per-question data in progress.html; do not re-derive from set scores):
  //   • Words in Context — 8/11 at Hard since 27 Jul. Rebuilt to 6/6 UNTIMED on 27 Jul, then
  //     3/5 cold on 31 Jul. Coached is not cold. The untimed rung is spent; the rung due is
  //     timed-with-cushion. Set 1.
  //   • Transitions — taught 6 Aug, 10/10 the same night, but UNTIMED and 164s median at Hard.
  //     Accuracy proven, pace never tested. Set 2. It is also a known mock miss (same-direction
  //     elaboration — "Specifically"), so the tip names that family, not just contrast/cause.
  //   • Cross-Text Connections — taught 30 Jul, 5/5, at 426s a question. Pace is the entire
  //     problem. Set 3.
  //   • Rhetorical Synthesis — strong, with one specific trap: she takes the choice that is
  //     accurate but does not serve the stated goal. Two questions in Set 3, one in Set 4.
  //   • Text Structure & Purpose, Info & Ideas, CoE-Quantitative — holding. Maintenance only,
  //     which the review draw now does for free (see below).
  //
  // BANK SUPPLY — read this before writing the next plan, it constrains what can be asked:
  // Words in Context / Hard is down to 3 UNSEEN of 29, and Text Structure & Purpose / Medium is
  // at 0 unseen of 13. A Words-in-Context set is therefore mostly repeats now and will read
  // HIGH; it can no longer function as a cold diagnostic, only as a retention check. The mock
  // is the only honest cold read on that skill left. Do not quote Set 1's score as evidence the
  // skill recovered.
  //
  // REVIEW: no `review: 0` anywhere in this plan — nothing here is a brand-new skill needing
  // the full dose, and after 13 days off the July questions are deep into the ladder's 3-week
  // rung, so the default 2 due questions per set are the maintenance pass. That is why every
  // set is authored as 4 new + 2 review = 6. If you want to lean harder before the mock, put
  // `review: 4` on Set 4 and take minutes to 10 — do not add new questions to do it.
  //
  // ORDER IS THE TEACHING SEQUENCE (sequential unlock — set N opens when N-1 is submitted):
  // Set 1 is the most startable (one skill, familiar). Sets 2 and 3 each take a skill from its
  // untimed rep to its first clock. Set 4 returns all three inside a mixed set at real pace, so
  // every earlier set is doing work for the one after it. `through` is set because sequential
  // unlock no longer enforces spacing — the hub prints the window and asks her to spread them.
  //
  // NOT IN THIS PLAN, DELIBERATELY: Form, Structure, and Sense. It was a mock miss, it has 50
  // questions in the bank, and she has attempted ZERO of them — the strategy has never been
  // taught, and assigning a known weak spot cold is the one thing the house rules forbid. Teach
  // it in the 14 Aug class, then APPEND a Day 5 here (untimed, Easy→Medium, `review: 0`, typed
  // predictions) that same evening. Leave `start` at 2026-08-11 when you do: completion is keyed
  // psat89_hw_<student>_<start>_<n>, so a new start date orphans these four and re-serves them.
  "Maysa": {
    title: "Four sets to the class, then the mock — spend the seconds where they buy something",
    start: "2026-08-11",
    through: "2026-08-14",    // required: sequential unlock stops enforcing spacing, so we ask
    unlock: "sequential",     // set 1 open now; each later set opens when the one before is submitted
    days: [
      { n:1, focus:"Words in Context (Hard) — cold, on the clock, with room", minutes:8,
        sections:[
          { skills:["Words in Context"], diffs:["Hard"],   count:3 },
          { skills:["Words in Context"], diffs:["Medium"], count:1 },
        ],
        tip:"About 80 seconds a question — more than the real test gives you. Use it.\nOn 31 July you answered one of these in twenty seconds and got it wrong. Twenty seconds is not thinking, it is guessing quickly.\nCover the word. Say your own word for the blank out loud BEFORE you look at the choices.\nThen take the choice closest to your word — not the choice that is the word's most familiar meaning." },
      { n:2, focus:"Transitions — first time under a clock", minutes:8,
        sections:[
          { skills:["Transitions"], diffs:["Medium"], count:2 },
          { skills:["Transitions"], diffs:["Hard"],   count:2 },
        ],
        tip:"You went 10 for 10 on these last Thursday with no clock. This is the same skill with one.\nName the relationship between the two sentences BEFORE you read the options: same direction, opposite direction, cause, example, or sequence.\nSame-direction is the one that catches people — a sentence that restates or narrows the one before it wants \"specifically\", \"in fact\", \"indeed\", not \"however\".\nIf two options mean the same thing, neither is the answer." },
      { n:3, focus:"Cross-Text at pace + the synthesis goal trap", minutes:8,
        sections:[
          { skills:["Cross-Text Connections"], diffs:["Medium"], count:2 },
          { skills:["Rhetorical Synthesis"],   diffs:["Hard"],   count:2 },
        ],
        tip:"One clock for two very different jobs — that is the point of this set. The Cross-Text pair needs about two minutes each; the synthesis pair needs about one. Budget it that way on purpose.\nCross-Text: settle what EACH author actually claims before you read a single choice. Then ask what the second one would say about the first.\nSynthesis: read the goal in the question and say it back in your own words first. Then take the choice that does that job — not the one that is simply true. That is the trap you fall into, and it is the only reason you miss these." },
      { n:4, focus:"Mixed — all of it, real PSAT pace. Dress rehearsal for the mock.", minutes:7,
        sections:[
          { skills:["Words in Context"],                   diffs:["Hard"], count:1 },
          { skills:["Transitions"],                        diffs:["Hard"], count:1 },
          { skills:["Rhetorical Synthesis"],               diffs:["Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Hard"], count:1 },
        ],
        tip:"Real pace now — about 71 seconds a question, which is what the test actually gives you.\nEverything from this week, mixed, plus whatever you missed along the way.\nThe rehearsal is not for the questions, it is for the budget: when one is taking too long, choose and move. A question you leave unreached scores exactly the same as one you got wrong, and it costs you the two after it.\nRead it all, predict, then choose." },
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
function hwDayOpen(student, plan, n) {
  if (!plan) return n === 1;
  if (plan.unlock === 'sequential') {
    if (n <= 1) return true;
    try {
      for (var i = 1; i < n; i++) {
        if (localStorage.getItem('psat89_hw_' + student + '_' + plan.start + '_' + i) !== '1') return false;
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
