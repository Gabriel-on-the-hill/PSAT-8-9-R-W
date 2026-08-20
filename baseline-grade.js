// ══════════════════════════════════════════════════════════════════
// baseline-grade.js — banding, routing, projection, and the plan
//
// The old baseline reported "11 / 18 · 61%" and a top-three weakest list. Both
// numbers were noise: with one or two items per skill, four skills could only
// score 0% or 100%, and chance alone earns ~4.5 of 18 on four-option items. Two
// identical students got two different study plans.
//
// This file replaces the percentage with a BAND, because two items cannot
// support a percentage and pretending otherwise is the actual bug.
//
// WHY BANDS BEAT A RATIO
// An earlier draft of this design scored each skill as difficulty-weighted
// points ÷ available points. It does not survive contact with an adaptive
// second stage: a student routed to a Hard probe has a denominator of 4 and a
// student routed to an Easy probe has a denominator of 2, so 0.75 means two
// different things and the thresholds silently stop being comparable. The fix
// is to keep the MEASUREMENT base fixed — the same two Medium items for
// everyone — and let the probe move the student one rung up or down from it.
// Uniform base, ordinal ladder, no denominator drift.
// ══════════════════════════════════════════════════════════════════

// Five bands, each with a genuinely different instructional consequence.
// Priority vs Foundational is the distinction the old report could not draw at
// all, and it is the one that matters most: more practice is the right answer
// for one and the wrong answer for the other.
const BASELINE_BANDS = {
    Secure: {
        rank: 5,
        label: 'Secure',
        meaning: 'Handles this skill at the hardest level the test asks for.',
        action: 'Maintain with spaced review only. Do not spend teaching time here.',
    },
    Proficient: {
        rank: 4,
        label: 'Proficient',
        meaning: 'Solid at test level; the hardest variants are not there yet.',
        action: 'Light practice at Hard difficulty. Not a teaching priority.',
    },
    Developing: {
        rank: 3,
        label: 'Developing',
        meaning: 'Inconsistent at test level — gets it sometimes.',
        action: 'Targeted practice at Medium, then push to Hard. Reachable gains.',
    },
    Priority: {
        rank: 2,
        label: 'Priority',
        meaning: 'Has the underlying idea but cannot apply it at test level.',
        action: 'Teach the method, then drill Medium. This is where points are.',
    },
    Foundational: {
        rank: 1,
        label: 'Foundational',
        meaning: 'The underlying skill is not in place yet.',
        action: 'Pre-teach from scratch. Drilling test questions will not fix this.',
    },
};

// ── timing overlay ────────────────────────────────────────────────
// A wrong answer means at least three different things and the remedy differs
// for each. Without per-item time you cannot tell "does not know it" from "ran
// out of clock", and those prescriptions are opposites.
const T_NON_ATTEMPT = 8;     // under 8 s on a passage item = did not read it
const T_RUSHED      = 15;    // under 15 s = answered, but not deliberately
const T_LABOURED    = 150;   // over 150 s = engaged and stuck, not indifferent

function classifyTiming(item) {
    const s = item.seconds;
    if (typeof s !== 'number' || s < 0) return null;
    if (s < T_NON_ATTEMPT) return 'non-attempt';
    if (!item.correct && s < T_RUSHED) return 'rushed';
    if (!item.correct && s > T_LABOURED) return 'laboured';
    if (item.correct && s > T_LABOURED) return 'slow-correct';
    return null;
}

// ── stage 1 → provisional band, and the routing decision ──────────
// 2/2 → the open question is the CEILING, so spend a Hard item.
// 1/2 → Developing is already the honest answer; a probe buys nothing. Spend
//       nothing. (This is why the probe set is short.)
// 0/2 → the open question is the FLOOR, so spend a scarce Easy item, which is
//       the one place it is genuinely decisive.
function routeSkill(correctCount) {
    if (correctCount >= 2) return { provisional: 'Proficient', probe: 'Hard'  };
    if (correctCount === 1) return { provisional: 'Developing', probe: null   };
    return                         { provisional: 'Priority',   probe: 'Easy' };
}

