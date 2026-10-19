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
  // Maysa — week of 12 Oct 2026, exam Wed 21 Oct. Tutor notes: Maysa/2026-10-12 — Homework recommendation (week of 12 Oct).md.
  // Replaces the 9 Oct class-only card; that route's definition stays in challenge/sets.js.
  // Three precise sets, one opening a day (start 2026-10-13 → Day 1 = Tue 13, 2 = Wed 14, 3 = Thu 15, before class).
  // Chain: untimed method rep with one delayed review (1) → untimed delayed retry plus contrast items where a
  // semicolon is offered and wrong (2) → six at 71 s/q in test order, only skill types already answered untimed (3).
  // Boundaries method notes are taken with the choices visible (the deciding words sit in the options).
  "Maysa": {
    title: "Three short sets before Thursday's class",
    start: "2026-10-13",
    through: "2026-10-15",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Tuesday — words, purpose and sentence structure, no clock", minutes:0, review:0,
        responses:{"16fa54b2":{key:"boundaries", phase:"with-options"}, "7ac9793d":{key:"boundaries", phase:"with-options"}, "a481fe22":{key:"boundaries", phase:"with-options"}, "6c8a1cc2":{key:"boundaries", phase:"with-options"}, "3b93a177":{key:"boundaries", phase:"with-options"}, "174c3487":{key:"boundaries", phase:"with-options"}, "4d176409":{key:"boundaries", phase:"with-options"}, "0ecf02c1":{key:"boundaries", phase:"with-options"}},
        slots:[
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "ef21e818", "reserveIds": ["05f213a7", "7269f02b"], "allowPool": false},
          {"skills": ["Text Structure and Purpose"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "0ff6c528", "reserveIds": ["0e3ef14c", "2eefc4f4"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "SVA", "intent": "fresh", "preferredId": "11add1e8", "reserveIds": ["ca1a7097", "9f8d0acb"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "16fa54b2", "reserveIds": ["6c8a1cc2", "3b93a177"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "7ac9793d", "reserveIds": ["174c3487", "4d176409"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Commas", "intent": "review", "preferredId": "a481fe22", "reserveIds": ["0ecf02c1"], "allowPool": false},
        ],
        tip:"Opens Tuesday. Six questions, no clock, about fifteen minutes, in one sitting.\nWrite what decides the answer before you choose. A blank line or a single word doesn't count.\nWords: the meaning the sentence needs in your own words, then sort the choices: fits, doesn't fit, don't know.\nPurpose: what the exact underlined part DOES, with a verb.\nVerbs: cross out the extra description and find the subject. One or more than one?\nPunctuation: look at the choices, then name what sits on each side of the blank. A full sentence? A list item? Words like however or though belong to one side. Then ask again: are both sides full sentences?\nKeep going to the results screen, or it doesn't save." },
      { n:2, focus:"Wednesday — lists and though/however, no clock", minutes:0, review:0,
        responses:{"fa821b89":{key:"boundaries", phase:"with-options"}, "87a786d7":{key:"boundaries", phase:"with-options"}, "f10d84ef":{key:"boundaries", phase:"with-options"}, "96beb3e2":{key:"boundaries", phase:"with-options"}, "a181c44b":{key:"boundaries", phase:"with-options"}, "6c8a1cc2":{key:"boundaries", phase:"with-options"}, "0be4dd74":{key:"boundaries", phase:"with-options"}, "c272488a":{key:"boundaries", phase:"with-options"}, "be6f3070":{key:"boundaries", phase:"with-options"}, "7e989974":{key:"boundaries", phase:"with-options"}, "7e67e829":{key:"boundaries", phase:"with-options"}, "c3d3b49b":{key:"boundaries", phase:"with-options"}},
        slots:[
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "a123ac00", "reserveIds": ["e96916fa", "2735f617"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "fa821b89", "reserveIds": ["6c8a1cc2", "0be4dd74"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Commas", "intent": "fresh", "preferredId": "87a786d7", "reserveIds": ["c272488a"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "review", "preferredId": "f10d84ef", "reserveIds": ["be6f3070"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Medium"], "ruleType": "Commas", "intent": "fresh", "preferredId": "96beb3e2", "reserveIds": ["7e989974"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "a181c44b", "reserveIds": ["7e67e829", "c3d3b49b"], "allowPool": false},
        ],
        tip:"Opens Wednesday. Six questions, no clock, about fifteen minutes.\nWords: same as Tuesday. Your own meaning first, then sort the choices.\nLists: before you pick, bracket each whole item in the list. If the items already have commas inside them, semicolons go between the items. If they don't, commas are enough.\nThough and however: first decide which side the word belongs to. Then check both sides again. Two full sentences still need a semicolon or a full stop. If one side isn't a full sentence, commas.\nWrite your reason before you choose.\nKeep going to the results screen, or it doesn't save." },
      { n:3, focus:"Thursday — six at test pace, seven minutes", minutes:7, review:0,
        slots:[
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "89f2d981", "reserveIds": ["5181c59f", "e20bb38b"], "allowPool": false},
          {"skills": ["Text Structure and Purpose"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "922591db", "reserveIds": ["9bd6421b", "b5fe1485"], "allowPool": false},
          {"skills": ["Command of Evidence — Quantitative"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "74a816be", "reserveIds": ["92add068", "cee94893"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "NoPunct", "intent": "fresh", "preferredId": "508ab5ba", "reserveIds": ["bdd3c593", "4bd2fb5a"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "SVA", "intent": "fresh", "preferredId": "67165318", "reserveIds": ["8da67ee3", "fe423c5d"], "allowPool": false},
          {"skills": ["Transitions"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "740ada1b", "reserveIds": ["3e75bfa7", "8f0226dc"], "allowPool": false},
        ],
        tip:"Opens Thursday. Do it before class. Six questions in seven minutes: the real test's pace, about seventy seconds each, in test order.\nKeep the short prediction in your head or on paper: what does the answer have to do?\nAt about seventy-five seconds, pick your best answer, flag it and move on. Come back if there's time. Never leave a blank.\nAfterwards, pick three or four questions you missed this week. For each one, write: my prediction, was it right, what pulled me to the wrong choice, and the words that prove the right one. Bring it to class.\nKeep going to the results screen, or it doesn't save." },
    ]
  },

  // Faith — week of 12 Oct 2026, exam Tue 20 Oct. Tutor notes: Faith/Homework Recommendation - 12 Oct 2026.md.
  // Day 15 (sections) is unchanged. Days 18/19/23 are precise `slots` sets, one opening a day
  // on its calendar date (start 2026-09-26 → Day 18 = Tue 13, 19 = Wed 14, 23 = Sun 18).
  // Chain: untimed method rep (18) → same skills at 71 s/q (19) → module back half (Q15–27) timed in the
  // 17 Oct class route → module front half (Q1–14), 14 in 17 min (23). Day 20 removed 17 Oct: timed
  // rehearsals run inside class time, never as homework. Review is explicit (two delayed misses in 18).
  // heldIds: Bluebook-matched items and the 10 and 17 Oct class-route items stay out of every precise draw.
  "Faith": {
    title: "Test week — short sets, then a module in two halves",
    start: "2026-09-26",
    through: "2026-10-19",
    unlock: "cumulative",
    heldIds: ["037ca0e3", "03fac32d", "08241402", "0906d0e9", "12439831", "1318fdb1", "25e55fc4", "2b2bcae4", "2d2cbb86", "327a94c9", "35541d09", "416dc9e5", "41ad9634", "436f939d", "4445ca92", "496aaf68", "4b752f9e", "4d8edd97", "4ea959e8", "50fcd5b9", "530e1b55", "53c9ecdf", "55ccbcd9", "610faed3", "748e3f2e", "74e1f4aa", "7905cdfd", "7923766b", "795f82e0", "898ccd6c", "9145aba0", "9452459b", "9c5e75b6", "9f8d0acb", "a0ea5596", "a30567fd", "a91c661e", "aa76c2b1", "ad601e7d", "adac21ac", "adb959d5", "b2752304", "b33e3d13", "b5fe1485", "b6306a5e", "bf0d6766", "c272488a", "c31e12f5", "cb3c6dd5", "d8635251", "ddc6182b", "e07ee967", "e45736e2", "efc485e8", "f0e50576", "f49dd3d5", "f5141f88", "f5554e1a", "fa795825"],
    days: [
      { n:15, focus:"Set 1 — relationships, main idea and sentence spines, no clock", minutes:0,
        sections:[
          { skills:["Transitions"],               diffs:["Hard"], count:2 },
          { skills:["Central Ideas and Details"], diffs:["Hard"], count:2 },
          { skills:["Boundaries"],                diffs:["Hard"], count:2 },
        ],
        tip:"No clock. Do this after today's class, notes closed, in one sitting.\nTransitions: before you look at the choices, name what the second sentence does to the first: same direction, turn (including \"yes, but still\"), zoom in, example, or cause/time.\nMain idea: write the topic and the point in one line. Then test every option: is it in the text, and is it the whole point or only one sentence?\nPunctuation: find the subject and main verb on each side of the blank before you look at the marks.\nAfterward, read the explanation for anything you got wrong." },
      { n:18, focus:"Set 2 — purpose, main idea, graphs, verbs and transitions, no clock", minutes:0, review:0,
        slots:[
          {"skills": ["Text Structure and Purpose"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "6b4942f5", "reserveIds": ["2eefc4f4", "09a0c561"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "0e089cb6", "reserveIds": ["20a94cb0", "3caa2431"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "review", "preferredId": "66bb1c57", "reserveIds": ["17135825"], "allowPool": false},
          {"skills": ["Command of Evidence — Quantitative"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "b611a44e", "reserveIds": ["9867b06a", "b6c2f552"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "2b146272", "reserveIds": ["6f033643", "9c958b1d"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "9976b8b0", "reserveIds": ["50e9ae29"], "allowPool": false},
          {"skills": ["Transitions"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "c3b660af", "reserveIds": ["d2a4946d", "99de7e8a"], "allowPool": false},
          {"skills": ["Transitions"], "diffs": ["Hard"], "intent": "review", "preferredId": "8c46294f", "reserveIds": ["d8594b7f"], "allowPool": false},
        ],
        tip:"Opens Tuesday. Eight questions, no clock, about fifteen minutes, in one sitting.\nBefore the choices appear, write what the answer has to do:\nPurpose: what does this exact sentence or phrase DO? Use a verb (shows, explains, gives an example, answers a question).\nMain idea: topic + point in one line. Then test each choice: is it in the text, and is it the whole point?\nGraph: write the exact conclusion first, then find the numbers that prove THAT conclusion.\nVerbs: strip away the descriptions. Find the subject. Does its sentence still need a real verb? \"having served\" or \"to serve\" cannot be the main verb.\nTransitions: name the link first. Sequence (first/then/previously) is not contrast. \"Specifically\" gives exact details; \"thus\" gives a result.\nKeep going to the results screen, or it doesn't save." },
      { n:19, focus:"Set 3 — six questions at test pace, seven minutes", minutes:7, review:0,
        slots:[
          {"skills": ["Text Structure and Purpose"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "f1947c86", "reserveIds": ["ae580208", "8dad50ee"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "b7cff5f4", "reserveIds": ["5a89ebaa", "fda10103"], "allowPool": false},
          {"skills": ["Inferences"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "dea40f22", "reserveIds": ["ef2d59f9", "7785d9c3"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Colon", "intent": "fresh", "preferredId": "685b423c", "reserveIds": ["eeef834b", "772f062c"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "VForm", "intent": "fresh", "preferredId": "a9f8dd79", "reserveIds": ["63141bea"], "allowPool": false},
          {"skills": ["Transitions"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "29dd7b26", "reserveIds": ["b2934aaa", "167ae50b"], "allowPool": false},
        ],
        tip:"Opens Wednesday. Six questions, seven minutes: the real test's pace, about seventy seconds each.\nStill say to yourself what the answer has to do before you look at the choices.\nIf a question passes about seventy-five seconds, pick the best choice, flag it, move on. Never leave a blank.\nUse the time. Finishing with more than three minutes left means you rushed.\nKeep going to the results screen, or it doesn't save." },
      { n:23, focus:"Set 5 — questions 1 to 14 of a module, on the clock", minutes:17, review:0,
        slots:[
          {"skills": ["Words in Context"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "1fe42bd4", "reserveIds": ["f5cd59f3", "80025650"], "allowPool": false},
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "5c80bb1c", "reserveIds": ["cc7c67b3", "95d55b5e"], "allowPool": false},
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "cd945a25", "reserveIds": ["a0a6ac5d", "7a4e133e"], "allowPool": false},
          {"skills": ["Text Structure and Purpose"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "d7eb6d4b", "reserveIds": ["674fb15c", "15074829"], "allowPool": false},
          {"skills": ["Text Structure and Purpose"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "f914b408", "reserveIds": ["b6b54cca", "c9d1aa69"], "allowPool": false},
          {"skills": ["Text Structure and Purpose"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "61ac22f2", "reserveIds": ["628b96b0", "f23fc383"], "allowPool": false},
          {"skills": ["Cross-Text Connections"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "a2d8df04", "reserveIds": ["005d770c", "369729c4"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "e111c334", "reserveIds": ["bf09f839", "737a2aca"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "a8b34bf5", "reserveIds": ["6d764ebc", "73feebf8"], "allowPool": false},
          {"skills": ["Command of Evidence — Textual"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "da9a6075", "reserveIds": ["fc6556b6", "6abd46ef"], "allowPool": false},
          {"skills": ["Command of Evidence — Textual"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "f05ad7e3", "reserveIds": ["41a6bb19", "4c48be56"], "allowPool": false},
          {"skills": ["Command of Evidence — Quantitative"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "12ab9acf", "reserveIds": ["f3f5de3c", "4c90d0f0"], "allowPool": false},
          {"skills": ["Command of Evidence — Quantitative"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "5b585115", "reserveIds": ["7aefd1b2", "dfc317a2"], "allowPool": false},
          {"skills": ["Inferences"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "29546833", "reserveIds": ["a5076a43", "496b1927"], "allowPool": false},
        ],
        tip:"Opens Sunday. Fourteen questions in seventeen minutes: the first half of a module, in test order. You did the second half in class on Saturday, so together that is a full module.\nWrite your pacing rule at the top of your paper first:\n1. Name the job before the choices: grammar, find the subject and its main verb; transitions, what the sentence after the blank does to the one before it.\n2. About seventy-five seconds, then pick, flag and move. Never leave a blank.\n3. Question 14 done with about sixteen minutes left on a real test. Here, that is the end of the clock.\nThen stop for the day. Monday is for rest.\nKeep going to the results screen, or it doesn't save." },
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

  // Luke — 20 Oct 2026, the night of the 19 Oct class (exam Tue 20 Oct). The five verb questions promised in class.
  // One untimed set, both outcomes of the main-verb check, choices visible. Tutor notes: Luke/LEDGER.md.
  // Replaces the 14 Oct three-set plan (archived below).
  "Luke": {
    title: "Five verb questions",
    start: "2026-10-20",
    through: "2026-10-20",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Verbs — is the main verb already there? No clock", minutes:0, review:0,
        responses:{"e32abb06":{key:"verbForm", phase:"with-options"}, "f49dd3d5":{key:"verbForm", phase:"with-options"}, "dc712bbf":{key:"verbForm", phase:"with-options"}, "2ce70cd2":{key:"verbForm", phase:"with-options"}, "a9f8dd79":{key:"verbForm", phase:"with-options"}, "63141bea":{key:"verbForm", phase:"with-options"}, "7817773e":{key:"verbForm", phase:"with-options"}, "f3290e7d":{key:"verbForm", phase:"with-options"}, "351084bd":{key:"verbForm", phase:"with-options"}, "392848bf":{key:"verbForm", phase:"with-options"}},
        slots:[
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "e32abb06", "reserveIds": ["f49dd3d5"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "dc712bbf", "reserveIds": ["2ce70cd2"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "VForm", "intent": "fresh", "preferredId": "a9f8dd79", "reserveIds": ["63141bea"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "VForm", "intent": "fresh", "preferredId": "7817773e", "reserveIds": ["f3290e7d"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "351084bd", "reserveIds": ["392848bf"], "allowPool": false},
        ],
        tip:"Five verb questions, no clock, about ten minutes, in one sitting tonight. If you haven't started by 1 am, skip it and sleep: tomorrow matters more.\nFor each one: name the subject, then look through the WHOLE sentence for its main verb, even far after the blank.\nMain verb already there? The blank only describes (an -ing, -ed or to- form).\nNo main verb yet? The blank IS the main verb, and it must match its subject.\nThe choices are visible: use them to see what changes, but decide the job of the blank first." },
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
// HOUSE DEFAULT (11 Oct 2026) IS `cumulative`, one set a day: see AGENTS.md "One set opens a
// day". What follows describes `sequential`, still supported: set 1 is always open, and each later set opens
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
    // Earlier sets are the plan's own set numbers below n (a plan may start at n:15).
    var earlier = (plan.days || []).map(function (d, k) { return (d && Number(d.n)) || (k + 1); })
      .filter(function (m) { return m < n; });
    if (!earlier.length) return true;
    try {
      for (var j = 0; j < earlier.length; j++) {
        var i = earlier[j];
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

// Superseded plan definitions are retained separately; the hub serves HOMEWORK only.
if (typeof window !== "undefined") {
  window.HOMEWORK_ARCHIVE = window.HOMEWORK_ARCHIVE || {};
  window.HOMEWORK_ARCHIVE["Maysa"] = window.HOMEWORK_ARCHIVE["Maysa"] || {};
  window.HOMEWORK_ARCHIVE["Maysa"]["2026-10-05"] = {
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
};
}

// Luke's 12 Oct plan, superseded on 14 Oct by the final-week plan above.
if (typeof window !== "undefined") {
  window.HOMEWORK_ARCHIVE = window.HOMEWORK_ARCHIVE || {};
  window.HOMEWORK_ARCHIVE["Luke"] = window.HOMEWORK_ARCHIVE["Luke"] || {};
  window.HOMEWORK_ARCHIVE["Luke"]["2026-10-12"] = {
    title: "Two short sets this week",
    start: "2026-10-12",
    through: "2026-10-17",
    unlock: "cumulative",
    reviewClassMisses: true,
    days: [
      { n:1, focus:"Purpose, two texts, evidence and verbs — no clock", minutes:0,
        sections:[
          { skills:["Text Structure and Purpose"],         diffs:["Medium"], count:1 },
          { skills:["Text Structure and Purpose"],         diffs:["Hard"],   count:1 },
          { skills:["Cross-Text Connections"],             diffs:["Medium"], count:1 },
          { skills:["Command of Evidence — Textual"],      diffs:["Hard"],   count:1 },
          { skills:["Boundaries"],                         diffs:["Hard"],   count:1, ruleTypes:["Semi"] },
          { skills:["Form, Structure, and Sense"],         diffs:["Hard"],   count:1, ruleTypes:["VForm"] },
        ],
        tip:"Start it with your tutor at the end of class, and finish it on Tuesday. Six new questions and up to two you have seen before. No clock, about fifteen minutes.\nBefore the choices, write what the question needs: what the sentence DOES (start with a verb), what each text claims, or what the claim needs the evidence to show.\nBefore you choose a semicolon or a period, name the real verb on each side. No real verb on one side, no semicolon. For verb questions: does the sentence already have its real verb, or does the blank have to be it?\nKeep going to the results screen, or it doesn't save." },

      { n:2, focus:"Six questions at test pace — seven minutes", minutes:7, review:0,
        sections:[
          { skills:["Words in Context"],           diffs:["Hard"],   count:1 },
          { skills:["Central Ideas and Details"],  diffs:["Hard"],   count:1 },
          { skills:["Inferences"],                 diffs:["Hard"],   count:1 },
          { skills:["Boundaries"],                 diffs:["Hard"],   count:1, ruleTypes:["Semi"] },
          { skills:["Transitions"],                diffs:["Hard"],   count:1 },
          { skills:["Rhetorical Synthesis"],       diffs:["Hard"],   count:1 },
        ],
        tip:"Opens Tuesday. Do it on a different day from Set 1, at the time you agreed with your tutor. Six questions in test order, seven minutes: the real test's pace, about seventy seconds each.\nUse the time. If you finish with more than three minutes left, you went too fast.\nStill say to yourself what the answer has to do before you look at the choices.\nIf one is taking too long, put something down, flag it, and come back. Never leave a square blank.\nKeep going to the results screen, or it doesn't save." },
    ]
  };
}

// Luke's 14 Oct final-week plan, superseded on 20 Oct by the five verb questions above.
if (typeof window !== "undefined") {
  window.HOMEWORK_ARCHIVE = window.HOMEWORK_ARCHIVE || {};
  window.HOMEWORK_ARCHIVE["Luke"] = window.HOMEWORK_ARCHIVE["Luke"] || {};
  window.HOMEWORK_ARCHIVE["Luke"]["2026-10-14"] = {
    title: "Three short sets before the practice test",
    start: "2026-10-14",
    through: "2026-10-16",
    unlock: "cumulative",
    days: [
      { n:1, focus:"Wednesday — punctuation, purpose and two texts, no clock", minutes:0, review:0,
        responses:{"6d07e4e3":{key:"boundaries", phase:"with-options"}, "d294d324":{key:"boundaries", phase:"with-options"}, "772f062c":{key:"boundaries", phase:"with-options"}, "a181c44b":{key:"boundaries", phase:"with-options"}, "0be4dd74":{key:"boundaries", phase:"with-options"}, "7ac9793d":{key:"boundaries", phase:"with-options"}, "fa795825":{key:"boundaries", phase:"with-options"}, "610faed3":{key:"boundaries", phase:"with-options"}, "be6f3070":{key:"boundaries", phase:"with-options"}, "f10d84ef":{key:"boundaries", phase:"with-options"}, "9e1567fe":{key:"boundaries", phase:"with-options"}},
        slots:[
          {"skills": ["Text Structure and Purpose"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "5cb1e7d4", "reserveIds": ["e7b4523e", "f7214ef4"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Colon", "intent": "fresh", "preferredId": "6d07e4e3", "reserveIds": ["d294d324", "772f062c"], "allowPool": false},
          {"skills": ["Cross-Text Connections"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "e864a04f", "reserveIds": ["005d770c", "369729c4"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "review", "preferredId": "fa795825", "reserveIds": ["be6f3070", "f10d84ef"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Medium"], "ruleType": "VForm", "intent": "fresh", "preferredId": "cc0dcd9a", "reserveIds": ["0cdbfd0f", "b50e1ec3"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "a181c44b", "reserveIds": ["0be4dd74", "7ac9793d"], "allowPool": false},
          {"skills": ["Rhetorical Synthesis"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "9d8d3faf", "reserveIds": ["36246bab", "fedee38c"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Colon", "intent": "review", "preferredId": "610faed3", "reserveIds": ["9e1567fe"], "allowPool": false},
        ],
        tip:"Opens Wednesday. Eight questions, no clock, about fifteen to twenty minutes, in one sitting.\nWrite what decides the answer before you choose. A blank line or a single word doesn't count.\nPurpose: what the exact part DOES, starting with a verb (shows, explains, contrasts, gives an example).\nTwo texts: one line for what each text claims, then how Text 2 would answer Text 1.\nVerbs: does the sentence already have its real verb, or does the blank have to be it?\nPunctuation: look at the choices, then write what sits on each side of the blank (full sentence, or not?) AND which marks that allows. Words ending in -ing can be the subject of a full sentence. Check that the mark you pick matches what you wrote.\nKeep going to the results screen, or it doesn't save." },

      { n:2, focus:"Thursday — words, main idea, inferences, links and goals, no clock", minutes:0, review:0,
        slots:[
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "7821db13", "reserveIds": ["5c80bb1c", "6d7897fa"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "e43225b7", "reserveIds": ["17135825", "6eecc3d4"], "allowPool": false},
          {"skills": ["Central Ideas and Details"], "diffs": ["Hard"], "intent": "review", "preferredId": "b2752304", "reserveIds": ["7905cdfd", "fb473f4d"], "allowPool": false},
          {"skills": ["Inferences"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "ab0ec9fa", "reserveIds": ["854807a4", "f2bc29cb"], "allowPool": false},
          {"skills": ["Transitions"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "49c962ea", "reserveIds": ["7eaa4a96", "a6ee8d2f"], "allowPool": false},
          {"skills": ["Words in Context"], "diffs": ["Hard"], "intent": "review", "preferredId": "5181c59f", "reserveIds": ["49a892fb", "b16d5265"], "allowPool": false},
          {"skills": ["Rhetorical Synthesis"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "b81aa0f6", "reserveIds": ["7bf4fe1b", "491d1285"], "allowPool": false},
        ],
        tip:"Opens Thursday. Seven questions, no clock, about fifteen minutes. No punctuation today. Two are practice-test questions we went over in class: do them fresh, without looking back.\nBefore you choose, check that your choice answers what the question asked, not just that it is true.\nWords: your own word for the blank first, then sort the choices: fits, doesn't fit, not sure.\nMain idea: topic + point in one line. Then test each choice: is it in the text, and is it the whole point?\nInferences: what must be true from the text, not what could be true.\nTransitions: name what the second sentence does to the first before you look at the words.\nNotes questions: write the goal in the question first, then find the choice that does exactly that.\nKeep going to the results screen, or it doesn't save." },

      { n:3, focus:"Friday — punctuation, purpose, evidence and verbs, no clock", minutes:0, review:0,
        responses:{"53295319":{key:"boundaries", phase:"with-options"}, "174c3487":{key:"boundaries", phase:"with-options"}, "7e67e829":{key:"boundaries", phase:"with-options"}, "fa821b89":{key:"boundaries", phase:"with-options"}, "b1ee8d09":{key:"boundaries", phase:"with-options"}, "16fa54b2":{key:"boundaries", phase:"with-options"}, "473808bd":{key:"boundaries", phase:"with-options"}, "f10d84ef":{key:"boundaries", phase:"with-options"}, "be6f3070":{key:"boundaries", phase:"with-options"}},
        slots:[
          {"skills": ["Text Structure and Purpose"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "b0275cf7", "reserveIds": ["66bee7b8", "b46f4b75"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "53295319", "reserveIds": ["174c3487", "7e67e829"], "allowPool": false},
          {"skills": ["Command of Evidence — Textual"], "diffs": ["Hard"], "intent": "fresh", "preferredId": "759cd784", "reserveIds": ["c4972b33", "f339fd26"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "review", "preferredId": "473808bd", "reserveIds": ["f10d84ef", "be6f3070"], "allowPool": false},
          {"skills": ["Command of Evidence — Quantitative"], "diffs": ["Medium"], "intent": "fresh", "preferredId": "fbe4ec84", "reserveIds": ["b9ed9215", "da325f7b"], "allowPool": false},
          {"skills": ["Boundaries"], "diffs": ["Hard"], "ruleType": "Semi", "intent": "fresh", "preferredId": "fa821b89", "reserveIds": ["b1ee8d09", "16fa54b2"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "SVA", "intent": "fresh", "preferredId": "11add1e8", "reserveIds": ["ca1a7097", "9436c09a"], "allowPool": false},
          {"skills": ["Form, Structure, and Sense"], "diffs": ["Hard"], "ruleType": "VForm", "intent": "review", "preferredId": "efc485e8", "reserveIds": ["9b158590"], "allowPool": false},
        ],
        tip:"Opens Friday. Eight questions, no clock, about fifteen to twenty minutes. Saturday is the full practice test, so finish this on Friday.\nPunctuation: words like however, though and even so belong to one side. Decide which side first, then check whether both sides are full sentences. In a list where the items already have commas inside them, semicolons go between the items. Write what is on each side and which marks that allows, then choose.\nPurpose: what the exact part DOES, with a verb.\nEvidence: write the claim, then what the evidence has to show. For a graph, write the comparison and the units.\nVerbs: cross out the extra description, find the subject, one or more than one?\nKeep going to the results screen, or it doesn't save." },
    ]
  };
}
