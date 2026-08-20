// baseline.test.js — run: node baseline.test.js
// Verifies the screener against the REAL bank, not a fixture. A fixture would
// have hidden the fact that Easy is the scarce tier, which is the single
// finding that shaped this whole design.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ── load the bank the way the browser does ────────────────────────
const ctx = { console, module: undefined, exports: undefined };
vm.createContext(ctx);
['data-craft-structure.js', 'data-expression-of-ideas.js',
 'data-info-ideas.js', 'data-conventions.js'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
});
vm.runInContext(`
    var questionBank = [].concat(
        typeof questionBank_CS  !== 'undefined' ? questionBank_CS  : [],
        typeof questionBank_EOI !== 'undefined' ? questionBank_EOI : [],
        typeof questionBank_II  !== 'undefined' ? questionBank_II  : [],
        typeof questionBank_CON !== 'undefined' ? questionBank_CON : []
    );
    var SKILL_DOMAIN = {
        'Words in Context':'Craft & Structure',
        'Text Structure and Purpose':'Craft & Structure',
        'Cross-Text Connections':'Craft & Structure',
        'Rhetorical Synthesis':'Expression of Ideas',
        'Transitions':'Expression of Ideas',
        'Central Ideas and Details':'Information & Ideas',
        'Command of Evidence — Textual':'Information & Ideas',
        'Command of Evidence — Quantitative':'Information & Ideas',
        'Inferences':'Information & Ideas',
        'Boundaries':'Std. English Conv.',
        'Form, Structure, and Sense':'Std. English Conv.'
    };
`, ctx);

// spec + grade share the browser globals, so run them in the same context.
// `const` at script top level does NOT attach to the context object the way a
// function declaration does, so the constants are re-exported explicitly.
vm.runInContext(fs.readFileSync(path.join(__dirname, 'baseline-spec.js'), 'utf8')
    .replace(/if \(typeof module[\s\S]*$/, ''), ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'baseline-grade.js'), 'utf8')
    .replace(/if \(typeof module[\s\S]*$/, ''), ctx);
vm.runInContext(`
    globalThis.BASELINE_SKILLS  = BASELINE_SKILLS;
    globalThis.BASELINE_FORMS   = BASELINE_FORMS;
    globalThis.BASELINE_BANDS   = BASELINE_BANDS;
    globalThis.BLUEPRINT_WEIGHT = BLUEPRINT_WEIGHT;
    globalThis.BASELINE_SECONDS = BASELINE_SECONDS;
`, ctx);

const bank = ctx.questionBank;

let pass = 0, fail = 0;
function t(name, fn) {
    try { fn(); console.log('  ok   ' + name); pass++; }
    catch (e) { console.log('  FAIL ' + name + '\n       ' + e.message); fail++; }
}
function eq(a, b, m) {
    if (JSON.stringify(a) !== JSON.stringify(b))
        throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
}
function ok(c, m) { if (!c) throw new Error(m || 'expected truthy'); }

console.log('\nBANK\n----');
console.log('  items: ' + bank.length);

console.log('\nPREFLIGHT\n---------');
const pre = ctx.baselinePreflight(bank);
pre.errors.forEach(e => console.log('  ERROR   ' + e));
pre.warnings.forEach(w => console.log('  warn    ' + w));
t('preflight passes with zero errors', () => ok(pre.ok, pre.errors.join(' | ')));

console.log('\nFORM CONSTRUCTION\n-----------------');
const forms = ctx.BASELINE_FORMS.map(f => ctx.buildBaselineForm(bank, f));

t('every form has exactly 22 items', () => {
    forms.forEach(f => eq(f.questions.length, 22, 'form ' + f.form + ':'));
});

t('every form covers all 11 skills, 2 each', () => {
    forms.forEach(f => {
        ctx.BASELINE_SKILLS.forEach(s => {
            const n = f.questions.filter(q => q.skill === s).length;
            eq(n, 2, 'form ' + f.form + ' / ' + s + ':');
        });
    });
});

