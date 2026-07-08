// ══════════════════════════════════════════════════════════════════
// PSAT 8/9 — per-student homework assignments.
// The tutor "assigns" by editing this file: one entry per student
// (keyed by the name their password maps to in gate.js), a start date,
// and a day-by-day plan. Days unlock by date so the student gets a new
// task each day. No server needed for the plan itself.
// ══════════════════════════════════════════════════════════════════

const HOMEWORK = {
  // Maysa — after 7/3: WiC(Hard) & Rhetorical Synthesis(Hard) mastered; Info&Ideas 9/10 at Medium.
  // 3 sets: step Info&Ideas up to Hard → introduce Command of Evidence — Quantitative at Medium → mixed-Hard retention.
  // Times = PSAT 8/9 standard 71 sec/question (32 min ÷ 27 q), summed per set and rounded to the minute.
  "Maysa": {
    title: "Information & Ideas → Command of Evidence → Mixed (Hard)",
    start: "2026-07-08",      // YYYY-MM-DD: the day Set 1 becomes available
    unlock: "cumulative",     // "cumulative" = missed days stay open · "strict" = one at a time
    days: [
      { n:1, focus:"Information & Ideas (Hard)",
        skills:["Command of Evidence — Textual","Inferences","Central Ideas and Details"], diffs:["Hard"], count:8, minutes:9,
        tip:"Step up from your 9/10 Medium set. Read the whole text and predict before the options — the one you missed was evidence-matching, so check the choice supports the FULL claim. PSAT pace: 8 × 71s ≈ 9 min." },
      { n:2, focus:"Command of Evidence — Quantitative (new)",
        skills:["Command of Evidence — Quantitative","Command of Evidence — Textual"], diffs:["Medium"], count:8, minutes:9,
        tip:"New skill: reading data. Read the figure — axes, units, trend — BEFORE the choices, then match the data to the whole statement. Start at Medium. PSAT pace: 8 × 71s ≈ 9 min." },
      { n:3, focus:"Mixed retention (Hard)",
        skills:["Words in Context","Rhetorical Synthesis","Inferences","Central Ideas and Details"], diffs:["Hard"], count:6, minutes:7,
        tip:"Quick check that your Hard mastery holds. Same habit every question: read fully, predict, then choose. PSAT pace: 6 × 71s ≈ 7 min." },
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
