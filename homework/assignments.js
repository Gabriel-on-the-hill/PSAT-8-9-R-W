// ══════════════════════════════════════════════════════════════════
// PSAT 8/9 — per-student homework assignments.
// The tutor "assigns" by editing this file: one entry per student
// (keyed by the name their password maps to in gate.js), a start date,
// and a day-by-day plan. Days unlock by date so the student gets a new
// task each day. No server needed for the plan itself.
// ══════════════════════════════════════════════════════════════════

const HOMEWORK = {
  // Maysa — week after a 16/18 baseline; focus Words in Context, then Rhetorical Synthesis.
  "Maysa": {
    title: "This week — Words in Context, then Rhetorical Synthesis",
    start: "2026-06-20",      // YYYY-MM-DD: the day Day 1 becomes available
    unlock: "cumulative",     // "cumulative" = missed days stay open · "strict" = one at a time
    days: [
      { n:1, focus:"Words in Context",            skills:["Words in Context"], diffs:["Easy","Medium"], count:5,
        tip:"Read the Vocabulary guide first. Then: cover the word, predict your own word, pick the closest choice." },
      { n:2, focus:"Words in Context",            skills:["Words in Context"], diffs:["Medium"], count:8,
        tip:"Predict the meaning before reading the choices, then check the tone — positive, negative, or neutral?" },
      { n:3, focus:"Words in Context (light day)", skills:["Words in Context"], diffs:["Easy","Medium"], count:5,
        tip:"Re-read the word-roots table, then a short set. Let it settle — no need to push today." },
      { n:4, focus:"Words in Context + Synthesis", skills:["Words in Context","Rhetorical Synthesis"], diffs:["Hard","Medium"], count:9,
        tip:"Stretch on harder Words in Context. Then read the Rhetorical Synthesis guide and try a few — read the goal first." },
      { n:5, focus:"Rhetorical Synthesis + mix",  skills:["Rhetorical Synthesis","Words in Context"], diffs:["Medium"], count:9,
        tip:"Name the goal before reading the choices. Watch the 'true but off-task' trap." },
      { n:6, focus:"Mixed review",                skills:["Words in Context","Rhetorical Synthesis"], diffs:["Easy","Medium","Hard"], count:6,
        tip:"A short mixed set before our session. Read every explanation. Check your Progress page." },
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

// Days available so far, given a start date (cumulative unlock by calendar day).
function hwDaysAvailable(startStr) {
  const [y,m,d] = (startStr||"").split("-").map(Number);
  if (!y) return 0;
  const start = new Date(y, m-1, d);
  const now = new Date();
  const days = Math.floor((now - start) / 86400000) + 1;   // Day 1 on the start date
  return Math.max(0, days);
}

// Load a student's plan: try the tutor's Google Sheet first (JSONP, so it works
// cross-origin), and fall back to the built-in plan above if there's no endpoint,
// no sheet entry, or the network is slow. Either way the callback gets a plan or null.
function hwLoadPlan(student, cb) {
  var local = (typeof HOMEWORK !== "undefined" && HOMEWORK[student]) ? HOMEWORK[student] : null;
  var ep = (typeof SHEET_SYNC_ENDPOINT === "string") ? SHEET_SYNC_ENDPOINT : "";
  if (!ep) { cb(local); return; }
  var done = false, name = "__hwcb" + Math.random().toString(36).slice(2), sc;
  function finish(plan) { if (done) return; done = true;
    try { delete window[name]; } catch (e) {}
    if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
    cb((plan && plan.days && plan.days.length) ? plan : local); }
  var timer = setTimeout(function(){ finish(null); }, 4000);
  window[name] = function(data){ clearTimeout(timer); finish(data); };
  sc = document.createElement("script");
  sc.src = ep + (ep.indexOf("?") < 0 ? "?" : "&") + "action=plan&student=" + encodeURIComponent(student) + "&callback=" + name;
  sc.onerror = function(){ clearTimeout(timer); finish(null); };
  document.body.appendChild(sc);
}

if (typeof window !== "undefined") { window.HOMEWORK = HOMEWORK; window.hwDaysAvailable = hwDaysAvailable; window.hwLoadPlan = hwLoadPlan; }
