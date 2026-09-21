// ─────────────────────────────────────────────────────────────────
// challenge/sets.js — the challenge roster. A FROZEN ARTIFACT.
//
// This file is the set of record. It is produced offline, reviewed by a human,
// and committed. That commit is the freeze point. Nothing in the running app
// may write to it, and nothing in the running app may generate a set that is
// not here.
//
// ── Rules ────────────────────────────────────────────────────────
//
//  1. `ids` is immutable once committed. Never edit a set's ids to "improve"
//     it — the ids are the denominator of "Mastered 9 of 15", and changing
//     them silently redefines every number the student has ever seen.
//
//  2. A new sitting APPENDS a new set. It never mutates an old one. Sets are
//     append-only.
//
//  3. A later set must EXCLUDE every id already committed to that student's
//     earlier sets. Otherwise mastering one question bumps two tallies and
//     progress reads inflated. The union of a student's sets is a growing,
//     non-overlapping curriculum.
//
//  4. `ids` must resolve against the question banks. A missing id is a loud
//     error, not a silent drop. See ChallengeCore.resolveSet.
//
//  5. Empty `ids` means no challenge is served for that set. That is the
//     correct behaviour while a set awaits generation. The app must never
//     fill it in.
//
//  6. This roster is client-side and readable. A student can open devtools and
//     see another student's set, exactly as they can read gate.js. Accept it;
//     don't put anything here that shouldn't be readable. In particular: no
//     assessment of a student, ever — that lives in the gitignored ledger.
//
// ── Schema ───────────────────────────────────────────────────────
//   setId   — stable, unique per student. Display and dedupe only; no storage.
//   title   — what the student sees.
//   source  — where the set came from.
//   date    — when it was set (YYYY-MM-DD).
//   review  — OPTIONAL. Verbatim missed questions for a one-time debrief.
//             UNSCORED: their ids are not in the bank, so they are not part of
//             the mastery denominator. Omitted below — this set was not built
//             from a marked practice test, so there is nothing to debrief.
//   ids     — the frozen, scored set.
//
// The Challenge module introduces ZERO new storage. Mastery, counts and
// completion are all derived from `psat89_progress_<student>`, which gate.js
// already scopes per student.
//
// ═════════════════════════════════════════════════════════════════
// HOW THIS SET WAS BUILT — and why it is not a homework day
// ═════════════════════════════════════════════════════════════════
//
// `homework/assignments.js` can select on skill and difficulty and nothing
// else. That is enough to ask "how is she on Boundaries at Hard" and useless
// for asking "can she place a colon" — a seven-question Boundaries draw can
// come back as seven comma items and never test a colon, a dash or a
// semicolon. The bank now carries `ruleType` (see ruletype.test.js) precisely
// so a set can be built along the concept axis instead, and this is the first
// one that is.
//
// COMPOSITION — 15 questions, sat in class after the Form/Structure/Sense
// teaching, which is why Hard is in scope at all.
//
//   Boundaries 5 · Easy 1 : Medium 2 : Hard 2 — ONE PER MARK.
//     no-mark · semicolon · comma · dash · colon. Boundaries is deliberately
//     thin here because the 10 Aug homework set already reads it at Medium and
//     Hard; what that draw cannot do is guarantee which marks appear. These
//     five fill exactly that gap.
//
//   Form, Structure & Sense 10 · Easy 3 : Medium 4 : Hard 3 — ALL SIX CONCEPTS.
//     SVA ×3 (the core of the class it follows), verb tense ×2, verb form,
//     pronoun, possessive ×2, modifier placement.
//
// TWO CONSTRAINTS THE BANK IMPOSED, both worth knowing before anyone "fixes"
// the ratios:
//
//   • Modifier placement is HARD-ONLY — 10 items, none at Easy or Medium. Any
//     set without a Hard slot cannot test it at all. That is the whole reason
//     this set has one.
//   • Colon has nothing at Medium, and its single Easy item (`62e13c74`) has
//     the colon already printed in the passage: it tests what must FOLLOW a
//     colon — question word order and a question mark — not when to use one.
//     A defensible tag, the wrong question for a coverage set. So colon sits
//     at Hard and the Easy slot went to no-mark instead. The 1:2:2 spread is
//     unchanged; only which concept sits where.
//
// SELECTION was deterministic and LEDGER-BLIND: candidates ordered by id,
// never shuffled, and her progress was not consulted. Same bank, same set,
// every time. Where a cell offered a choice, a question whose `ruleType` had
// been verified was preferred over one still on the review list.
//
// SCORED, not a debrief. Deliberate, and the reasoning matters if anyone
// revisits it: a single sitting CANNOT master anything here — mastery needs
// two clean corrects and launchSession() takes a fixed array, so no question
// can recur within one session. Pass one can only move a question to
// correct-once. That makes it safe to score a set sat WITH the tutor in the
// room: the coached pass cannot inflate mastery on its own, and the honest,
// uncoached reading is the second pass later. It also means "Mastered N of 15"
// stays meaningful as a re-test in September, which an unscored debrief would
// not give.
//
// ONE TAG IS UNVERIFIED: `1fda4fb5` (Mod, Hard). Every Mod item in the bank is
// on the review list, so no verified alternative existed. Mod was also the
// category the classifier got wrong most often before its possessive guard was
// added. Read that one before trusting a Mod-specific conclusion drawn from it.
// ─────────────────────────────────────────────────────────────────