t('every screener item is Medium', () => {
    forms.forEach(f => f.questions.forEach(q => eq(q.difficulty, 'Medium', q.id)));
});

t('no item id is reused across forms', () => {
    const seen = new Map();
    forms.forEach(f => f.questions.forEach(q => {
        ok(!seen.has(q.id), q.id + ' in both ' + seen.get(q.id) + ' and ' + f.form);
        seen.set(q.id, f.form);
    }));
});

t('no shortfalls reported on any form', () => {
    forms.forEach(f => eq(f.shortfalls, [], 'form ' + f.form + ':'));
});

t('form build is deterministic across calls', () => {
    const a = ctx.buildBaselineForm(bank, 'A').questions.map(q => q.id);
    const b = ctx.buildBaselineForm(bank, 'A').questions.map(q => q.id);
    eq(a, b, 'form A drifted between builds:');
});

t('items are presented in real domain order', () => {
    const order = ['Craft & Structure', 'Information & Ideas',
                   'Expression of Ideas', 'Std. English Conv.'];
    forms.forEach(f => {
        const seq = f.questions.map(q => order.indexOf(ctx.SKILL_DOMAIN[q.skill]));
        seq.forEach((v, i) => ok(i === 0 || seq[i - 1] <= v,
            'form ' + f.form + ' domain order broken at index ' + i));
    });
});

console.log('\nROUTING\n-------');
t('2/2 routes to a Hard ceiling probe', () => {
    eq(ctx.routeSkill(2), { provisional: 'Proficient', probe: 'Hard' });
});
t('1/2 spends no probe', () => {
    eq(ctx.routeSkill(1), { provisional: 'Developing', probe: null });
});
t('0/2 routes to an Easy floor probe', () => {
    eq(ctx.routeSkill(0), { provisional: 'Priority', probe: 'Easy' });
});

console.log('\nBANDING — all routing paths\n---------------------------');
const paths = [
    [2, 'Hard', true,  'Secure'],
    [2, 'Hard', false, 'Proficient'],
    [1, null,   null,  'Developing'],
    [0, 'Easy', true,  'Priority'],
    [0, 'Easy', false, 'Foundational'],
];
paths.forEach(([c, tier, res, want]) => {
    t(`${c}/2 + ${tier || 'no'} probe ${tier ? (res ? 'passed' : 'failed') : ''} -> ${want}`, () => {
        eq(ctx.finalBand(c, tier, res), want);
    });
});

t('unprobed 2/2 stays Proficient, never Secure', () => {
    eq(ctx.finalBand(2, null, null), 'Proficient');
});
t('unprobed 0/2 stays Priority, never Foundational', () => {
    eq(ctx.finalBand(0, null, null), 'Priority');
});

console.log('\nTIMING OVERLAY\n--------------');
t('sub-8s counts as a non-attempt', () =>
    eq(ctx.classifyTiming({ correct: false, seconds: 4 }), 'non-attempt'));
t('wrong under 15s is rushed', () =>
    eq(ctx.classifyTiming({ correct: false, seconds: 12 }), 'rushed'));
t('wrong over 150s is laboured', () =>
    eq(ctx.classifyTiming({ correct: false, seconds: 190 }), 'laboured'));
t('normal wrong answer carries no flag', () =>
    eq(ctx.classifyTiming({ correct: false, seconds: 60 }), null));
t('missing timing degrades to null, never throws', () =>
    eq(ctx.classifyTiming({ correct: true }), null));

console.log('\nPROFILE\n-------');
const formA = forms[0].questions;
const mkItems = (fn) => formA.map((q, i) => ({
    id: q.id, skill: q.skill, difficulty: q.difficulty,
    stage: 1, ...fn(q, i),
}));