// ── stage 2 → final band ──────────────────────────────────────────
function finalBand(correctCount, probeTier, probeCorrect) {
    if (probeTier === null || probeCorrect === null || probeCorrect === undefined) {
        return routeSkill(correctCount).provisional;
    }
    if (probeTier === 'Hard') return probeCorrect ? 'Secure' : 'Proficient';
    if (probeTier === 'Easy') return probeCorrect ? 'Priority' : 'Foundational';
    return routeSkill(correctCount).provisional;
}

// ── the profile ───────────────────────────────────────────────────
// items: [{ id, skill, difficulty, correct, seconds, stage, probeTier }]
function buildBaselineProfile(items) {
    const skills = {};

    items.filter(i => i.stage === 1).forEach(i => {
        const s = skills[i.skill] || (skills[i.skill] = {
            skill: i.skill, screenCorrect: 0, screenTotal: 0,
            probeTier: null, probeCorrect: null, flags: [], items: [],
        });
        s.screenTotal++;
        if (i.correct) s.screenCorrect++;
        const t = classifyTiming(i);
        if (t) s.flags.push(t);
        s.items.push(i);
    });

    items.filter(i => i.stage === 2).forEach(i => {
        const s = skills[i.skill];
        if (!s) return;
        s.probeTier    = i.probeTier || i.difficulty;
        s.probeCorrect = !!i.correct;
        const t = classifyTiming(i);
        if (t) s.flags.push(t);
        s.items.push(i);
    });

    Object.values(skills).forEach(s => {
        const route = routeSkill(s.screenCorrect);
        s.routedProbe  = route.probe;
        s.provisional  = route.provisional;
        s.band         = finalBand(s.screenCorrect, s.probeTier, s.probeCorrect);
        s.confidence   = s.probeTier ? 'confirmed' : (route.probe ? 'provisional' : 'confirmed');

        // A skill whose screener items were not genuinely attempted has not
        // been measured. Say so rather than reporting a band built on a coin
        // flip — a false "Foundational" sends a tutor to re-teach something the
        // student already knows.
        const nonAttempts = s.items.filter(i =>
            i.stage === 1 && classifyTiming(i) === 'non-attempt').length;
        if (nonAttempts >= s.screenTotal) {
            s.band = null;
            s.confidence = 'not-measured';
            s.note = 'Not attempted — no reliable reading. Re-test this skill.';
        } else if (nonAttempts > 0) {
            s.confidence = 'low';
            s.note = 'One item was not genuinely attempted; treat with caution.';
        } else if (s.flags.includes('rushed')) {
            s.note = 'Missed at speed — check whether this is pacing, not knowledge.';
        } else if (s.flags.includes('laboured')) {
            s.note = 'Engaged but slow and wrong — a method gap, not effort.';
        }
    });

    return skills;
}

// ── projection ────────────────────────────────────────────────────
// Score per domain, then re-weight to the real blueprint. Without this the
// screener's own shape leaks into the estimate: uniform 2-per-skill coverage
// gives Information & Ideas 8 of 22 items (36% vs a real ~26%) purely because
// it owns four skills, so a student weak in I&I would be under-projected by the
// instrument rather than by their ability.
function projectBaseline(items) {
    const dom = {};
    items.filter(i => i.stage === 1).forEach(i => {
        const d = (typeof SKILL_DOMAIN !== 'undefined' && SKILL_DOMAIN[i.skill]) || null;
        if (!d) return;
        const rec = dom[d] || (dom[d] = { c: 0, t: 0 });
        rec.t++;
        if (i.correct) rec.c++;
    });

    let weighted = 0, weightUsed = 0;
    Object.entries(BLUEPRINT_WEIGHT).forEach(([d, w]) => {
        if (!dom[d] || !dom[d].t) return;
        weighted   += (dom[d].c / dom[d].t) * w;
        weightUsed += w;
    });
    const acc = weightUsed ? weighted / weightUsed : 0;

    // The screener is all-Medium. A student who clears Medium reliably is not
    // at the top of the scale, because the real section carries Hard items too,
    // so mapping Medium accuracy straight onto 120–720 would overstate a strong
    // student and understate a weak one. Compress toward the middle of the
    // range and — this is the important part — report a WIDTH, never a point.
    // Twenty-two items cannot support a point estimate and a single number
    // invites a parent to treat ±60 of noise as progress.
    const centre = 120 + (0.15 + acc * 0.72) * 600;
    const half   = 30;                                   // ±30 → a 60-point band
    const lo = Math.max(120, Math.round((centre - half) / 10) * 10);
    const hi = Math.min(720, Math.round((centre + half) / 10) * 10);

    return {
        low: lo, high: hi,
        accuracy: Math.round(acc * 100),
        domains: dom,
        caveat: 'Estimated from a 22-question medium-difficulty screener. ' +
                'A full mock exam gives a tighter figure.',
    };
}

