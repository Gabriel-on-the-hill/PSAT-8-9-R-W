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
    'Faith': [
        // ══════════════════════════════════════════════════════════════
        // ci-claim-1 — main idea, built on the prediction axis, with a teaching layer
        // ══════════════════════════════════════════════════════════════
        //
        // The first reading set on this roster. Every earlier challenge set here was
        // Conventions, built along ruleType. Central Ideas has no ruleType, so this
        // set is built along QUESTION TYPE instead: main idea of the whole text, and
        // a detail or suggestion drawn from one part of it. Both halves appear in
        // both layers.
        //
        // TWO LAYERS, AND THE ORDER IS THE DESIGN (as con-rules-1):
        //
        //   `review` — 7 items, UNSCORED, never recorded. Three authored paired
        //     drills, one per move: a prediction needs a topic AND a point; every
        //     word of an answer must point to a line; on a one-part question the
        //     trap is the text's own words with the wrong owner. Then four real
        //     passages worked with the tutor, each with a `strategy` line in the
        //     words to reuse.
        //
        //   `ids` — 8 real bank items, SCORED. Medium 4 : Hard 4. The Medium half
        //     is where the routine is practised; the Hard half is where it is needed.
        //     Hard is kept to four so the set stays masterable before the window.
        //     All Hard items put the claim somewhere other than a plain first line:
        //     after "But" (60c36cf5, 88ee5572), in the second sentence (877b3824),
        //     or in a poem (fb473f4d).
        //
        // SAT IN CLASS, BEFORE THE HOMEWORK DAY OF THE SAME DATE. This set writes
        // to the mastery ledger, so its ids are no longer unseen when homework
        // day 1 draws Central Ideas at Hard. That order keeps the homework draw a
        // true first attempt. Sitting them the other way round could serve the same
        // question twice in one class.
        //
        // RULE 3 — the fifteen retired con-concepts-1 ids above are all Conventions;
        // none can appear here. Selection: the unseen College Board items in each
        // tier, main idea and detail both represented, read by hand, ordered by
        // tier. Never shuffled.
        {
            setId:  'ci-claim-1',
            title:  'Main idea: say the point, then point to the line',
            source: 'Built along question type, with a teaching layer of paired drills',
            date:   '2026-09-26',
            reviewLabel: 'Start here',
            reviewIntro: 'Seven short items that teach the routine this set is built on. Work them first, with your tutor. Nothing here counts toward mastery.',
            reviewCta:   'Work the 7 teaching items',
            review: [
              {
                source: "Paired drill — a topic is not a prediction",
                skill: "Central Ideas and Details",
                passage: "Farmers in parts of Kenya have started hanging beehives along the fences around their fields. Elephants avoid the buzzing hives, so the fences keep elephants out of the crops, and the bees also produce honey that the farmers can sell.",
                question: "Which prediction of the main idea could you actually test the options against?",
                options: ["A. It is about beehives and elephants in Kenya.", "B. Beehive fences keep elephants away from crops and also give farmers honey to sell.", "C. It is about how farmers in Kenya earn money.", "D. Elephants are afraid of bees."],
                answer: "B",
                strategy: "A prediction has two halves: the topic (who or what) and the point (what the text says about it). A topic on its own fits every option, so it cannot rule any of them out. Say both halves before you look.",
                explanation: "Choice B is correct because it names the topic and the point: the hives protect crops and earn money. A and C are only topics. Every option in a real question would be \"about beehives and elephants\", so a prediction like that cannot eliminate anything. D is one true detail from the text, and a detail is too small to be the main idea. When your prediction could not rule out a single option, it is a topic, and you are not ready to look yet."
              },
              {
                source: "Paired drill — point to the line",
                skill: "Central Ideas and Details",
                passage: "A study of 40 city parks found that parks with many trees recorded lower ground temperatures on summer afternoons than parks covered mostly in grass. The researchers suggest that planting more trees could help cities manage summer heat.",
                question: "Which choice is fully supported by the text?",
                options: ["A. Planting trees is the most effective way for cities to reduce summer heat.", "B. Grass makes city parks hotter every year.", "C. Most cities have already started planting more trees in their parks.", "D. Parks with many trees tended to be cooler in summer than grassy parks, which suggests trees could help cities manage heat."],
                answer: "D",
                strategy: "Every word of the answer has to point to a line in the text. Put your finger on the text for each part of the option. If a word has no line — most, first, every, always, already, widely — the option is out, however sensible it sounds.",
                explanation: "Choice D is correct: every part of it points to a line (\"lower ground temperatures\", \"could help cities manage summer heat\"). A says \"the most effective way\", but the text compares trees with grass and nothing else. B says \"every year\" and blames the grass, and the text says neither. C says \"most cities have already\", and the text never mentions what cities have done. Each wrong option sounds reasonable, and that is the trap: sounding right is not the test. Pointing is."
              },
              {
                source: "Paired drill — right words, wrong owner",
                skill: "Central Ideas and Details",
                passage: "Historian Ana Ruiz argues that the old canal was built mainly to move goods to market. Historian Tom Bell agrees that the canal later carried goods, but he argues that it was first dug to drain flooded farmland.",
                question: "According to the text, what does Bell claim that Ruiz does not?",
                options: ["A. The canal was built mainly to move goods to market.", "B. The canal never carried any goods.", "C. The canal was first dug to drain flooded farmland.", "D. Ruiz has no evidence that the canal carried goods."],
                answer: "C",
                strategy: "On a question about one person or one part of the text, find the sentence about that person and answer from it alone. The trap is an option built from the text's own words that belong to someone else.",
                explanation: "Choice C is correct: it comes from Bell's sentence and nowhere else. A is Ruiz's claim, taken word for word from her sentence, which is exactly why it is tempting. B contradicts Bell, who agrees the canal carried goods. D is not in the text at all. Every word of A appears in the passage. It is still wrong, because the words belong to the wrong person."
              },
              {
                source: "Real question — worked with your tutor",
                skill: "Central Ideas and Details",
                passage: "In many of his sculptures, artist Richard Hunt uses broad forms rather than extreme accuracy to hint at specific people or ideas. In his first major work, Arachne (1956), Hunt constructed the mythical character Arachne, a weaver who was changed into a spider, by welding bits of steel together into something that, although vaguely human, is strange and machine-like. And his large bronze sculpture The Light of Truth (2021) commemorates activist and journalist Ida B. Wells using mainly flowing, curved pieces of metal that create stylized flame.",
                question: "Which choice best states the text’s main idea about Hunt?",
                options: ["A. He often depicts the subjects of his sculptures using an unrealistic style.", "B. He uses different kinds of materials depending on what kind of sculpture he plans to create.", "C. He tends to base his art on important historical figures rather than on fictional characters.", "D. He has altered his approach to sculpture over time, and his works have become increasingly abstract."],
                answer: "A",
                strategy: "Main idea, whole text. The claim is the first sentence, and the two sculptures after it are examples of it. Say topic plus point before you look: Hunt shows his subjects with loose, unrealistic shapes rather than exact detail. Then point to the line for each option. Nothing in the text says his approach changed over time.",
                explanation: "Choice A is the best answer because it most accurately states the main idea of the text. According to the text, many of Richard Hunt’s sculptures’ “use broad forms rather than extreme accuracy”— in other words, they are more abstract than realistic. To illustrate Hunt’s abstract approach, the text characterizes his sculpture of Arachne as “vaguely human” and his work in honor of Ida B. Wells as “using mainly flowing, curved pieces of metal that create stylized flame.” Thus, the main idea is that Hunt often depicts the subjects of his sculptures using an unrealistic style.\n\nChoice B is incorrect. Although the text indicates that one of Hunt’s sculptures is made of steel and another of bronze, there is no mention of why he chose these materials. Choice C is incorrect because the text says nothing about how Hunt chose the subjects for his sculptures. Furthermore, of the two examples provided in the text, only Ida B. Wells is an important historical figure; Arachne is a “mythical character.” Choice D is incorrect because the text says nothing about how Hunt’s style changed over time. In fact, although the two examples of Hunt’s work discussed in the text were created 65 years apart, they are both described as heavily stylized rather than realistic, which may suggest that some aspects of Hunt’s style haven’t changed over that time."
              },
              {
                source: "Real question — worked with your tutor",
                skill: "Central Ideas and Details",
                passage: "To dye wool, Navajo (Diné) weaver Lillie Taylor uses plants and vegetables from Arizona, where she lives. For example, she achieved the deep reds and browns featured in her 2003 rug In the Path of the Four Seasons by using Arizona dock roots, drying and grinding them before mixing the powder with water to create a dye bath. To intensify the appearance of certain colors, Taylor also sometimes mixes in clay obtained from nearby soil.",
                question: "Which choice best states the main idea of the text?",
                options: ["A. Reds and browns are not commonly featured in most of Taylor’s rugs.", "B. Taylor draws on local resources in the approach she uses to dye wool.", "C. Taylor finds it difficult to locate Arizona dock root in the desert.", "D. In the Path of the Four Seasons is widely acclaimed for its many colors and innovative weaving techniques."],
                answer: "B",
                strategy: "\"For example\" tells you that everything after it supports what came before. So the claim is sentence one: Taylor dyes her wool with local plants. An option that praises the rug has no line to point to.",
                explanation: "Choice B is the best answer. It best states the main idea of the text. The text opens with the statement that Taylor uses local plants and vegetables to dye wool. The rest of the text describes how she does this.\n\nChoice A is incorrect. This doesn’t state the main idea of the text. The text only mentions one rug: In the Path of the Four Seasons, in which reds and browns are featured. It never mentions whether or not these colors are featured in her other rugs. Choice C is incorrect. This doesn’t state the main idea of the text. The text never says that Taylor finds it difficult to locate Arizona dock roots. Choice D is incorrect. This doesn’t state the main idea of the text. The text never says that In the Path of the Four Seasons is widely acclaimed. Rather, it discusses the rug to illustrate the point made earlier in the passage: that Taylor uses local plants and vegetables to dye wool."
              },
              {
                source: "Real question — worked with your tutor",
                skill: "Central Ideas and Details",
                passage: "Historians point to the rule of the Piast dynasty as crucial to the formation of the Polish state. However, some differentiate between members of the dynasty like Mieszko II Lambert, who ruled as king from 1025 to 1031 CE, and less well-documented figures like Siemomysł, who is said to have ruled in the 10th century but whose historical actuality is disputed. Siemomysł appears in the Gesta principum Polonorum, a chronicle of medieval Polish history written between 1112 and 1118. However, the chronicle’s documentation of Siemomysł relies on oral tradition, unlike its records of later rulers.",
                question: "According to the text, what is a difference between how historians view Siemomysł and how they view Mieszko II Lambert?",
                options: ["A. Historians agree that Mieszko II Lambert existed, but disagree about whether Siemomysł existed.", "B. Historians believe that the Gesta principum Polonorum provides more evidence for Siemomysł s existence than it does for Mieszko II Lambert’s existence.", "C. Historians agree that Siemomysł ruled Poland much later than Mieszko II Lambert.", "D. Historians find the orally transmitted stories affirming the existence of Mieszko II Lambert to be more convincing than similar stories about Siemomysł."],
                answer: "A",
                strategy: "This asks about one difference, not the whole text. Find the sentence about each ruler and compare only those. Watch for the text's own words, such as oral tradition, attached to the wrong ruler.",
                explanation: "Choice A is the best answer because it presents a statement about how historians view Siemomysł and Mieszko II Lambert that is supported by the text. The text states that the Piast dynasty had a number of different members. The text refers to two of the rulers in the Piast dynasty by name: Mieszko II Lambert, whose rule was known to have occurred from 1025 to 1031 CE, and Siemomysł (\"whose historical actuality is disputed\"), for whom less is known and who therefore is the subject of debate among historians. The text further casts doubt about Siemomysł by stating that he is \"said to have ruled\" during the 10th century, or the 900s, which suggests the possibility that he didn’t rule. The text also mentions that the chronicle’s documentation of Siemomysł relies on oral tradition, unlike its records of later rulers, including Mieszko II Lambert. This indicates that historians agree that Mieszko II Lambert was an actual historical figure, but they disagree about whether Siemomysł existed.\n\nChoice B is incorrect because the text states that the Gesta principum Polonorum’s documentation of Siemomysł comes from oral tradition — spoken rather than written documentation — unlike its records of rulers who came after Siemomysł. This suggests that the chronicle provides less’ reliable evidence rather than more evidence for Siemomysł s existence in the 900s (or the 10th century) than it does for later rulers like Mieszko II Lambert, who ruled from 1025 to 1031 CE. Choice C is incorrect because the text indicates the opposite: Siemomysł supposedly ruled earlier in the 10th century, while Mieszko II Lambert ruled from 1025 to 1031 CE. The 10th century spans the years from 901 to 1000 CE, so Siemomysł is believed to have ruled earlier than Mieszko II Lambert did, not later as this choice states. Choice D is incorrect. Although the text mentions that information in the written chronicle Gesta principum Polonorum draws its information about Siemomysł from the oral tradition, it doesn’t mention orally transmitted stories about Mieszko II Lambert. Instead, it states that the chronicle’s documentation of Siemomysł relies on oral tradition unlike the records of later rulers do, which suggests that the documentation of later rulers such as Mieszko II Lambert did not rely on oral tradition. Thus, no comparison can be made about how convincing the orally transmitted stories of each ruler are to historians."
              },
              {
                source: "Real question — worked with your tutor",
                skill: "Central Ideas and Details",
                passage: "Algae living within the tissues of corals play a critical role in keeping corals, and the marine ecosystems they are part of, thriving. Some coral species appear brown in color when healthy due to the algae colonies living in their tissues. In the event of an environmental stressor, the algae can die or be expelled, causing the corals to appear white. To recover the algae, the bleached corals then begin to produce bright colors, which block intense sunlight, encouraging the light-sensitive algae to recolonize the corals.",
                question: "What does the text most strongly suggest about corals that produce bright colors?",
                options: ["A. These corals have likely been subjected to stressful environmental conditions.", "B. These corals are likely more vulnerable to exposure from intense sunlight than white corals are.", "C. These corals have likely recovered from an environmental event without the assistance of algae colonies.", "D. These corals are more likely to survive without algae colonies than brown corals are."],
                answer: "A",
                strategy: "The question names one thing: corals that produce bright colors. Find that sentence and read what comes just before it. The colors appear after an environmental stressor, so a brightly colored coral has been through one.",
                explanation: "Choice A is the best answer. The text says that corals produce bright colors to block sunlight and encourage algae to recolonize after “an environmental stressor.” From this, we can infer that corals that produce bright colors have probably been subjected to an environmental stressor.\n\nChoice B is incorrect. The text says that corals produce bright colors to block intense sunlight, which protects the light-sensitive algae that keep the coral healthy. In other words, bright colors make the coral’s health less vulnerable to intense sunlight. Choice C is incorrect. The text says that corals produce bright colors to encourage algae to recolonize, not that they have recovered without the assistance of algae colonies. Choice D is incorrect. The text never compares the likelihood of differently colored corals surviving without algae colonies."
              },
            ],
            ids: [
                'c48584b6', '4816580f', '808414ef', '5675bdeb',
                '60c36cf5', '877b3824', '88ee5572', 'fb473f4d',
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
    // ═════════════════════════════════════════════════════════════════
    // exp-predict-1 — one set, three skills, one move
    // ═════════════════════════════════════════════════════════════════
    //
    // WHY THIS IS ONE SET AND NOT THREE. Transitions, Boundaries and Words in
    // Context look like three curricula. They are three places to test one step:
    // say what the sentence needs BEFORE the options are visible. Name the link.
    // Cover the mark and let the structure force it. Say your own word for the
    // blank. The set is built along that axis, which is why a Transitions item
    // and a Boundaries item sit next to each other rather than in separate sets.
    //
    // THE SELECTION ARGUMENT, AND IT IS A BANK FACT, NOT A PREFERENCE.
    // `homework/assignments.js` selects on skill and difficulty and nothing else.
    // That is sufficient wherever `ruleType` exists — Boundaries carries it on 136
    // items, Form/Structure on 119 — because prioritizePool() at least draws from
    // a tagged pool. TRANSITIONS AND WORDS IN CONTEXT CARRY NO ruleType AT ALL
    // (89 and 52 items, untagged). So no homework day can ask for a concession
    // item, or for a blank whose clue is a colon. Of the 38 Transitions Hard items
    // unseen by this student, five have a concession word as the answer and two a
    // restatement; a random four-item draw reaches a concession item about 45% of
    // the time and both families together about one time in ten.
    //
    // A hand-picked frozen `ids` is therefore the ONLY mechanism in the app that
    // can guarantee a given relationship appears. That is the same argument
    // con-rules-1 makes for the five Boundaries marks, and it is stronger here,
    // because Boundaries at least has the axis to select on.
    //
    // THE DURABLE FIX is a relationship field on Transitions and a clue-type field
    // on Words in Context, exactly as ruleType was added for Conventions. Until
    // that exists, concept coverage for these two skills lives here or nowhere.
    //
    // TWO LAYERS, AND THE ORDER IS THE DESIGN.
    //
    //   `review` — 7 items, UNSCORED, never recorded, authored rather than drawn.
    //     Four are PAIRED DRILLS: the same two sentences twice with one word
    //     changed, so that the SAME transition word cannot be right in both. That
    //     shape is not available from the bank at any draw, and it is the whole
    //     point — a paired item cannot be answered by recognising a word, only by
    //     naming the relationship, because the word is held constant and the
    //     relationship is the only variable. Two are single items that do the same
    //     job for a suffix and for a mark. EVERY SCORED RULE HAS A DRILL BEHIND IT,
    //     and that was checked item by item: the first draft shipped two scored Colon
    //     items with no colon drill in the layer, which is the same defect as a rule
    //     taught with nothing scoring it, running the other way. Each carries a
    //     `strategy` line, which
    //     renderDebrief prints above the explanation: that line is the rule in the
    //     words to reuse. Authored items are legitimate here and only here —
    //     renderDebrief takes self-contained objects, never touches the bank, and
    //     nothing on that screen can reach the mastery denominator.
    //
    //   `ids` — 10 real bank items, SCORED, served wrong-first until two clean
    //     corrects on separate goes. Rule 4 makes this half bank-only. Mastery is
    //     the point of this half, and by construction it cannot be reached in one
    //     sitting: MASTERY_THRESHOLD is 2 and the two corrects must fall on
    //     separate goes.
    //
    // COMPOSITION — 10 items, 7 Hard : 3 Medium.
    //
    // THE RATIO IS NOT A TARGET AND WAS NOT CHOSEN. An earlier draft of this set was
    // 5:5, which is a number rather than an argument. Every Medium here exists to
    // make a specific Hard miss readable, and there are exactly three rules under
    // test that need one:
    //     c0e2314c (M concession)  <->  0cc66f5e / 54ac9e43 (H concession)
    //     4a307bb9 (M colon)       <->  65439b1e (H colon)
    //     cae07228 (M colon clue)  <->  1841cb73 / ef399b40 (H Words in Context)
    // Three controls for three rules. 7:3 falls out of that; it was not aimed at.
    //
    // MEDIUM IS EVIDENCED ON ALL THREE SKILLS ALREADY, which is why none of these
    // Mediums is there to rehearse a tier. Transitions came back 4/4 unguided at
    // Medium on 21 Sep; the retired con-taught-1 ran Easy and Medium across
    // Boundaries at 11/12 on first response; Words in Context returned 2/2 at Medium
    // on the 20 Aug screener. A Medium item added beyond a control would rehearse a
    // rate already held. The LEDGER's standing instruction is unguided repetition at
    // Hard with the method forced, and this is what that looks like in a set.
    //
    //   Transitions 4 · Hard 3 : Medium 1
    //     0cc66f5e  concession, "Granted", with "In other words" in slot B —
    //               the two rules that were never reached, set against each other
    //     54ac9e43  concession where the NEXT sentence carries its own "but",
    //               with "However" sitting in slot A as the whole trap
    //     d8594b7f  restatement, "that is", with "for example" as option A —
    //               example-vs-restatement decided inside a single item
    //     c0e2314c  Medium concession control, with "Accordingly" as the -ly trap
    //     THE MEDIUM CONTROL IS LOAD-BEARING, not filler. Three of these four are
    //     Hard, and a Hard miss on a skill this new cannot be distinguished from a
    //     hurried one without a Medium item testing the same rule beside it.
    //
    //   Boundaries 3 · Hard 2 : Medium 1
    //     65439b1e  Hard, Colon. Complete sentence, then the thing it promised
    //     4a307bb9  Medium, Colon. The same rule, one tier down, as the control
    //     a481fe22  Hard, Commas. A conjunctive adverb cannot join two independent
    //               clauses with a comma — "however" is not a FANBOYS. THIS IS THE
    //               HINGE OF THE WHOLE SET: it is a Conventions question whose
    //               subject matter is a transition word, and it is the one item
    //               that forces the two halves of the set to meet.
    //     COLON IS DELIBERATE AND IT IS SPENT DELIBERATELY. con-taught-1 carried no
    //     colon and no dash by design, so this student's challenge history has never
    //     included one, and only four Colon items remain unseen at Hard against 24
    //     Commas, 15 NoPunct, 12 Semi and 9 Dash. Two of the four are spent here,
    //     with the Medium control chosen to mirror the Hard rather than to add a
    //     sixth mark. NoPunct is absent because con-taught-1 already carried two
    //     no-mark items; it is the next set's, not this one's.
    //
    //   Words in Context 3 · Hard 2 : Medium 1
    //     cae07228  Medium. The clue is a COLON handing over the definition
    //     1841cb73  Hard. The clue is DESPITE, and the answer is "opaque"
    //     ef399b40  Hard. The clue is a semicolon RESTATEMENT of the missing word
    //
    //     HARD-WEIGHTED, AND THE REASON IS SPECIFIC TO THIS SKILL. The first draft
    //     of this set was Medium-only here, on con-taught-1's rule that an hour-old
    //     rule is not masterable by practice. That rule was misapplied. Read what
    //     difficulty actually varies across the Words in Context bank: the clue
    //     structure is the SAME at both tiers — a colon, a restatement, a contrast
    //     word, the logic of a verb — and what hardens is the VOCABULARY in the
    //     options. Hard here is a harder word, not a harder method. So the method
    //     taught tonight is not an hour-old rule at Hard in the way a transition
    //     relationship is; it is the same rule meeting words that cannot be
    //     recognised on sight.
    //
    //     THAT DISTINCTION DECIDES THE TIER. A Medium item whose answer arrives on
    //     instinct is invisible: it cannot show whether the clue was found, which is
    //     the whole thing being taught. At Hard the option set refuses instinct, so
    //     the clue has to be used. 1841cb73 turns on "opaque", which is one of the
    //     two words named in the 24 Aug vocabulary block, so the harder tier here
    //     arrives warm rather than cold.
    //
    //     THE ONE MEDIUM IS THE DIAGNOSTIC, NOT A CONCESSION. cae07228 carries the
    //     most structural clue in the pool — a colon that hands over the definition
    //     outright. Medium right and Hard wrong reads as method intact, vocabulary
    //     thin. Medium wrong reads as the method not running at all. Without it a
    //     Hard miss cannot be told apart from a word he has never met.
    //
    //     Clue coverage is still three types — colon, contrast, restatement — and
    //     still matches the paired drill, because with no clue-type field in the
    //     bank a random draw cannot promise any of them.
    //
    // NOTHING IS HELD OUT FOR A SEPARATE LIVE BLOCK, and that is a change of model
    // worth stating. con-concepts-1 was sat in class; so is this. The teaching layer
    // is worked together at the top of the hour and the ten scored items are then
    // attempted in the room, so there is no second list of questions worked aloud
    // beforehand — the first response IN THE HUB is the measurement, and the
    // discussion happens after it is recorded, not before. That is the whole reason
    // the scored half can be Hard at all.
    //
    // THE ONE SITTING IS THE FULL SET BY DESIGN. nextBatchSize() is
    // min(10, total - mastered), so ten unmastered items serve as one sitting of ten.
    // MASTERY CANNOT COMPLETE IN THAT HOUR AND IS NOT MEANT TO: MASTERY_THRESHOLD is
    // 2 and the two corrects must fall on separate goes. The class buys the clean
    // first response; the second go is what the rest of the week is for.
    //
    // THE SIX FROM 31 AUG STAY OUT on con-taught-1's grounds — worked aloud with the
    // answers given, so they would ask him to remember rather than to decide:
    // 6b2a1288, edbbeca3, f09186ab, f0124561, 566fac8d, 312bfabb.
    //
    // RULE 3 — all twelve retired con-taught-1 ids are excluded and none appears
    // here. Cross-student overlap is not rule 3: 4a307bb9 and ac57e2a8 also sit in
    // Maysa's con-rules-1, exactly as 03ca25bb sits in two sets already.
    //
    // WHAT IS NOT IN THIS SET, and the reasons are as much a part of the build as
    // the inclusions. Rhetorical Synthesis: the most recent unguided evidence is the
    // strongest on file, so slots here would measure a strength. Form, Structure and
    // Sense: the hour is already teaching six rules across three skills, and an SVA
    // repair is a five-minute known archetype that does not need a mastery loop to
    // land. It stays open as LEDGER item 6a and is the first claim on the next set,
    // with f859d049 (analysis ... identifies) reserved and unseen for it.
    //
    // ── WHAT THIS SET IS FOR, IN THE PROGRAM ─────────────────────────────
    //
    // Coverage is not the reason this set exists and would be a poor one. There are
    // four untaught skills left and two classes that may still teach new material;
    // surveying a domain is that job, not this one. This set exists for the single
    // finding that runs through every measurement on file: the methods are owned and
    // they are not automatic, and they are not run at all without supervision.
    //
    // THE SECOND SITTING IS THE POINT, NOT THE FIRST. The first sitting happens in
    // class with the tutor present, which by this program's own standard is not
    // evidence — an in-class score on a skill being coached never proved anything
    // here and is not about to start. What the set uniquely produces is a SECOND
    // unguided retrieval of the same ten questions, days later, wrong-first. Nothing
    // else in the app can force that: a homework day serves an item once and moves
    // on. The gap between the first response and the second is the exact quantity
    // this student's whole diagnosis turns on, and this set is the only instrument
    // that reports it.
    //
    // THE DECAY WINDOW LANDS WHERE THE PROGRAM NEEDS IT, and this is worth knowing
    // before anyone re-sets the date. MASTERY_DECAY_MS is 21 days from lastSeen. Ten
    // items mastered in the last week of September fall back to unmastered around
    // the middle of October — inside the final fortnight, between the consolidation
    // class and the test-craft class. The set therefore turns itself back into a
    // revision instrument in the run-up with nobody authoring anything. Do not
    // "tidy" it away before then.
    //
    // WHERE IT SITS ON THE PAPER. Conventions is about 26% of the section and
    // Expression of Ideas about 20%; Words in Context is the largest single slice of
    // Craft and Structure. These ten therefore sit on roughly three-fifths of the
    // test, which is the right place to spend a mastery loop when there is one loop
    // to spend.
    //
    // THE CLOCK IS AVAILABLE AND IT IS A THIRD USE OF THIS SET, NOT A SETTING TO
    // LEAVE ON. renderStart offers a Timed checkbox next to the question count, and
    // begin() turns it into a WHOLE-SITTING countdown of n x getQuestionBudget()
    // seconds — a pooled budget the student allocates himself, which is the real
    // module's shape rather than a per-question egg timer. So the sequence this set
    // supports is three sittings, not two, and the order is the design:
    //
    //   1. IN CLASS, UNTIMED. The clean first response with the method forced. A
    //      clock here would manufacture exactly the rush that produced one-word
    //      predictions on 21 Sep, and the first response is the scarce reading.
    //   2. AT HOME, UNTIMED. The second retrieval, wrong-first. This is the one the
    //      whole set exists for.
    //   3. TIMED, ONCE THE RULES ARE KNOWN. Ten questions on a pooled budget, on
    //      items whose rules have already been repaired — so a miss is pace and
    //      nothing else, which is the only condition under which a timed score on
    //      this material means anything.
    //
    // ONE MECHANICAL CONSTRAINT ON STEP 3, worth knowing before it is planned: the
    // Timed checkbox lives in the `else` branch of renderStart, so it is offered
    // only while questions remain unmastered. The 'done' state offers Reattempt
    // all, and cReattemptBtn calls begin(total, true, FALSE) — untimed, hardcoded.
    // A timed run of the full ten must therefore happen BEFORE the last item is
    // mastered, or the option is gone until decay returns it.
    //
    // WHAT IT STILL CANNOT DO. Ten questions on a pooled budget is not 27 under a
    // module clock with a passage-length tail, and nothing in this app is. If the
    // 19 Sep mock was not sat, this set does not substitute for it and rebooking
    // outranks everything in here.
    //
    // SELECTION was ledger-blind in the sense that matters: candidates were the
    // unseen set for each skill and tier, filtered on the answer's relationship
    // family or ruleType, then ordered by id. Never shuffled.
    'Luke': [
        {
            setId:  'exp-predict-1',
            title:  'Say it before you look: links, marks, and the word the sentence needs',
            source: 'Built along the prediction axis, with a teaching layer of paired drills',
            date:   '2026-09-21',
            reviewLabel: 'Start here',
            reviewIntro: 'Six short drills that teach the rules this set is built on. Work them first — they are quick, and nothing here counts toward mastery.',
            reviewCta:   'Work the 6 teaching drills',
            review: [
              {
                source: "Paired drill — the word is fixed, the link is not", skill: "Transitions",
                passage: "(1) The new alloy resists corrosion better than steel. ______ it costs four times as much to produce.\n\n(2) The new alloy resists corrosion better than steel. ______ it is also far lighter than steel.",
                question: "Which transition belongs in each blank?",
                options: [
                  "A. However, in (1); Moreover, in (2)",
                  "B. Moreover, in (1); However, in (2)",
                  "C. However, in both",
                  "D. Moreover, in both"
                ],
                answer: "A",
                strategy: "The blank is identical in both sentences and so is the sentence before it. Only the sentence AFTER changed. So the transition cannot be chosen by looking at the blank, or at the word, or at the first sentence — it can only be chosen by naming what the second sentence does to the first.",
                explanation: "Choice A is correct. In (1) the second sentence takes something away from the first: better, but expensive. That is opposite, so it needs a contrast word. In (2) the second sentence piles on: better, and lighter too. That is same again, so it needs an addition word. Nothing about the blank changed and nothing about the first sentence changed. B reverses both. C and D force one word to cover two opposite jobs, which is the mistake this drill exists to make visible: a transition word is not a thing you recognise, it is a name for a relationship you have already worked out."
              },
              {
                source: "The suffix tells you nothing", skill: "Transitions",
                passage: "Coral reefs support roughly a quarter of all marine species. ______ they occupy less than one percent of the ocean floor.",
                question: "Which choice completes the text with the most logical transition?",
                options: ["A. Similarly,", "B. Consequently,", "C. Specifically,", "D. Ultimately,"],
                answer: "D",
                strategy: "Every option here ends in -ly and every one of them means something different. Similarly is same again. Consequently is so. Specifically is for instance. Ultimately is then, at the end. The ending of a word is not a clue to anything — decide the link first, then find the word that names it.",
                explanation: "Choice D is the best answer, and the reasoning is worth more than the answer. The two sentences set a large fact against a small one, and the second closes the thought rather than adding to it, causing it, or giving an example of it. Work the others: A would claim the second sentence says the same as the first, and it does not. B would claim the tiny footprint is CAUSED by supporting a quarter of marine species, which is backwards. C would claim the second sentence is an instance of the first, and a percentage of the ocean floor is not an example of a species count. Four words, one suffix, four different jobs."
              },
              {
                source: "Paired drill — concession", skill: "Transitions",
                passage: "(1) Solar panels have become far cheaper to manufacture. ______ they remain expensive to install, but installation costs are now falling too.\n\n(2) Solar panels have become far cheaper to manufacture. ______ they remain expensive to install, and that gap is widening.",
                question: "Which transition belongs in each blank?",
                options: [
                  "A. Granted, in (1); However, in (2)",
                  "B. However, in (1); Granted, in (2)",
                  "C. Granted, in both",
                  "D. However, in both"
                ],
                answer: "A",
                strategy: "Read to the END of the sentence after the blank before you choose. If that sentence already carries its own but, the objection is already being made and the blank is the part that AGREES first — granted, of course, admittedly, to be sure. If nothing later takes the objection back, the blank carries the contrast itself.",
                explanation: "Choice A is correct. In (1) the sentence says they are still expensive BUT costs are falling — the writer concedes a point and then overrules it, so the blank opens the concession: Granted. Putting However there spends the contrast early and leaves the real turn, the but, with nothing to turn against. In (2) nothing takes the objection back; the gap is widening, so the contrast is the whole point and belongs in the blank: However. Granted there would promise a comeback that never arrives. The first sentence is identical in both. The only thing that decided it was the far end of the second."
              },
              {
                source: "Paired drill — for example against in other words", skill: "Transitions",
                passage: "(1) The museum holds several works made from salvaged industrial material. ______ one sculpture is assembled entirely from ship propellers.\n\n(2) The museum holds several works made from salvaged industrial material. ______ nothing in the collection was made from anything bought new.",
                question: "Which transition belongs in each blank?",
                options: [
                  "A. For example, in (1); In other words, in (2)",
                  "B. In other words, in (1); For example, in (2)",
                  "C. For example, in both",
                  "D. In other words, in both"
                ],
                answer: "A",
                strategy: "For example adds a NEW instance — something the first sentence did not already contain. In other words re-says the SAME fact in different language and adds nothing new. Ask one question: is the second sentence new information, or the same information again?",
                explanation: "Choice A is correct. In (1) the ship-propeller sculpture is one of the several works — new information, a single case drawn out of a group. That is an example. In (2) nothing new arrives at all: salvaged industrial material and nothing bought new are the same fact stated twice, once positively and once negatively. That is a restatement. B reverses them. C and D again ask one word to do two jobs. These two are easy to confuse because both feel like the writer is explaining — the difference is only whether anything was added."
              },
              {
                source: "Where the two halves of this set meet", skill: "Boundaries", ruleType: "Commas",
                passage: "The prototype passed every stress test in the laboratory ______ it failed within a week in the field.",
                question: "Which choice completes the text so that it conforms to the conventions of Standard English?",
                options: ["A. however,", "B. , however,", "C. . However,", "D. and however,"],
                answer: "C",
                strategy: "However is a transition word, not a joining word. It names a relationship; it cannot hold two complete sentences together. Only a full stop, a semicolon, or a comma plus one of the FANBOYS can do that. Cover the blank and ask the Boundaries question first: is each side a whole sentence?",
                explanation: "Choice C is correct. Both sides stand alone — the prototype passed every stress test in the laboratory, and it failed within a week in the field — so the join needs a mark strong enough for two complete sentences. A full stop is. A semicolon would be too, and here the answer prints the full stop. Choice B is the comma splice, and it is the most common error on this whole paper: a comma plus however looks like a join because however sounds like a join, but the comma is doing all the work and a comma cannot. Choice A leaves the two sentences run together with nothing between them. Choice D is not how and behaves with however. Notice what happened: the sentence was decided by a Boundaries rule even though the word in the blank was a transition."
              },
              {
                source: "Paired drill — what the colon actually needs", skill: "Boundaries", ruleType: "Colon",
                passage: "(1) The expedition packed for one hazard above all ______ sudden drops in temperature after dark.\n\n(2) The expedition packed for hazards such as ______ sudden drops in temperature after dark.",
                question: "Which mark belongs in each blank?",
                options: [
                  "A. a colon in (1), no mark in (2)",
                  "B. a semicolon in (1), a colon in (2)",
                  "C. a colon in both",
                  "D. no mark in either"
                ],
                answer: "A",
                strategy: "A colon only needs a complete sentence on its LEFT. What comes after it can be a list, a phrase, or a sentence — it just has to be the thing the left side promised. A semicolon is different: it needs a complete sentence on BOTH sides. So cover the mark and test the left side first, and if the left side cannot stand alone, no mark belongs there at all.",
                explanation: "Choice A is correct. In (1) \"The expedition packed for one hazard above all\" is a complete sentence, and it has promised something — which hazard. The colon delivers it. A semicolon cannot go there, and this is the trap worth naming: \"sudden drops in temperature after dark\" is not a sentence, and a semicolon needs one on both sides. In (2) the left side ends on \"such as\" and is not complete — \"such as\" is already doing the introducing, so nothing belongs in the blank at all. The words after the blank are identical in both. The only thing that decided the mark was what happened on the left."
              },
              {
                source: "Paired drill — the clue decides the word", skill: "Words in Context",
                passage: "(1) The committee found the proposal ______ : every figure in it was supported by two independent audits.\n\n(2) Despite being ______ , the proposal was adopted, since no member could point to a single verified figure in it.",
                question: "Which word belongs in each blank?",
                options: [
                  "A. credible in (1); credible in (2)",
                  "B. credible in (1); unsubstantiated in (2)",
                  "C. unsubstantiated in (1); credible in (2)",
                  "D. unsubstantiated in both"
                ],
                answer: "B",
                strategy: "The sentence always defines the blank somewhere else in itself. Find that part FIRST and say your own ordinary word before you look at the options. The clue hides in four places: after a colon or dash, in a restatement, in a contrast word like despite or although, or in the logic of the verb. When an option is a word you do not know, do not skip past it — take it apart the way we did with prefixes, suffixes and roots, and then test it against the ordinary word you already said. The clue is found the same way whether the words are easy or hard; only the words change.",
                explanation: "Choice B is correct, and the point is where the clue sat in each one. In (1) the colon hands over the definition: every figure supported by two independent audits. Your own word is something like backed up, and credible is the match. In (2) the clue is Despite, which tells you the blank is the OPPOSITE of what makes adoption unsurprising, and the far end of the sentence says no member could point to a single verified figure. Your own word is something like not backed up, and unsubstantiated is the match. The blank is written the same way in both. Only the clue changed, and in one case it came before the blank and in the other it came after."
              }
            ],
            ids: [
                '0cc66f5e', '54ac9e43', 'd8594b7f', 'c0e2314c',
                '65439b1e', '4a307bb9', 'a481fe22',
                'cae07228', '1841cb73', 'ef399b40',
            ],
        },
    ],


};
