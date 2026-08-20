// ══════════════════════════════════════════════════════════════════
// baseline-spec.js — form construction for the Baseline Screener
//
// WHY THIS FILE EXISTS
// The old baseline hand-picked 18 items into a JSON file. That made skill
// coverage a property of whoever edited the file, and difficulty a property of
// what happened to be lying around: the shipped set was 11 Easy / 7 Medium /
// 0 Hard, so any strong student hit the ceiling on question one and the report
// said nothing. Coverage has to be a build-time guarantee, not an intention.
//
// THE ANCHOR IS MEDIUM, AND THAT IS A DATA DECISION
// The bank is 50 Easy / 138 Medium / 276 Hard. Easy is the SCARCE tier — nine
// of eleven skills hold four or five Easy items total, which cannot supply
// three parallel forms at two per skill. Medium is the only tier deep enough
// to anchor a fixed screener (min 9 per skill, needs 6), and it is also the
// modal difficulty of the real section, so it discriminates best on a student
// nobody has measured yet.
//
// Easy items are therefore spent as FLOOR PROBES and Hard items as CEILING
// PROBES in stage two (see baseline-grade.js), only on the skills where the
// screener leaves the answer genuinely open. Scarce tier, decisive use.
//
// EVERY SLOT'S SKILL IS PINNED. The stage-two router chooses difficulty; it
// never chooses which skill. Coverage cannot drift.
// ══════════════════════════════════════════════════════════════════

// baseline.html does not load app.js (92 KB of session UI it has no use for),
// so the domain map is defined here when it is not already present. Guarded, so
// app.js stays the single source of truth wherever both are loaded.
if (typeof SKILL_DOMAIN === 'undefined') {
    var SKILL_DOMAIN = {
        'Words in Context':                   'Craft & Structure',
        'Text Structure and Purpose':         'Craft & Structure',
        'Cross-Text Connections':             'Craft & Structure',
        'Rhetorical Synthesis':               'Expression of Ideas',
        'Transitions':                        'Expression of Ideas',
        'Central Ideas and Details':          'Information & Ideas',
        'Command of Evidence — Textual':      'Information & Ideas',
        'Command of Evidence — Quantitative': 'Information & Ideas',
        'Inferences':                         'Information & Ideas',
        'Boundaries':                         'Std. English Conv.',
        'Form, Structure, and Sense':         'Std. English Conv.',
    };
}

const BASELINE_SKILLS = [
    'Words in Context',
    'Text Structure and Purpose',
    'Cross-Text Connections',
    'Central Ideas and Details',
    'Command of Evidence — Textual',
    'Command of Evidence — Quantitative',
    'Inferences',
    'Rhetorical Synthesis',
    'Transitions',
    'Boundaries',
    'Form, Structure, and Sense',
];

const BASELINE_ITEMS_PER_SKILL = 2;              // 11 skills × 2 = 22 items
const BASELINE_ANCHOR_TIER     = 'Medium';
const BASELINE_SECONDS         = 22 * 60;        // ≈60 s/item, mirrors real pacing
const BASELINE_FORMS           = ['A', 'B', 'C'];

// Blueprint weights for the real R&W section. The screener deliberately does
// NOT match these — uniform 2-per-skill coverage forces Information & Ideas to
// 8/22 (36%) because it owns four of the eleven skills, and pushes Std English
// Conv. down to 4/22 (18%). That distortion is the price of measuring every
// skill in 22 items, and it is the right price for a DIAGNOSTIC: the mock exam
// is what owes you blueprint fidelity.
//
// The projection corrects for it by scoring per domain and re-weighting, so a
// student is never rewarded or punished for the screener's own shape.
const BLUEPRINT_WEIGHT = {
    'Craft & Structure':  0.28,
    'Information & Ideas': 0.26,
    'Std. English Conv.':  0.26,
    'Expression of Ideas': 0.20,
};

// ── deterministic RNG ─────────────────────────────────────────────
// Form A must be the same 22 questions for every student who sits Form A,
// or "compare Faith's baseline to Maysa's" is meaningless and a retake
// comparison is measuring the form, not the child. mulberry32 keeps the
// selection reproducible from the form letter alone.
function _seedFrom(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
}

function _mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function _seededShuffle(arr, rand) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// ── the manifest ──────────────────────────────────────────────────
// 22 slots, skill pinned, tier pinned to Medium. This is the whole contract.
function baselineManifest() {
    const slots = [];
    BASELINE_SKILLS.forEach(skill => {
        for (let n = 0; n < BASELINE_ITEMS_PER_SKILL; n++) {
            slots.push({ skill, tier: BASELINE_ANCHOR_TIER, stage: 1 });
        }
    });
    return slots;
}

