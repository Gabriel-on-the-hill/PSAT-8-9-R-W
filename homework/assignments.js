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
  // Maysa — week of 17 Jul (class Thu 23 Jul; a full-length Bluebook mock also runs this
  // window, 18 Jul → early next week). Back-dated one day so BOTH untimed rebuild sets open
  // on the 18th and the Day-6 rehearsal lands the 22nd, before class. Six short sets — she
  // abandons long ones.
  //
  // Where she is, from the 17 Jul class + homework scores (live per-question data is in
  // progress.html; these are the reported set scores):
  //   • Text Structure & Purpose — 2/6. Re-taught 17 Jul. Weakest; rebuild untimed → timed.
  //   • Words in Context — 3/6 at Hard (slipped from "mastered"). Re-taught 17 Jul; rebuild
  //     at Medium/Hard, NOT Hard-only.
  //   • Command of Evidence — Quantitative — 6/6 at Medium, her first-ever attempt. Proven;
  //     push up and fold into the mix.
  //   • Information & Ideas (Central / Inferences / CoE-Textual) — 4/6 at Hard → ease to Med/Hard.
  //   • Rhetorical Synthesis — held at Hard in June; maintenance.
  // Her live constraint, reaffirmed 17 Jul: she chooses before finishing the passage and runs
  // out of time. So rebuild the habit UNTIMED first, then reintroduce the clock with cushion
  // and ramp to real pace — don't start there.
  //
  // minutes:0 = untimed, and the runner asks her to TYPE her prediction — the full scaffold,
  // for the two skills she is rebuilding. minutes>0 = timed, one-click commit gate instead:
  // same predict-first habit, but she can't type on test day and typing corrupts the timing.
  //
  // Difficulty is per-skill, aimed at ~85%: the two crashed skills drop to a level she can
  // rebuild from; Quant is pushed up; Info & Ideas eased to a mix. Listing Medium *and* Hard
  // on a skill lets prioritizePool() resurface last week's misses at the level she missed them.
  //
  // Pace ramp: untimed → untimed → 90s → 80s → 70s → real pace (71s) by the Day-6 rehearsal.
  //
  // REVIEW UN-FROZEN: last week's plan-level `review: 0` is gone, so every day serves the
  // default 2 due questions pulled from the whole bank. Counts on Days 3–5 are authored as
  // 4 new + 2 review; Day 6 is the fuller 6-skill rehearsal (6 new + 2 review). Days 1–2 keep
  // a day-level `review: 0` — their whole job is the untimed rebuild of one skill, and a typed
  // cross-skill review question does not belong in that set. NOTE: 'Maysa' has been removed
  // from the FROZEN list in review-ladder.test.js, or the freeze-guard test fails.
  "Maysa": {
    title: "Rebuild the two weak skills untimed, then earn the clock back",
    start: "2026-07-17",      // back-dated 1 day: both untimed sets open the 18th, Day 6 lands the 22nd
    unlock: "cumulative",     // "cumulative" = missed days stay open · "strict" = one at a time
    days: [
      { n:1, focus:"Text Structure & Purpose (Medium) — rebuild", review:0,
        skills:["Text Structure and Purpose"], diffs:["Medium"], count:6, minutes:0,
        tip:"Straight from Friday. No clock — type your prediction every time. Ask what the text is DOING, not just what it says: overall structure is the sequence of ideas; purpose is the job of the underlined part. Predict, then find the choice that matches." },
      { n:2, focus:"Words in Context (Medium/Hard) — rebuild", review:0,
        skills:["Words in Context"], diffs:["Medium","Hard"], count:6, minutes:0,
        tip:"No clock — cover the word and predict your own before you look. Use the sentence around it, not the word's most familiar meaning. Type your prediction, then match the closest choice and cut the rest." },
      // From here the days use `sections` — an exact draw per skill. A plain
      // skills/diffs/count day pulls from one ordered pool and takes the top N, which
      // clusters: a 7-question "mixed" set came out as 7 questions of a single skill.
      // Sections are the only way to guarantee a set is actually mixed.
      { n:3, focus:"Information & Ideas (Medium/Hard) — first on the clock, generous", minutes:9,
        sections:[
          { skills:["Central Ideas and Details"],        diffs:["Medium","Hard"], count:2 },
          { skills:["Inferences"],                       diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Textual"],    diffs:["Medium","Hard"], count:1 },
        ],
        tip:"First set back on the clock — but you've got room, ~90 seconds a question. Read the WHOLE passage before you choose; your misses come from picking early, not from the timer. Predict, then look." },
      { n:4, focus:"The two rebuilt skills, on the clock", minutes:8,
        sections:[
          { skills:["Text Structure and Purpose"],           diffs:["Medium"],        count:2 },
          { skills:["Words in Context"],                     diffs:["Medium","Hard"], count:2 },
        ],
        tip:"Friday's two skills, now under time. Same habit: read fully, predict, then choose. Anything you missed on Days 1–2 comes back here — your chance to get it right." },
      { n:5, focus:"Strengths at pace + quantitative pushed up", minutes:7,
        sections:[
          { skills:["Rhetorical Synthesis"],                 diffs:["Medium","Hard"], count:2 },
          { skills:["Command of Evidence — Quantitative"],   diffs:["Medium","Hard"], count:2 },
        ],
        tip:"Your strong skills at near-real pace. Synthesis: name the goal first, then the option that serves it — skip the one that's true but off-goal. Charts: read the axes and units, predict the trend, check the data backs the WHOLE statement." },
      { n:6, focus:"Mixed — everything, real PSAT pace", minutes:9,
        sections:[
          { skills:["Text Structure and Purpose"],           diffs:["Medium"],        count:1 },
          { skills:["Words in Context"],                     diffs:["Medium","Hard"], count:1 },
          { skills:["Rhetorical Synthesis"],                 diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                           diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"],   diffs:["Medium","Hard"], count:1 },
          { skills:["Central Ideas and Details"],            diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Dress rehearsal for class — every skill mixed, real PSAT pace. One habit on every single question: read it all, predict, then choose. This week's misses are folded in." },
    ]
  },

  // Faith — week of 15–20 July (class Tue 21 July). Six short sets. Review dose
  // UN-FROZEN: the plan-level `review: 0` is gone, so every day gets the default 2,
  // and the counts below are authored as 4 new + 2 review. Day 1 keeps a day-level
  // `review: 0` because its job is the full first dose of a brand-new skill.
  // NOTE: also remove 'Faith' from the FROZEN list in review-ladder.test.js, or the
  // freeze-guard test fails.
  //
  // Where she is, from the 13–14 July homework + 14 July session (independent data):
  //   • CoE-Textual, CoE-Quantitative, Inferences — strong, incl. ~75–80% at HARD.
  //   • Central Ideas at HARD is the one soft spot (0/2, small n) — keep it a
  //     Medium/Hard MIX, never Hard-only.
  //   • Rhetorical Synthesis — taught 14 July, so it finally enters homework. Method
  //     she was taught: GOAL FIRST from the keywords (difference, similarity…); the
  //     notes are a tiebreaker only. Never tell her to "read the passage first" on RS.
  //   • A "time-on-text" theory did NOT hold up: she is 15/18 correct at ≤6s on the
  //     passage. Don't coach reading time; difficulty on specific skills is the driver.
  //
  // Untimed (minutes:0) → the runner makes her TYPE the goal/claim. New or shaky skill
  // untimed first (Days 1–2), then on the clock, ramping 90s → 80s → ~70s (real PSAT
  // pace) by the Day 6 rehearsal. RS stays Medium this week; push it to Hard in the
  // 21 July class, then assign Hard RS the week after.
  "Faith": {
    title: "One habit: name the task, then reject anything merely true",
    start: "2026-07-15",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Rhetorical Synthesis (Medium) — new", review:0,
        skills:["Rhetorical Synthesis"], diffs:["Medium"], count:6, minutes:0,
        tip:"Synthesis — goal first. Name what the sentence must DO from the keywords (difference, similarity, emphasize). → Type that goal, then pick the one option that does it and cut the rest. → Two options fit? Now check the notes." },
      { n:2, focus:"Inferences + Central Ideas (untimed)", minutes:0,
        sections:[
          { skills:["Central Ideas and Details"], diffs:["Medium","Hard"], count:2 },
          { skills:["Inferences"],                diffs:["Medium","Hard"], count:2 },
        ],
        tip:"No clock — read the whole passage, then type your prediction before the choices. → Inference: stay inside what the text actually says. → Main idea: cover the whole passage, not one line." },
      { n:3, focus:"Command of Evidence — Textual", minutes:8,
        skills:["Command of Evidence — Textual"], diffs:["Medium","Hard"], count:4,
        tip:"Name the claim in your own words first. → Match each quote to the WHOLE claim, not just part of it. → Trap: a quote can be true and still not back that claim." },
      { n:4, focus:"Rhetorical Synthesis (Medium) — timed", minutes:9,
        skills:["Rhetorical Synthesis"], diffs:["Medium"], count:4,
        tip:"Synthesis on the clock. → Goal first, from the keywords, then the option that serves it. → Two fit? Check the notes. → Trap: accurate, but answers a different goal." },
      { n:5, focus:"Information & Ideas — mixed", minutes:8,
        sections:[
          { skills:["Command of Evidence — Textual"],      diffs:["Medium","Hard"], count:1 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                         diffs:["Medium","Hard"], count:1 },
          { skills:["Central Ideas and Details"],          diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Mixed Information & Ideas, timed. → Read the passage, predict, then choose. → One rule: name the task, then reject any option that is true but off-task." },
      { n:6, focus:"Mixed — dress rehearsal", minutes:7,
        sections:[
          { skills:["Rhetorical Synthesis"],          diffs:["Medium"],        count:1 },
          { skills:["Command of Evidence — Textual"], diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                    diffs:["Medium","Hard"], count:1 },
          { skills:["Central Ideas and Details"],     diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Dress rehearsal — full PSAT pace. → Every question: name the task, predict, choose. → Reject anything merely true." },
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
