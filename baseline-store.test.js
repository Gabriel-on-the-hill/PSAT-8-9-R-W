// baseline-store.test.js — persistence, retake forms, growth deltas, and a
// full end-to-end run through screener -> probes -> amended record.
// Run: node baseline-store.test.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ── browser shims ─────────────────────────────────────────────────
function mkStorage() {
    const m = new Map();
    return {
        getItem: k => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: k => m.delete(k),
        clear: () => m.clear(),
        _dump: () => Object.fromEntries(m),
    };
}

const ctx = {
    console,
    localStorage: mkStorage(),
    sessionStorage: mkStorage(),
    Date, JSON, Math, String, Object, Array, Number, Boolean, Error, isNaN,
};
vm.createContext(ctx);

['data-craft-structure.js', 'data-expression-of-ideas.js',
 'data-info-ideas.js', 'data-conventions.js'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
});
vm.runInContext(`
    var questionBank = [].concat(questionBank_CS, questionBank_EOI,
                                 questionBank_II, questionBank_CON);
`, ctx);

const strip = f => fs.readFileSync(path.join(__dirname, f), 'utf8')
    .replace(/if \(typeof module[\s\S]*$/, '');
vm.runInContext(strip('baseline-spec.js'), ctx);
vm.runInContext(strip('baseline-grade.js'), ctx);
vm.runInContext(strip('baseline-store.js'), ctx);
vm.runInContext(`
    globalThis.BASELINE_FORMS   = BASELINE_FORMS;
    globalThis.BASELINE_SKILLS  = BASELINE_SKILLS;
    globalThis.BASELINE_BANDS   = BASELINE_BANDS;
    globalThis.BASELINE_SECONDS = BASELINE_SECONDS;
    globalThis.BASELINE_STORE_VERSION = BASELINE_STORE_VERSION;
`, ctx);

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
function reset() { ctx.localStorage.clear(); ctx.sessionStorage.clear(); }

const bank = ctx.questionBank;

// helper: run a screener with a given correctness predicate
function sit(formId, isCorrect, seconds) {
    const form = ctx.buildBaselineForm(bank, formId);
    const items = form.questions.map((q, i) => ({
        id: q.id, skill: q.skill, difficulty: q.difficulty, stage: 1,
        chosen: 'A', correct: isCorrect(q, i), seconds: seconds || 55,
    }));
    const profile = ctx.buildBaselineProfile(items);
    const projection = ctx.projectBaseline(items);
    const slim = {};
    Object.values(profile).forEach(s => { slim[s.skill] = {
        band: s.band, confidence: s.confidence, screenCorrect: s.screenCorrect,
        screenTotal: s.screenTotal, routedProbe: s.routedProbe,
    }; });
    ctx.saveBaseline({
        takenAt: Date.now(), form: formId, stage: 'screener',
        correct: items.filter(i => i.correct).length, total: items.length,
        projection, skills: slim, items,
    });
    return { items, profile, projection };
}

console.log('\nPERSISTENCE\n-----------');

t('a saved baseline survives and reads back', () => {
    reset();
    sit('A', () => true);
    const list = ctx.getBaselines();
    eq(list.length, 1);
    eq(list[0].form, 'A');
    eq(list[0].total, 22);
    ok(list[0].savedAt > 0, 'savedAt not stamped');
    eq(list[0].version, ctx.BASELINE_STORE_VERSION);
});

t('records are per-user, not global', () => {
    reset();
    ctx.sessionStorage.setItem('psat89_user', 'faith');
    sit('A', () => true);
    ctx.sessionStorage.setItem('psat89_user', 'maysa');
    eq(ctx.getBaselines().length, 0, 'maysa should not see faith\'s baseline:');
    sit('A', () => false);
    eq(ctx.getBaselines().length, 1);
    ctx.sessionStorage.setItem('psat89_user', 'faith');
    eq(ctx.getBaselines().length, 1);
    eq(ctx.getBaselines()[0].correct, 22, 'faith\'s record was overwritten:');
});

t('a retake appends rather than overwriting the anchor', () => {
    reset();
    sit('A', () => false);
    sit('B', () => true);
    const list = ctx.getBaselines();
    eq(list.length, 2);
    eq(list[0].correct, 0, 'the anchor must be preserved:');
    eq(list[1].correct, 22);
    eq(ctx.firstBaseline().form, 'A');
    eq(ctx.latestBaseline().form, 'B');
});

console.log('\nFORM ROTATION\n-------------');

t('the first sitting is form A', () => {
    reset();
    eq(ctx.nextBaselineForm(), 'A');
});

t('each retake advances to an unused form', () => {
    reset();
    eq(ctx.nextBaselineForm(), 'A'); sit('A', () => true);
    eq(ctx.nextBaselineForm(), 'B'); sit('B', () => true);
    eq(ctx.nextBaselineForm(), 'C'); sit('C', () => true);
});

t('a fourth sitting recycles rather than crashing', () => {
    reset();
    ['A','B','C'].forEach(f => sit(f, () => true));
    ok(ctx.BASELINE_FORMS.includes(ctx.nextBaselineForm()), 'must still return a valid form');
});

t('retakes never repeat a question from the previous form', () => {
    const a = ctx.buildBaselineForm(bank, 'A').questions.map(q => q.id);
    const b = ctx.buildBaselineForm(bank, 'B').questions.map(q => q.id);
    const c = ctx.buildBaselineForm(bank, 'C').questions.map(q => q.id);
    eq(a.filter(x => b.includes(x)), [], 'A/B overlap:');
    eq(b.filter(x => c.includes(x)), [], 'B/C overlap:');
    eq(a.filter(x => c.includes(x)), [], 'A/C overlap:');
});

console.log('\nGROWTH\n------');

t('no delta exists from a single sitting', () => {
    reset();
    sit('A', () => true);
    eq(ctx.baselineDelta(), null);
});

t('delta reports the direction each skill moved', () => {
    reset();
    sit('A', () => false);                 // everything Priority
    sit('B', () => true);                  // everything Proficient
    const d = ctx.baselineDelta();
    ok(d, 'delta missing');
    Object.values(d.skills).forEach(v => {
        eq(v.was, 'Priority');
        eq(v.now, 'Proficient');
        ok(v.moved > 0, 'movement should be positive');
    });
});

t('overlapping score ranges are NOT reported as real movement', () => {
    reset();
    // Same performance twice: the ranges must overlap and the flag stay false.
    sit('A', (q, i) => i % 2 === 0);
    sit('B', (q, i) => i % 2 === 0);
    const d = ctx.baselineDelta();
    eq(d.projection.meaningful, false, 'identical performance must not read as growth:');
});

t('a genuinely large gain clears the noise band', () => {
    reset();
    sit('A', () => false);
    sit('B', () => true);
    eq(ctx.baselineDelta().projection.meaningful, true);
});

console.log('\nFOCUS QUEUE HANDOFF\n-------------------');

t('the focus queue is written where the app can read it', () => {
    reset();
    const { profile } = sit('A', () => false);
    ctx.saveFocusQueue(ctx.baselineFocusQueue(profile, null, bank));
    const fq = ctx.getFocusQueue();
    ok(fq, 'focus queue not saved');
    eq(fq.skills.length, 11);
    ok(fq.skills[0].score >= fq.skills[1].score, 'queue is not sorted by priority');
    ok(fq.skills.every(s => s.skill && s.band), 'queue entries incomplete');
});

t('a strong student produces an empty queue, not a fabricated one', () => {
    reset();
    const { profile } = sit('A', () => true);
    ctx.saveFocusQueue(ctx.baselineFocusQueue(profile, null, bank));
    eq(ctx.getFocusQueue().skills.length, 0);
});

console.log('\nEND TO END — screener then probes\n---------------------------------');

t('a mixed run completes both stages and amends one record', () => {
    reset();
    // Strong on Conventions, blank on Expression of Ideas, mixed elsewhere.
    const { items, profile } = sit('A', (q) => {
        if (ctx.SKILL_DOMAIN[q.skill] === 'Std. English Conv.')  return true;
        if (ctx.SKILL_DOMAIN[q.skill] === 'Expression of Ideas') return false;
        return q.skill.charCodeAt(0) % 2 === 0;
    });

    eq(ctx.getBaselines().length, 1, 'screener must be saved immediately:');
    eq(ctx.latestBaseline().stage, 'screener');

    const { probes, gaps } = ctx.buildProbeSet(bank, profile, items.map(i => i.id));
    eq(gaps, [], 'unfillable probe slots:');

    // Conventions skills routed to Hard, EoI skills routed to Easy.
    const tiers = {};
    probes.forEach(p => { tiers[p.skill] = p.difficulty; });
    eq(tiers['Boundaries'], 'Hard');
    eq(tiers['Form, Structure, and Sense'], 'Hard');
    eq(tiers['Rhetorical Synthesis'], 'Easy');
    eq(tiers['Transitions'], 'Easy');

    // Sit the probes: pass the ceiling ones, fail the floor ones.
    const probeItems = probes.map(p => ({
        id: p.id, skill: p.skill, difficulty: p.difficulty, stage: 2,
        probeTier: p.probeTier, chosen: 'A',
        correct: p.probeTier === 'Hard', seconds: 70,
    }));

    const all = items.concat(probeItems);
    const full = ctx.buildBaselineProfile(all);
    ctx.amendLatestBaseline({ stage: 'complete', items: all });

    eq(ctx.getBaselines().length, 1, 'amending must not create a second record:');
    eq(ctx.latestBaseline().stage, 'complete');
    ok(ctx.latestBaseline().amendedAt > 0, 'amendedAt not stamped');

    // Bands resolved in both directions.
    eq(full['Boundaries'].band, 'Secure');
    eq(full['Boundaries'].confidence, 'confirmed');
    eq(full['Rhetorical Synthesis'].band, 'Foundational');
    eq(full['Transitions'].band, 'Foundational');
});

t('probes are never drawn from questions already served', () => {
    reset();
    const { items, profile } = sit('A', () => false);
    const used = items.map(i => i.id);
    const { probes } = ctx.buildProbeSet(bank, profile, used);
    probes.forEach(p => ok(!used.includes(p.id), p.id + ' was reused'));
    // and probes must not collide with each other
    const ids = probes.map(p => p.id);
    eq(ids.length, new Set(ids).size, 'duplicate probe ids');
});

t('amending with no prior record fails safely', () => {
    reset();
    eq(ctx.amendLatestBaseline({ stage: 'complete' }), false);
});

t('corrupt storage degrades to empty rather than throwing', () => {
    reset();
    ctx.localStorage.setItem('psat89_baseline_guest', '{not json');
    eq(ctx.getBaselines(), []);
    eq(ctx.latestBaseline(), null);
    eq(ctx.baselineDelta(), null);
});

console.log('\n' + '='.repeat(46));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(46) + '\n');
process.exit(fail ? 1 : 0);