// ── form construction ─────────────────────────────────────────────
// Partition each skill's Medium pool across the three forms so Form B never
// reuses a Form A item. A retake that re-serves the same questions measures
// memory; the old baseline's "Retake" button called location.reload() and did
// exactly that.
function buildBaselineForm(bank, formId) {
    const idx = BASELINE_FORMS.indexOf(formId);
    if (idx === -1) throw new Error('baseline: unknown form "' + formId + '"');

    const out = [];
    const shortfalls = [];

    BASELINE_SKILLS.forEach(skill => {
        const pool = bank.filter(q =>
            q.skill === skill && q.difficulty === BASELINE_ANCHOR_TIER);
        // Shuffle once per skill with a skill-stable seed, THEN slice by form.
        // Seeding on the skill (not the form) is what makes the three forms
        // disjoint slices of one ordering rather than three independent draws
        // that could collide.
        const ordered = _seededShuffle(pool, _mulberry32(_seedFrom('baseline::' + skill)));
        const start = idx * BASELINE_ITEMS_PER_SKILL;
        const take  = ordered.slice(start, start + BASELINE_ITEMS_PER_SKILL);

        if (take.length < BASELINE_ITEMS_PER_SKILL) {
            shortfalls.push({ skill, got: take.length, want: BASELINE_ITEMS_PER_SKILL });
        }
        take.forEach(q => out.push(q));
    });

    if (shortfalls.length) {
        // Loud, not silent. A thin pool must never be papered over by quietly
        // substituting another skill — that is precisely how coverage rots.
        console.error('baseline: form ' + formId + ' is under-supplied', shortfalls);
    }

    return { form: formId, questions: orderBaselineSAT(out), shortfalls };
}

// Present in the real section's domain order. R&W is not shuffled: it runs
// domain by domain, so a screener that interleaves randomly feels wrong to a
// student who has seen a real test and adds a needless task-switching cost.
const BASELINE_DOMAIN_ORDER = [
    'Craft & Structure',
    'Information & Ideas',
    'Expression of Ideas',
    'Std. English Conv.',
];

function orderBaselineSAT(questions) {
    const domainOf = (q) =>
        (typeof SKILL_DOMAIN !== 'undefined' && SKILL_DOMAIN[q.skill]) || 'Craft & Structure';
    return questions.slice().sort((a, b) => {
        const da = BASELINE_DOMAIN_ORDER.indexOf(domainOf(a));
        const db = BASELINE_DOMAIN_ORDER.indexOf(domainOf(b));
        if (da !== db) return da - db;
        // Within a domain, keep a skill's two items apart so a student does not
        // answer the same skill twice in a row and read the pairing as a hint.
        return a.skill === b.skill ? 0 : String(a.skill).localeCompare(String(b.skill));
    });
}

// Interleave so the two items of any one skill never sit adjacent.
function spreadBaseline(questions) {
    const bySkill = new Map();
    questions.forEach(q => {
        if (!bySkill.has(q.skill)) bySkill.set(q.skill, []);
        bySkill.get(q.skill).push(q);
    });
    const lanes = [...bySkill.values()];
    const out = [];
    let n = 0;
    while (out.length < questions.length) {
        lanes.forEach(l => { if (l[n]) out.push(l[n]); });
        n++;
        if (n > 50) break;                        // paranoia guard
    }
    return out;
}

// ── preflight ─────────────────────────────────────────────────────
// Run this in the test suite. If it throws, the build is wrong and shipping it
// would hand a tutor a report with a silent hole in it.
function baselinePreflight(bank) {
    const errors = [];
    const warnings = [];

    // 1. Every skill can supply every form at the anchor tier.
    const need = BASELINE_FORMS.length * BASELINE_ITEMS_PER_SKILL;
    BASELINE_SKILLS.forEach(skill => {
        const have = bank.filter(q =>
            q.skill === skill && q.difficulty === BASELINE_ANCHOR_TIER).length;
        if (have < need) {
            errors.push(`${skill}: only ${have} ${BASELINE_ANCHOR_TIER} items, need ${need} for ${BASELINE_FORMS.length} forms`);
        }
    });

    // 2. Probe pools are non-empty in BOTH directions for every skill, or a
    //    student can route to a probe that does not exist.
    BASELINE_SKILLS.forEach(skill => {
        const easy = bank.filter(q => q.skill === skill && q.difficulty === 'Easy').length;
        const hard = bank.filter(q => q.skill === skill && q.difficulty === 'Hard').length;
        if (easy === 0) errors.push(`${skill}: no Easy items — floor probe impossible`);
        if (hard === 0) errors.push(`${skill}: no Hard items — ceiling probe impossible`);
        if (easy > 0 && easy < 3) warnings.push(`${skill}: only ${easy} Easy items — floor probe repeats across retakes`);
        if (hard > 0 && hard < 3) warnings.push(`${skill}: only ${hard} Hard items — ceiling probe repeats across retakes`);
    });

    // 3. Forms are disjoint and complete.
    const seen = new Map();
    BASELINE_FORMS.forEach(f => {
        const { questions } = buildBaselineForm(bank, f);
        if (questions.length !== BASELINE_SKILLS.length * BASELINE_ITEMS_PER_SKILL) {
            errors.push(`form ${f}: ${questions.length} items, expected ${BASELINE_SKILLS.length * BASELINE_ITEMS_PER_SKILL}`);
        }
        questions.forEach(q => {
            if (seen.has(q.id)) errors.push(`id ${q.id} appears in form ${seen.get(q.id)} and form ${f}`);
            else seen.set(q.id, f);
        });
        BASELINE_SKILLS.forEach(skill => {
            const n = questions.filter(q => q.skill === skill).length;
            if (n !== BASELINE_ITEMS_PER_SKILL) {
                errors.push(`form ${f}: ${skill} has ${n} items, expected ${BASELINE_ITEMS_PER_SKILL}`);
            }
        });
    });

    return { ok: errors.length === 0, errors, warnings };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BASELINE_SKILLS, BASELINE_ITEMS_PER_SKILL, BASELINE_ANCHOR_TIER,
        BASELINE_SECONDS, BASELINE_FORMS, BLUEPRINT_WEIGHT,
        baselineManifest, buildBaselineForm, orderBaselineSAT, spreadBaseline,
        baselinePreflight,
    };
}