t('a perfect screener routes every skill to a Hard probe', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: true, seconds: 55 })));
    eq(Object.keys(prof).length, 11);
    Object.values(prof).forEach(s => {
        eq(s.routedProbe, 'Hard', s.skill + ':');
        eq(s.band, 'Proficient', s.skill + ':');
        eq(s.confidence, 'provisional', s.skill + ':');
    });
});

t('a blank screener routes every skill to an Easy probe', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: false, seconds: 55 })));
    Object.values(prof).forEach(s => eq(s.routedProbe, 'Easy', s.skill + ':'));
});

t('a skill answered in 3s is reported as not-measured, not Foundational', () => {
    const prof = ctx.buildBaselineProfile(mkItems((q) =>
        q.skill === 'Inferences'
            ? { correct: false, seconds: 3 }
            : { correct: true, seconds: 55 }));
    eq(prof['Inferences'].band, null);
    eq(prof['Inferences'].confidence, 'not-measured');
    ok(/Re-test/.test(prof['Inferences'].note || ''));
});

t('probe results promote and demote correctly', () => {
    const base = mkItems(() => ({ correct: true, seconds: 55 }));
    const probes = [
        { id: 'p1', skill: 'Transitions', difficulty: 'Hard',
          stage: 2, probeTier: 'Hard', correct: true,  seconds: 70 },
        { id: 'p2', skill: 'Boundaries',  difficulty: 'Hard',
          stage: 2, probeTier: 'Hard', correct: false, seconds: 70 },
    ];
    const prof = ctx.buildBaselineProfile(base.concat(probes));
    eq(prof['Transitions'].band, 'Secure');
    eq(prof['Transitions'].confidence, 'confirmed');
    eq(prof['Boundaries'].band, 'Proficient');
    eq(prof['Boundaries'].confidence, 'confirmed');
});

console.log('\nPROBE SET\n---------');
t('a probe exists for every routed skill, in the right tier', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: false, seconds: 55 })));
    const { probes, gaps } = ctx.buildProbeSet(bank, prof, formA.map(q => q.id));
    eq(gaps, [], 'unfillable probe slots:');
    eq(probes.length, 11);
    probes.forEach(p => eq(p.difficulty, 'Easy', p.skill + ':'));
});

t('ceiling probes are all available too', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: true, seconds: 55 })));
    const { probes, gaps } = ctx.buildProbeSet(bank, prof, formA.map(q => q.id));
    eq(gaps, []);
    eq(probes.length, 11);
    probes.forEach(p => eq(p.difficulty, 'Hard', p.skill + ':'));
});

t('probes never reuse a screener item', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: false, seconds: 55 })));
    const used = formA.map(q => q.id);
    const { probes } = ctx.buildProbeSet(bank, prof, used);
    probes.forEach(p => ok(!used.includes(p.id), p.id + ' reused from screener'));
});

t('a half-right screener spends no probes at all', () => {
    let flip = 0;
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: (flip++ % 2 === 0), seconds: 55 })));
    const { probes } = ctx.buildProbeSet(bank, prof, formA.map(q => q.id));
    Object.values(prof).forEach(s => eq(s.band, 'Developing', s.skill + ':'));
    eq(probes.length, 0, 'Developing skills should not consume probe items:');
});

console.log('\nPROJECTION\n----------');
t('projection is monotonic in accuracy', () => {
    let prev = -1;
    [0, 0.25, 0.5, 0.75, 1].forEach(rate => {
        let n = 0;
        const items = mkItems(() => ({ correct: (n++ / 22) < rate, seconds: 55 }));
        const p = ctx.projectBaseline(items);
        ok(p.low > prev, 'not monotonic at rate ' + rate);
        prev = p.low;
    });
});

t('projection stays inside 120-720', () => {
    [0, 1].forEach(rate => {
        const items = mkItems(() => ({ correct: rate === 1, seconds: 55 }));
        const p = ctx.projectBaseline(items);
        ok(p.low >= 120 && p.high <= 720, `${p.low}-${p.high} out of range`);
        ok(p.high > p.low, 'projection must be a range, not a point');
    });
});