// ── how much is a skill actually worth? ───────────────────────────
// Domain weight alone is the wrong ruler, and the test suite is what caught it.
// Craft & Structure carries 28% but splits it across THREE skills; Expression
// of Ideas carries 20% across TWO. Ranking on the domain figure therefore says
// Cross-Text Connections outranks Rhetorical Synthesis, which is backwards:
// Cross-Text Connections is rare on the real section and Rhetorical Synthesis
// is everywhere.
//
// Within-domain frequency is not uniform either, so splitting evenly is only
// marginally better. The bank was extracted from real released material, so a
// skill's share of its own domain's items is a usable empirical proxy for how
// often the real section asks it. Skill weight is the product of the two:
//
//     skill weight = domain blueprint weight × skill's share of its domain
//
// Cross-Text Connections: 0.28 × (24/112) = 0.060
// Rhetorical Synthesis:   0.20 × (58/94)  = 0.123
//
// Derived from the bank at run time, so it stays honest as the bank grows.
let _skillWeightCache = null;

function skillWeights(bank) {
    const src = bank || (typeof questionBank !== 'undefined' ? questionBank : []);
    if (_skillWeightCache && _skillWeightCache.n === src.length) return _skillWeightCache.w;

    const domainTotal = {};
    const skillTotal  = {};
    src.forEach(q => {
        const d = (typeof SKILL_DOMAIN !== 'undefined' && SKILL_DOMAIN[q.skill]) || null;
        if (!d) return;
        domainTotal[d]     = (domainTotal[d]     || 0) + 1;
        skillTotal[q.skill] = (skillTotal[q.skill] || 0) + 1;
    });

    const w = {};
    Object.keys(skillTotal).forEach(s => {
        const d = SKILL_DOMAIN[s];
        const share = domainTotal[d] ? skillTotal[s] / domainTotal[d] : 0;
        w[s] = (BLUEPRINT_WEIGHT[d] || 0.2) * share;
    });

    _skillWeightCache = { n: src.length, w };
    return w;
}

// ── the plan ──────────────────────────────────────────────────────
// Rank by severity × skill weight, so teaching time goes where the points are.
function baselineFocusQueue(profile, limit, bank) {
    const weights = skillWeights(bank);
    const scored = Object.values(profile)
        .filter(s => s.band && BASELINE_BANDS[s.band].rank <= 3)
        .map(s => {
            const w = weights[s.skill] || 0.05;
            const severity = 4 - BASELINE_BANDS[s.band].rank;   // Dev 1, Pri 2, Found 3
            return { ...s, weight: w, priorityScore: severity * w };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore);
    return limit ? scored.slice(0, limit) : scored;
}

// Build the stage-2 probe set: one item per skill that routed to a probe,
// drawn from the correct tier and excluding anything already served.
function buildProbeSet(bank, profile, excludeIds) {
    const exclude = new Set(excludeIds || []);
    const out = [];
    const gaps = [];
    Object.values(profile).forEach(s => {
        if (!s.routedProbe) return;
        const pool = bank.filter(q =>
            q.skill === s.skill && q.difficulty === s.routedProbe && !exclude.has(q.id));
        if (!pool.length) {
            // Never substitute another skill to fill the slot. Report the gap.
            gaps.push({ skill: s.skill, tier: s.routedProbe });
            return;
        }
        const pick = pool[0];
        out.push({ ...pick, stage: 2, probeTier: s.routedProbe });
        exclude.add(pick.id);
    });
    return { probes: out, gaps };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BASELINE_BANDS, classifyTiming, routeSkill, finalBand, skillWeights,
        buildBaselineProfile, projectBaseline, baselineFocusQueue, buildProbeSet,
        T_NON_ATTEMPT, T_RUSHED, T_LABOURED,
    };
}
