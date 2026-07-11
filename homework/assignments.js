// ══════════════════════════════════════════════════════════════════
// PSAT 8/9 — per-student homework assignments.
// The tutor "assigns" by editing this file: one entry per student
// (keyed by the name their password maps to in gate.js), a start date,
// and a day-by-day plan. Days unlock by date so the student gets a new
// task each day. No server needed for the plan itself.
// ══════════════════════════════════════════════════════════════════

const HOMEWORK = {
  // Maysa — week of 7/11. Last week's 3 big sets went undone: she opened them late,
  // answered one question, and ran out of time. So this week is six short sets, not
  // three long ones — a set she finishes teaches more than a set she abandons.
  //
  // Where she is: WiC + Rhetorical Synthesis mastered at Hard. Info & Ideas strong at
  // Medium. Text Structure & Purpose taught 7/10 but only ever practised untimed.
  // Command of Evidence — Quantitative assigned 7/8 and never attempted.
  //
  // minutes:0 = untimed, and the runner then asks her to TYPE her prediction — the full
  // scaffold, for skills she is still learning. minutes>0 = timed, and the runner shows a
  // one-click commit gate instead: same predict-first habit, but she can't type on test
  // day and typing would corrupt the timing. New skill → untimed. Known skill → clock.
  //
  // Days 4 and 6 deliberately list Medium *and* Hard: prioritizePool() draws missed
  // questions first, but only from a pool matching the set's skill AND difficulty. Keeping
  // Medium in scope is what lets this week's misses come back around before class.
  //
  // Pace: PSAT 8/9 is 71 sec/question (32 min ÷ 27 q). Day 3-4 give her ~80s of cushion;
  // Days 5-6 are at the real thing.
  "Maysa": {
    title: "Predict-first: new skills untimed → known skills on the clock",
    start: "2026-07-11",      // YYYY-MM-DD: the day Set 1 becomes available
    unlock: "cumulative",     // "cumulative" = missed days stay open · "strict" = one at a time
    days: [
      { n:1, focus:"Text Structure & Purpose (Medium)",
        skills:["Text Structure and Purpose"], diffs:["Medium"], count:6, minutes:0,
        tip:"Straight from Friday's class, while it's fresh. No clock — type your prediction every time. Ask what the text is DOING, not just what it says, then find the choice that matches." },
      { n:2, focus:"Command of Evidence — Quantitative (new)",
        skills:["Command of Evidence — Quantitative"], diffs:["Medium"], count:6, minutes:0,
        tip:"You haven't attempted this one yet. Read the figure first — axes, units, direction of the trend — and predict what it shows BEFORE the choices. Then check the data supports the whole statement, not half of it." },
      // From here on the days use `sections` — an exact draw per skill. A plain
      // skills/diffs/count day pulls from one ordered pool and takes the top N, which
      // clusters: a 7-question "mixed" set came out as 7 questions of a single skill.
      // Sections are the only way to guarantee a set is actually mixed.
      { n:3, focus:"Information & Ideas (Hard)", minutes:8,
        sections:[
          { skills:["Central Ideas and Details"],        diffs:["Hard"], count:2 },
          { skills:["Inferences"],                       diffs:["Hard"], count:2 },
          { skills:["Command of Evidence — Textual"],    diffs:["Hard"], count:2 },
        ],
        tip:"First set on the clock. Read the whole text, commit to your prediction, then look. Your misses come from choosing before you've finished reading — the timer is not the reason to skim." },
      { n:4, focus:"The two new skills, stepped up", minutes:8,
        sections:[
          { skills:["Text Structure and Purpose"],           diffs:["Medium","Hard"], count:3 },
          { skills:["Command of Evidence — Quantitative"],   diffs:["Medium","Hard"], count:3 },
        ],
        tip:"Days 1 and 2 at a harder level — and anything you missed then will come back here. Same habit under time: read fully, predict, then choose." },
      { n:5, focus:"Words in Context + Rhetorical Synthesis (Hard)", minutes:7,
        sections:[
          { skills:["Words in Context"],       diffs:["Hard"], count:3 },
          { skills:["Rhetorical Synthesis"],   diffs:["Hard"], count:3 },
        ],
        tip:"Your two strongest skills, now at full PSAT pace — 71 seconds a question. Watch the traps: the familiar meaning of the word, and the choice that's true but doesn't serve the goal." },
      { n:6, focus:"Mixed — everything, on the clock", minutes:8,
        sections:[
          { skills:["Words in Context"],                     diffs:["Medium","Hard"], count:1 },
          { skills:["Rhetorical Synthesis"],                 diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                           diffs:["Medium","Hard"], count:1 },
          { skills:["Central Ideas and Details"],            diffs:["Medium","Hard"], count:1 },
          { skills:["Text Structure and Purpose"],           diffs:["Medium","Hard"], count:2 },
          { skills:["Command of Evidence — Quantitative"],   diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Dress rehearsal for class. Every skill mixed, real pace, and this week's misses folded back in. One habit, every single question: read it all, predict, then choose." },
    ]
  },

  // Faith — 11–13 July, three days, because that is all there is: her class is
  // Tue 14 July and today is Sat the 11th. Three sets she finishes beat six she
  // never opens.
  //
  // Her diagnostic: 16/18. Craft & Structure 5/5, Conventions 4/4. Both misses —
  // one Command of Evidence, one Rhetorical Synthesis — came from the SAME habit:
  // she chose an option that was true in itself without checking it did the job the
  // question actually set. So the target this week is not coverage, it is one
  // decision habit: name the claim first, then test each option against it.
  //
  // Rhetorical Synthesis is the other half of that gap, but it has not been taught
  // yet — her only teaching session (7 Jul) covered Information & Ideas. Assigning it
  // cold would hand her her known weak spot with no strategy to meet it. It belongs in
  // the 14 July class, then in homework the week after.
  //
  // Day 1 is untimed on purpose: untimed means the runner asks her to TYPE her
  // prediction, which is what forces her to state the claim before she sees the
  // options. Under a clock she would skip exactly that step. Then 90s, then 80s a
  // question. Full PSAT pace (71s) is next week's target, once RS is taught.
  "Faith": {
    title: "One habit: name the task, then test every option against it",
    start: "2026-07-11",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Command of Evidence — Textual (Medium)",
        skills:["Command of Evidence — Textual"], diffs:["Medium"], count:6, minutes:0,
        tip:"No clock today — so take the time to do this properly. Before you look at the choices, write down the claim the question is asking you to support, in your own words. Then check each quotation against THAT claim. In your diagnostic you picked an answer that was true but didn't back the actual conclusion — this is the step that stops it." },
      { n:2, focus:"Command of Evidence — Quantitative (Medium)",
        skills:["Command of Evidence — Quantitative"], diffs:["Medium"], count:6, minutes:9,
        tip:"The tables and graphs we did in class. Read the heading, the axes and the units FIRST, and say what the data shows before you look at the choices. Then check the option matches the whole statement, not just part of it." },
      { n:3, focus:"Information & Ideas — mixed", minutes:8,
        sections:[
          { skills:["Command of Evidence — Textual"],      diffs:["Medium","Hard"], count:2 },
          { skills:["Command of Evidence — Quantitative"], diffs:["Medium","Hard"], count:1 },
          { skills:["Inferences"],                         diffs:["Medium","Hard"], count:2 },
          { skills:["Central Ideas and Details"],          diffs:["Medium","Hard"], count:1 },
        ],
        tip:"Everything from Tuesday's class, mixed, before we meet again. Same one habit on every question: what exactly is this question asking me to do? Then reject any choice that is true but doesn't do that job." },
    ]
  },

  // Gabe — sample/placeholder plan; edit to assign.
  "Gabe": {
    title: "This week — mixed Reading & Writing review",
    start: "2026-06-20",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Transitions",          skills:["Transitions"], diffs:["Easy","Medium"], count:6, tip:"Name the connection between the two sentences before looking at the words." },
      { n:2, focus:"Boundaries",           skills:["Boundaries"], diffs:["Easy","Medium"], count:6, tip:"Decide if each part is a complete sentence, then walk the punctuation guide." },
      { n:3, focus:"Light review",          skills:["Words in Context"], diffs:["Easy","Medium"], count:5, tip:"Short set. Predict, then check." },
      { n:4, focus:"Information & Ideas",   skills:["Central Ideas and Details","Inferences"], diffs:["Medium"], count:8, tip:"For the main idea, cover the whole text. For inferences, stay close to what the text says." },
      { n:5, focus:"Command of Evidence",  skills:["Command of Evidence — Textual","Command of Evidence — Quantitative"], diffs:["Medium"], count:8, tip:"Match the evidence to the whole claim. Read the figure before the choices." },
      { n:6, focus:"Mixed review",          skills:["Transitions","Boundaries","Words in Context"], diffs:["Easy","Medium","Hard"], count:6, tip:"A short mix before our session." },
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

// Days available so far, given a start date (cumulative unlock by calendar day).
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

function hwLoadPlan(student, cb) {
  var local = (typeof HOMEWORK !== "undefined" && HOMEWORK[student]) ? HOMEWORK[student] : null;
  var ep = (typeof SHEET_SYNC_ENDPOINT === "string") ? SHEET_SYNC_ENDPOINT : "";
  if (!HW_USE_SHEET || !ep) { cb(local, "local"); return; }
  var done = false, name = "__hwcb" + Math.random().toString(36).slice(2), sc;
  function finish(plan) { if (done) return; done = true;
    try { delete window[name]; } catch (e) {}
    if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
    var ok = plan && plan.days && plan.days.length;
    cb(ok ? plan : local, ok ? "sheet" : "default"); }
  var timer = setTimeout(function(){ finish(null); }, 9000);
  window[name] = function(data){ clearTimeout(timer); finish(data); };
  sc = document.createElement("script");
  sc.src = ep + (ep.indexOf("?") < 0 ? "?" : "&") + "action=plan&student=" + encodeURIComponent(student) + "&callback=" + name;
  sc.onerror = function(){ clearTimeout(timer); finish(null); };
  document.body.appendChild(sc);
}

if (typeof window !== "undefined") { window.HOMEWORK = HOMEWORK; window.hwDaysAvailable = hwDaysAvailable; window.hwLoadPlan = hwLoadPlan; window.hwParseDate = hwParseDate; }