t('projection re-weights domains rather than using raw total', () => {
    // I&I owns 8 of 22 screener items (36%) but only ~26% of the real section.
    // Failing all of I&I and nothing else must cost LESS than its raw 36% share.
    const items = mkItems((q) => ({
        correct: ctx.SKILL_DOMAIN[q.skill] !== 'Information & Ideas', seconds: 55,
    }));
    const p = ctx.projectBaseline(items);
    const rawShare = 1 - (8 / 22);            // 0.636 if we used raw counts
    ok(p.accuracy > Math.round(rawShare * 100),
        `re-weighting not applied: accuracy ${p.accuracy}% vs raw ${Math.round(rawShare * 100)}%`);
    eq(p.accuracy, 74);                        // 1 - 0.26 = 0.74
});

console.log('\nSKILL WEIGHTS\n-------------');
t('skill weight beats bare domain weight for within-domain frequency', () => {
    const w = ctx.skillWeights(bank);
    // Same domain (Craft & Structure): the common skill must outweigh the rare one.
    ok(w['Words in Context'] > w['Cross-Text Connections'],
        `WiC ${w['Words in Context']} should exceed CTC ${w['Cross-Text Connections']}`);
    // Across domains: Rhetorical Synthesis is frequent inside a 20% domain,
    // Cross-Text Connections is rare inside a 28% one. Frequency must win.
    ok(w['Rhetorical Synthesis'] > w['Cross-Text Connections'],
        `RS ${w['Rhetorical Synthesis']} should exceed CTC ${w['Cross-Text Connections']}`);
});

t('skill weights sum to ~1.0 across the four domains', () => {
    const w = ctx.skillWeights(bank);
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    ok(Math.abs(total - 1) < 0.001, 'weights sum to ' + total.toFixed(4));
});

console.log('\nFOCUS QUEUE\n-----------');
t('queue ranks by severity x skill weight', () => {
    const prof = ctx.buildBaselineProfile(mkItems((q) => ({
        correct: !(q.skill === 'Rhetorical Synthesis' || q.skill === 'Cross-Text Connections'),
        seconds: 55,
    })));
    const names = ctx.baselineFocusQueue(prof, null, bank).map(x => x.skill);
    ok(names.indexOf('Rhetorical Synthesis') < names.indexOf('Cross-Text Connections'),
        'heavier-weighted skill must rank first, got ' + JSON.stringify(names));
});

t('a severe band outranks a merely heavy skill', () => {
    // Foundational in a light skill must beat Developing in a heavy one:
    // severity is the dominant term, weight only breaks ties within a band.
    const prof = {
        'Cross-Text Connections': { skill: 'Cross-Text Connections', band: 'Foundational' },
        'Rhetorical Synthesis':   { skill: 'Rhetorical Synthesis',   band: 'Developing' },
    };
    const names = ctx.baselineFocusQueue(prof, null, bank).map(x => x.skill);
    eq(names[0], 'Cross-Text Connections');
});

t('Secure and Proficient skills stay out of the queue', () => {
    const prof = ctx.buildBaselineProfile(mkItems(() => ({ correct: true, seconds: 55 })));
    eq(ctx.baselineFocusQueue(prof, null, bank).length, 0);
});

t('not-measured skills never enter the queue', () => {
    const prof = ctx.buildBaselineProfile(mkItems((q) =>
        q.skill === 'Inferences' ? { correct: false, seconds: 3 }
                                 : { correct: false, seconds: 55 }));
    const names = ctx.baselineFocusQueue(prof, null, bank).map(x => x.skill);
    ok(!names.includes('Inferences'), 'an unmeasured skill must not be planned against');
});

console.log('\n' + '='.repeat(46));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(46) + '\n');
process.exit(fail ? 1 : 0);
