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
// CLASS MISSES, OPT-IN. `reviewClassMisses: true` on a plan (or a day) lets a
// question MISSED in a class route come back as review once the miss cooldown
// clears. Class items carry no ledger row, so without it they never return.
// Baseline misses never qualify. See the exposure section in AGENTS.md.
//
// AUTHOR THE COUNTS AROUND IT. A six-question day is now 4 new + 2 review, not 6 + 2.
// Short sets she finishes still beat long sets she abandons.
// ══════════════════════════════════════════════════════════════════

const HOMEWORK = {
  // Three required sittings: untimed structure practice, a conditional clock, then mixed retention.
  // Fixed question coverage keeps the total at 6 / 6 / 4; the regular ledger still records each attempt.
  "Maysa": {
  "title": "Three short sets — read the structure, then move",
  "start": "2026-10-05",
  "through": "2026-10-08",
  "unlock": "sequential",
  "days": [
    {
      "n": 1,
      "focus": "Monday — deciding evidence, no clock",
      "minutes": 0,
      "review": 0,
      "sections": [
        {
          "skills": [
            "Form, Structure, and Sense"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "155c9bf7"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "01f418eb"
          ],
          "count": 1
        },
        {
          "skills": [
            "Form, Structure, and Sense"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "8d310eb0"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "78b88c04"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "790fc366"
          ],
          "count": 1
        },
        {
          "skills": [
            "Inferences"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "ce129344"
          ],
          "count": 1
        }
      ],
      "explanations": {
        "01f418eb": "D is correct. The comma after His poems opens the supplementary clause which ... compositions. A second comma closes it. Remove that clause: His poems often defy easy understanding. Do not separate often from defy.",
        "8d310eb0": "C is correct. Inexpensive describes the cameras, not the filmmakers. Put inexpensive next to professional quality digital cameras. A and D attach that are inexpensive to filmmakers; B leaves these unclear. The opening While clause is already a finite dependent clause: the deciding issue here is which noun the description belongs to.",
        "78b88c04": "C is correct. Group the three products with their dates: Chickasaw Anompa, in 2009; Chickasaw TV, in 2010; and a Rosetta Stone course, in 2015. Commas stay inside the items and semicolons separate the whole items. A semicolon can separate complex-list items even when an item is not a complete sentence.",
        "790fc366": "A is correct. Nakalembe does not just compile the information and she also shares her findings are two complete clauses. Though belongs at the end of the first clause: information, though;. It needs its comma, and the semicolon supplies the boundary between the clauses."
      },
      "tip": "Monday, October 5. Six questions; no clock. Keep your notes closed for each first attempt. Type the evidence that decides the answer, not an answer letter.\nFor a description, ask which noun it belongs to. Example: The team bought lightweight cameras for photographers. Lightweight describes cameras. An opening While clause is a different structure.\nFor punctuation, first check whole list items and both ends of an interruption; then test clause independence. A semicolon can join complete clauses OR separate complex-list items.\nAfter finishing, explain each miss and redo it. Stop after this set; complete the next one on Wednesday."
    },
    {
      "n": 2,
      "focus": "Wednesday — the method in different sentences",
      get minutes() {
        try {
          var saved = JSON.parse(localStorage.getItem('psat89_hwrec_Maysa_2026-10-05_1') || 'null');
          var needed = ['01f418eb', '8d310eb0', '78b88c04', '790fc366'];
          return saved && saved.recs && needed.every(function(id) {
            return saved.recs.some(function(r) { return r.id === id && r.ok === true; });
          }) ? 8 : 0;
        } catch (e) { return 0; }
      },
      "review": 0,
      "sections": [
        {
          "skills": [
            "Form, Structure, and Sense"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "81000f32"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "9911baa0"
          ],
          "count": 1
        },
        {
          "skills": [
            "Form, Structure, and Sense"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "e7bf56e7"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "f10d84ef"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "cf0604c3"
          ],
          "count": 1
        },
        {
          "skills": [
            "Inferences"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "06a57199"
          ],
          "count": 1
        }
      ],
      "explanations": {
        "9911baa0": "B is correct. Pair the comma after Pterosaurs with the comma after vertebrates. Removing the interruption leaves Pterosaurs had wings made of a membrane that ended in over-elongated fingers. Do not put a comma before the essential clause that ended ... .",
        "e7bf56e7": "D is correct. The spores are smaller than pollen and are blown by the wind. That are ... and ... attaches both descriptions to the plural spores. A and B displace smaller than a grain of pollen; C uses singular is for plural spores and creates an unclear attachment.",
        "cf0604c3": "D is correct. Every clinical drug trial ... two groups and only one of them receives the actual medication are complete clauses. Use a semicolon between them and a comma after however. Only one of which does not supply an independent main clause."
      },
      "tip": "Wednesday, October 7. Six different questions. Keep notes closed. If the clock appears, you have eight minutes: predict before choices, answer every question, and flag an unresolved decision after about 75 seconds. Return after reaching the end.\nIf there is no clock, write the deciding evidence before choices and complete the set untimed.\nAfterward, review misses and your two longest decisions. Finish before starting the final set on Thursday."
    },
    {
      "n": 3,
      "focus": "Thursday — required mixed check",
      "minutes": 5,
      "review": 0,
      "sections": [
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "d855ac19"
          ],
          "count": 1
        },
        {
          "skills": [
            "Boundaries"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "e6d93586"
          ],
          "count": 1
        },
        {
          "skills": [
            "Transitions"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "96fa19ad"
          ],
          "count": 1
        },
        {
          "skills": [
            "Rhetorical Synthesis"
          ],
          "diffs": [
            "Easy",
            "Medium",
            "Hard"
          ],
          "questionIds": [
            "967a29a9"
          ],
          "count": 1
        }
      ],
      "explanations": {
        "d855ac19": "B is correct. There is often a large gap between desired and actual numbers is a complete clause. The Germany example explains that gap, so a colon can introduce it. The other choices fuse the example to the first clause or use only a comma between complete clauses.",
        "e6d93586": "D is correct. The subject is the astonishing Japanese stone circles at Oyu; its verb is bear. Keep the subject with its verb. These adjectives build one noun group, so no comma belongs after astonishing or Japanese either."
      },
      "tip": "Thursday, October 8, before class. This third set is required. Four questions, five minutes, notes closed. Predict before choices. Choose, flag a specific doubt if needed, and move on. Return after answering all four.\nReview every miss and any correct answer that took more than 75 seconds. Keep one short note about the evidence that ends the decision.\nComplete the separate full-length Bluebook sitting at the agreed family time if it is still pending, then bring the score report and missed questions to class."
    }
  ]
},
  // Class route only. Existing completion keys retain their start date.
  "Faith": {
    title: "Class route — homework follows the class",
    start: "2026-09-26",
    challenge: "reading-structure-route-20261003",
    classOnly: true,
    days: []
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

  // Luke — class route only, 5 Oct 2026. Existing completion keys retain their start date.
  // The week's homework is authored after class, from the route's responses.
  "Luke": {
    title: "Class route — homework follows the class",
    start: "2026-09-28",
    challenge: "luke-craft-route-20261005",
    classOnly: true,
    days: []
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
  if ((local && local.classOnly) || !HW_USE_SHEET || !ep) { cb(local, "local"); return; }
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