window.CHALLENGE_SETS = {

    // ── Faith · RETIRED 8 Sep 2026 ─────────────────────────────────
    // con-concepts-1 is spent: 14 of its 15 ids were worked on 14 Aug 2026, so a
    // sitting now would score recall, not mastery, and the tally would read as
    // progress it did not measure. The card is withdrawn from the hub rather than
    // left standing as an invitation to sit a set that can no longer measure
    // anything. Whole-section evidence comes from the Blue Book instead.
    //
    // THIS IS A DELIBERATE EXCEPTION TO RULE 2 (append-only), made by the tutor.
    // Nothing else in the file is touched, and no set was edited: the array is
    // emptied, which rule 5 already defines as "no challenge is served".
    //
    // NO STUDENT DATA IS AFFECTED. The module introduces zero storage of its own —
    // every tally derives from psat89_progress_Faith, which is untouched. Her work
    // on these 15 questions stays on the review ladder exactly as it was.
    //
    // RULE 3 STILL BINDS, so the spent ids are preserved here: any future Faith set
    // must exclude all fifteen.
    //   91d28dac f0124561 312bfabb 139f1b75 65439b1e   (Boundaries · one per mark)
    //   78cef1d4 69556476 8de2ee41 6b2a1288 9ab0c766   (FSS)
    //   cf881255 02c22816 1fda4fb5 11add1e8 03ca25bb   (FSS)
    // Only f0124561 (Semi · Medium) was never worked.
    'Faith': [],

    // ═════════════════════════════════════════════════════════════════
    // HOW THIS SET WAS BUILT — Form, Structure and Sense, all six concepts
    // ═════════════════════════════════════════════════════════════════
    //
    // Sat in class on the night of 13/14 Aug, after the Form/Structure/Sense teaching. FSS ONLY:
    // Boundaries is not in scope for this class and is not in this set. When it is
    // taught, it APPENDS a new set — it does not get edited into this one (rule 2).
    //
    // COMPOSITION — 15 questions, Medium 4 : Hard 11, no Easy. All six concepts.
    //
    //   VForm 3 — three of the four non-Easy VForm items in the bank, because the
    //     finite/non-finite decision runs in BOTH directions and no single item
    //     tests both. a30567fd and cc0dcd9a need a non-finite form precisely
    //     because the clause already carries its main verb; 491a17a7 needs the
    //     conjugated one because the blank IS the main verb. A set holding only
    //     the first kind teaches "pick the -ing", which is not the rule.
    //
    //   Mod 2 — Hard-only in this bank (10 items, none at Easy or Medium), so a
    //     set without Hard slots cannot test modifier placement at all. All ten
    //     are the same construction — leading modifier, choose the subject that
    //     belongs next to it — so these two differ by DISTRACTOR strategy, not by
    //     concept: 49fbe443 buries the true subject inside a possessive abstract
    //     noun, 8e23d0c7 hides it behind an expletive "there are" and a passive.
    //
    //   SVA 3 — the core of the class it follows, and the concept where the trap
    //     has a direction: 377a2b12 singular subject across an interrupting
    //     relative clause, f10b7ce4 PLURAL subject across an interrupter ringed by
    //     singular nouns, 81000f32 (Medium) singular subject across a
    //     prepositional phrase. A set of three singular-subject items would only
    //     ever reward the guess "make it singular".
    //
    //   VTense 2 — the two directions of past against past perfect: b995581c needs
    //     "had served" for the earlier of two past events; 0b3c05ab needs the plain
    //     simple past inside a sentence whose other clause is ALREADY past perfect.
    //
    //   Pron 2 — bb804798 pronoun-antecedent agreement where the nearest noun is
    //     the wrong number and person is a live distractor; 2b9ce465 possessive
    //     determiner against contraction (its/it's, their/they're).
    //
    //   Poss 3 — every item here carries two decisions in one blank, which is what
    //     separates the concept from a spelling check: 03ca25bb plain plural +
    //     singular possessive, a272d236 plain plural + plural possessive,
    //     f09186ab (Medium) singular possessive + plain plural.
    //
    // NO EASY, DELIBERATELY. Each concept sits at the difficulty where it
    // discriminates. The Easy FSS items in this bank are single-decision blanks
    // that restate the rule rather than test it, and Mod cannot be reached below
    // Hard at all. The Medium four are the floor, not filler.
    //
    // SELECTION was deterministic and LEDGER-BLIND, as for con-concepts-1:
    // candidates ordered by id within each ruleType/difficulty cell, never
    // shuffled, and no progress ledger was consulted.
    //
    // FIVE TAGS WERE ON THE REVIEW LIST AND WERE READ BEFORE USE — 491a17a7
    // (VForm), 0b3c05ab (VTense), 2b9ce465 (Pron), 49fbe443 and 8e23d0c7 (Mod).
    // Each item's own explanation names the convention its tag claims, so all five
    // are confirmed. That also settles the warning carried in con-concepts-1: every
    // Mod explanation in this bank states subject-modifier placement outright.
    //
    // TWO TAGS LOOK WRONG AND ARE EXCLUDED — worth fixing in data-conventions.js
    // whenever the review pass happens, but not fixed here, because this file must
    // not be the place a bank correction hides:
    //   • 0cdbfd0f — tagged VForm, but its explanation turns on matching the past
    //     tense of "applied". That is VTense. It would have been the fourth VForm
    //     slot; it is not in this set.
    //   • 130d56e7 — tagged VTense, but its explanation is subject-modifier
    //     placement verbatim. That is Mod.
    //
    // SCORED, not a debrief, for the reason given above con-concepts-1: mastery
    // needs two clean corrects on separate goes and launchSession() cannot repeat a
    // question inside one session, so a first pass sat with the tutor in the room
    // cannot inflate anything. The uncoached reading is the second pass.
    //
    // Note 03ca25bb also appears in Faith's con-concepts-1. Rule 3 is per student —
    // a set must not overlap that student's OWN earlier sets — and this is Maysa's
    // first set, so there is nothing to exclude.
    // ── RETIRED 9 Sep 2026 ─────────────────────────────────────────
    // fss-concepts-1 has already been worked across submitted sittings and
    // correction passes. It no longer serves as a fresh challenge, so its card
    // is withdrawn from the hub.
    //
    // The progress ledger and submitted history remain untouched. Rule 3 still
    // binds, so any future set for this student must exclude all fifteen ids:
    //   a30567fd cc0dcd9a 491a17a7 49fbe443 8e23d0c7
    //   377a2b12 f10b7ce4 81000f32 b995581c 0b3c05ab
    //   bb804798 2b9ce465 03ca25bb a272d236 f09186ab
    // ═════════════════════════════════════════════════════════════════
    // con-rules-1 — built on the rule axis, with its own teaching layer
    // ═════════════════════════════════════════════════════════════════
    //
    // A homework day selects on skill and difficulty and nothing else, so a
    // Boundaries draw can come back as four comma items and never test a dash or
    // a colon. Three ruleTypes had therefore never appeared in a set for this
    // student: Dash, Colon and Mod. This set exists to reach exactly those.
    //
    // TWO LAYERS, AND THE ORDER IS THE DESIGN:
    //
    //   `review` — 7 items, UNSCORED, never recorded. Three teach a rule from a
    //     paired-sentence drill, where only one mapping is possible and the rule
    //     is the only variable. Four are real passages. Each carries a `strategy`
    //     line, which the debrief renders above the explanation: that line is the
    //     rule in the words to reuse. Authored items are legitimate here and only
    //     here — renderDebrief takes self-contained objects and never touches the
    //     bank, so nothing can reach the mastery denominator.
    //
    //   `ids` — 12 real bank items, SCORED, served wrong-first until two clean
    //     corrects on separate goes. Rule 4 makes this half bank-only: a written
    //     question cannot be scored, cannot enter the denominator, and cannot come
    //     back through the ladder. Mastery is the point of this half.
    //
    // Teaching ships INSIDE the set on purpose. con-taught-1 records the reason:
    // a question whose rule was never taught cannot be mastered by practice, only
    // by guessing until the tally moves. Here the debrief discharges that first.
    //
    // COMPOSITION — 4 Dash : 4 Colon : 4 Mod, ten of twelve at MEDIUM.
    // Hard makes a set unmasterable in the week it is set, and the exam window
    // opens 1 Oct. Medium was not available for these rules until the 9 Sep merge:
    // the ruleType commit says "Mod and Dash exist ONLY at Hard" and "Colon has
    // nothing at Medium", and that is now out of date. Mod is all Medium — the
    // eight unseen Mod items at Hard are the next set. Two Hard slots go to the
    // transfer checks: 051f87ec repeats the printed-mark shape, and 8df2ca61
    // carries a colon and a conjunctive adverb in one item.
    //
    // RULE 3 — all fifteen retired fss-concepts-1 ids are excluded; none appears
    // here. Cross-student overlap is not rule 3 and two of these have been worked
    // by other students. TWO ITEMS ARE HELD OUT for the class that precedes this
    // set: 1fda4fb5 and 2ff2efad. A question worked aloud opens the set by asking
    // her to remember rather than to decide; they return via the review ladder.
    //
    // 1fda4fb5 was flagged in con-concepts-1 as the one unverified Mod tag. It has
    // now been read by hand — "Far from being modern inventions, ______ more than
    // 5,000 years ago" — and the tag is correct.
    //
    // SELECTION was ledger-blind in the sense that matters: candidates were the
    // unseen set for each rule, ordered by id, never shuffled.
    'Maysa': [
        {
            setId:  'con-rules-1',
            title:  'Conventions by rule: the dash, the colon, and what the opening describes',
            source: 'Built from the bank along the rule axis, with a teaching debrief',
            date:   '2026-09-18',
            review: [
              {
                source: 'Rule drill — paired sentences', skill: 'Boundaries', ruleType: 'Dash',
                passage: '(1) The festival—a month-long celebration of music and film ______ drew visitors from four continents.  (2) The festival, a month-long celebration of music and film ______ drew visitors from four continents.',
                question: 'Which mark closes the description in each sentence?',
                options: ['A. a dash in (1), a comma in (2)', 'B. a comma in both', 'C. a dash in both', 'D. no mark in either'],
                answer: 'A',
                strategy: 'Before you choose a mark, read the sentence for the marks it already has. A description opened with a dash must be closed with a dash; one opened with a comma must be closed with a comma. The pair has to match.',
                explanation: 'Choice A is correct. Both sentences interrupt "The festival drew visitors" with the same extra description. Sentence (1) has already opened that interruption with a dash, so it closes with a dash. Sentence (2) opened it with a comma, so it closes with a comma. Nothing about the description changed — only the mark the sentence had already committed to. B and C each force a mismatched pair. D removes the closing mark entirely, so the reader cannot tell where the interruption ends and the main sentence resumes.'
              },
              {
                source: 'Dash — the mark already in the sentence', skill: 'Boundaries', ruleType: 'Dash',
                passage: 'Luci Tapahonso is the inaugural poet laureate of the Navajo Nation. Her book Sáanii Dahataal/The Women Are Singing—a combination of fiction and memoir, poetry and ______ serves as a testament to her versatility as a writer.',
                question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
                options: ['A. prose;', 'B. prose', 'C. prose,', 'D. prose —'],
                answer: 'D',
                strategy: 'Find the mark that is already printed BEFORE you look at the options. Here there is a dash after "Singing". That dash has opened something, and the blank is where it has to close.',
                explanation: 'Choice D is correct. "A combination of fiction and memoir, poetry and prose" is extra description sitting between the book title and the verb "serves". It has already been opened with a dash, so it closes with a matching dash. Choice B is the tempting one, and it is tempting for a specific reason: read only the words around the blank and no mark seems needed. But the sentence had already committed itself several words earlier. A semicolon (A) needs a complete sentence on both sides and there is not one. A comma (C) cannot close what a dash opened. The whole question was decided before the blank, which is why the answer is invisible if you start at the options.'
              },
              {
                source: 'Dash — the mark already in the sentence', skill: 'Boundaries', ruleType: 'Dash',
                passage: "With some 16,000 in attendance, the Second World Black and African Festival of Arts and ______ or FESTAC '77, as the event was more commonly known—became the largest pan-African event on record. FESTAC drew people from around the world to Lagos, Nigeria, for a monthlong celebration of Black and African art, scholarship, and activism.",
                question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
                options: ['A. Culture:', 'B. Culture—', 'C. Culture,', 'D. Culture'],
                answer: 'B',
                strategy: 'The same rule running backwards. The printed mark comes AFTER the blank this time, so read to the end of the interruption before you decide.',
                explanation: 'Choice B is correct. The interruption is "or FESTAC \'77, as the event was more commonly known", and it is already closed with a dash before "became". So the blank has to open it with the matching dash. This is the harder direction of the same rule, because the mark that decides it sits further along the sentence than the blank does, and a quick read never reaches it. D leaves a closing mark with nothing to open it. C mismatches the pair. A is wrong because a colon introduces rather than pairs, so it cannot be half of a matched set around an interruption.'
              },
              {
                source: 'Rule drill — paired sentences', skill: 'Boundaries', ruleType: 'Colon',
                passage: '(1) The long voyages created one problem the crews could not solve ______ mold in the flour.  (2) The long voyages created problems such as ______ mold in the flour.',
                question: 'Which mark does each blank take?',
                options: ['A. a colon in (1), no mark in (2)', 'B. no mark in (1), a colon in (2)', 'C. a colon in both', 'D. a comma in both'],
                answer: 'A',
                strategy: 'A colon needs a complete sentence in front of it. What comes after does not have to be complete. So test the LEFT side first, every time.',
                explanation: 'Choice A is correct. In (1), "The long voyages created one problem the crews could not solve" is already a complete sentence, and "mold in the flour" is the thing it promised. That is what a colon is for. Note that a semicolon could not go here: a semicolon needs a complete sentence on BOTH sides, and "mold in the flour" is not one. In (2) the left side ends on "such as" and is not complete, so no mark belongs at all — "such as" is already doing the introducing. The two sentences say almost the same thing, and the only thing that decided the mark was whether the left side could stand alone.'
              },
              {
                source: 'Rule drill — paired sentences', skill: 'Boundaries', ruleType: 'Colon',
                passage: '(1) The curators settled on a single theme ______ migration and the objects people carry.  (2) The curators settled on a single theme ______ the objects in the final room were chosen to match it.',
                question: 'Which mark does each blank take?',
                options: ['A. a colon in (1), a semicolon in (2)', 'B. a colon in both', 'C. a semicolon in both', 'D. a comma in (1), a colon in (2)'],
                answer: 'A',
                strategy: 'Colon or semicolon is decided on the RIGHT side. A fragment that explains takes a colon. A whole second sentence takes a semicolon.',
                explanation: 'Choice A is correct. Both sentences have the same complete left side, so the left side cannot be what decides it. In (1) the right side is "migration and the objects people carry" — a noun phrase naming the theme, not a sentence — so it takes a colon. In (2) the right side is "the objects in the final room were chosen to match it", which has its own subject and verb and could stand alone, so it takes a semicolon. B and C each apply one mark to both and ignore the only thing that changed. D puts a comma between two complete clauses in (2), which is a splice.'
              },
              {
                source: 'Rule drill — sentence opener', skill: 'Form, Structure, and Sense', ruleType: 'Mod',
                passage: 'Consisting of pigment applied to plaster while the plaster is still wet, ______',
                question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
                options: ['A. water carries the pigment into the wall as the plaster sets.', 'B. frescoes bond with the wall itself as the plaster sets.', 'C. the wall is bonded with by frescoes as the plaster sets.', 'D. bonding with the wall happens as the plaster sets.'],
                answer: 'B',
                strategy: 'When a sentence opens with a description and then a blank, ask one question: who or what is that description about? The blank has to start with that thing.',
                explanation: 'Choice B is correct. The opening describes something that consists of pigment applied to wet plaster. That is a fresco, so the main sentence has to start with frescoes. Choice A starts with water, and water does not consist of pigment applied to plaster. C starts with the wall and D starts with bonding — neither is the thing being described. Each of A, C and D is a perfectly grammatical sentence on its own, and that is the trap: what makes them wrong is only what the opening phrase attached itself to. Reading the options first cannot show you that. Reading the opener can.'
              },
              {
                source: 'Rule drill — where the description sits', skill: 'Form, Structure, and Sense', ruleType: 'Mod',
                passage: 'Orchid seeds are so light that air currents can carry them ______',
                question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
                options: ['A. weighing less than a speck of dust for hundreds of kilometres.', 'B. for hundreds of kilometres weighing less than a speck of dust.', 'C. for hundreds of kilometres, each seed weighing less than a speck of dust.', 'D. that weigh less than a speck of dust for hundreds of kilometres.'],
                answer: 'C',
                strategy: 'A description sits next to the thing it describes. If it has drifted next to something else, the sentence says something it did not mean.',
                explanation: 'Choice C is correct. The seeds weigh less than a speck of dust, so that description has to sit beside the seeds. C does it cleanly, starting a fresh phrase — "each seed weighing less than a speck of dust" — after the distance. In A and B the description lands next to "kilometres", so the sentence claims the distance weighs less than a speck of dust. D puts it next to "them", which is closer to right, but then strands "for hundreds of kilometres" inside the weighing phrase and says the seeds weigh that much for hundreds of kilometres. Same rule as the fresco question, moved from the front of the sentence to the middle.'
              },
            ],
            ids: [
                '209d41b1', '8f118e5c', '844f8051', '051f87ec',
                '4a307bb9', '779f904a', 'ac57e2a8', '8df2ca61',
                'cc37a7ee', '690688d8', 'e7bf56e7', 'fbf562d7',
            ],
        },
    ],
    // ═════════════════════════════════════════════════════════════════
    // con-taught-1 — built to match a lesson, not to survey a domain
    // ═════════════════════════════════════════════════════════════════
    //
    // The two sets above ask "does the whole concept axis hold?" and are built
    // for coverage. This one is built for the opposite reason: it carries the
    // 31 Aug class and nothing else. Every question in it is a question the two
    // rules taught that hour will answer, and every rule NOT taught that hour is
    // absent, however cheap it would have been to include.
    //
    // That is why there is no colon, no dash, no pronoun and no modifier item
    // here. A challenge set is served until every question is mastered; a
    // question whose rule was never taught cannot be mastered by practice, only
    // by guessing until the tally moves. Coverage is next month's set.
    //
    // WHAT THE HOUR TAUGHT, and the whole set maps onto it:
    //
    //   Form, Structure and Sense —
    //     "Find the subject. Cross out everything between it and the verb."
    //     SVA ×2, verb tense ×2, verb form ×1, possessive ×1.
    //
    //   Boundaries —
    //     "Cover the mark. Is each side a whole sentence?"
    //     Three items where the answer is YES and the mark differs (period,
    //     comma + but, and the dependent-clause comma where the answer is NO),
    //     and three where the right move is a mark the ear does not expect —
    //     including two where the right move is NO MARK AT ALL.
    //
    // EASY AND MEDIUM ONLY, DELIBERATELY. Both skills are one hour old. The
    // Hard tiers are the deepest in the bank (34 and 35 items) and are the
    // September step; putting them here would spend them before the mock and
    // make the set unmasterable in the week it is set. The two Easy items are
    // load-bearing rather than filler: they are the cleanest statement of each
    // rule, and the set is served wrong-first, so they are what a miss falls
    // back onto.
    //
    // SIX ITEMS ARE HELD OUT, on purpose. The six worked aloud in class, with
    // the answers given, are NOT in this set: 6b2a1288, edbbeca3, f09186ab
    // (FSS) and f0124561, 566fac8d, 312bfabb (Boundaries). Mastery needs two
    // clean corrects on separate goes, so a coached item could not inflate the
    // tally on its own — but it would still be the first thing he met, and the
    // set would open by asking him to remember rather than to decide. They come
    // back through the review ladder instead.
    //
    // OVERLAP WITH OTHER STUDENTS IS FINE and is not rule 3. Rule 3 forbids a
    // set overlapping that SAME student's earlier sets; this is his first, so
    // there is nothing to exclude. 78cef1d4, 91d28dac and 312bfabb also sit in
    // Faith's con-concepts-1, exactly as 03ca25bb sits in two sets already.
    //
    // The hub appends the newest set for any student who has one, so this needs
    // no `challenge:` key in assignments.js and does not disturb his day cards.
    // ── RETIRED 21 Sep 2026 · con-taught-1 is spent ──────────────────────
    // Every one of the twelve was attempted and the set is done: 25 attempts,
    // 12 distinct questions, 24/25 correct including repeats, and 11/12 on FIRST
    // response. The single first-response miss was 81000f32 — subject-verb
    // agreement across a long appositive — which he took on a later go.
    //
    // Emptying the array is the retirement, exactly as Faith's was: rule 5 already
    // defines an empty array as "no challenge is served", and the hub then simply
    // stops appending a challenge card to his day view.
    //
    // NO STUDENT DATA IS AFFECTED. The module stores nothing of its own — every
    // tally derives from psat89_progress_Luke, which is untouched. His work on
    // these twelve stays on the review ladder exactly as it was, and they come
    // back as delayed retrievals through dueForReview() like anything else.
    //
    // RULE 3 STILL BINDS, so the spent ids are preserved here: any future Luke set
    // must exclude all twelve.
    //   7c30c345 e9a761e7 3269925f 5a4e7f5f f60f2482 91d28dac   (Boundaries)
    //   78cef1d4 81000f32 69556476 9ab0c766 491a17a7 02c22816   (FSS)
    // 81000f32 is the only one he ever got wrong first time, and the SVA archetype
    // behind it is still an open repair — see LEDGER §Open, item 6a.
    //
    // The build rationale for the set is preserved above, unedited.
    'Luke': [],


};
