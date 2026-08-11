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

};
