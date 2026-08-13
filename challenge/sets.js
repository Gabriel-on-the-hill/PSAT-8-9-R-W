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

    'Faith': [
        {
            setId:  'con-concepts-1',
            title:  'Conventions: every mark, every form',
            source: 'Built from the bank by concept coverage, 10 Aug 2026',
            date:   '2026-08-11',
            ids: [
                // ── Boundaries · one per mark ──────────────────────────
                '91d28dac',   // NoPunct  · Easy    — the trap: no mark belongs
                'f0124561',   // Semi     · Medium
                '312bfabb',   // Commas   · Medium  — non-essential clause
                '139f1b75',   // Dash     · Hard    — parenthetical pair
                '65439b1e',   // Colon    · Hard    — colon before an explanation

                // ── Form, Structure & Sense · all six concepts ─────────
                '78cef1d4',   // SVA      · Easy    — the odd-one-out check
                '69556476',   // VTense   · Easy
                '8de2ee41',   // VForm    · Easy    — infinitive vs finite
                '6b2a1288',   // SVA      · Medium  — subject across an interrupter
                '9ab0c766',   // VTense   · Medium
                'cf881255',   // Pron     · Medium
                '02c22816',   // Poss     · Medium
                '1fda4fb5',   // Mod      · Hard    — ⚠ ruleType unverified
                '11add1e8',   // SVA      · Hard
                '03ca25bb',   // Poss     · Hard
            ],
        },
    ],

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
    //     tests both. 7944e9f4 and cc0dcd9a need a non-finite form precisely
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
    //     relative clause, 9597885e PLURAL subject across an interrupter ringed by
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
    'Maysa': [
        {
            setId:  'fss-concepts-1',
            title:  'Form, Structure and Sense: every form, every agreement',
            source: 'Built from the bank by concept coverage, 14 Aug 2026',
            date:   '2026-08-14',
            ids: [
                // ── Verb form · finite vs non-finite, both directions ──
                '7944e9f4',   // VForm    · Hard   — -ing modifier, clause already has its verb
                'cc0dcd9a',   // VForm    · Medium — infinitive as modifier
                '491a17a7',   // VForm    · Medium — the blank IS the main verb, so conjugate it

                // ── Modifier placement · Hard-only in the bank ─────────
                '49fbe443',   // Mod      · Hard   — true subject buried in a possessive
                '8e23d0c7',   // Mod      · Hard   — true subject behind "there are" + passive

                // ── Subject-verb agreement · across interrupters ───────
                '377a2b12',   // SVA      · Hard   — singular across a relative clause
                '9597885e',   // SVA      · Hard   — plural subject, singular nouns around it
                '81000f32',   // SVA      · Medium — singular across a prepositional phrase

                // ── Verb tense · past against past perfect ─────────────
                'b995581c',   // VTense   · Hard   — earlier of two past events
                '0b3c05ab',   // VTense   · Hard   — plain past beside an existing past perfect

                // ── Pronouns · agreement and the homophone pair ────────
                'bb804798',   // Pron     · Hard   — nearest noun is the wrong number
                '2b9ce465',   // Pron     · Hard   — its/it's, their/they're

                // ── Possessives · two decisions in one blank ───────────
                '03ca25bb',   // Poss     · Hard   — plain plural + singular possessive
                'a272d236',   // Poss     · Hard   — plain plural + plural possessive
                'f09186ab',   // Poss     · Medium — singular possessive + plain plural
            ],
        },
    ],


};
