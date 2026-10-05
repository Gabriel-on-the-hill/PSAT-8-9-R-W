// ─────────────────────────────────────────────────────────────────
// exposure.test.js — a question he has MET is not a question he has never seen.
//
//   node exposure.test.js        (sister copy: MasteryApp/exposure.test.js)
//
// Needs no jsdom: progress.js runs in a vm with an in-memory Storage.
//
// The ledger (psat89_progress_<student>) does two jobs: a row makes a question
// SEEN, and a row puts it on the review ladder. The baseline and the class route
// stay out of the ledger on purpose — the baseline misses untaught skills by
// design, and class answers earn no mastery credit. The side effect was that
// everything met there had no row, so every draw served it as unseen: a homework
// day handed out a baseline question as "new", homework could spend a question
// kept back for class, and never-seen accuracy counted items already answered.
//
// The exposure record (psat89_seen_<student>) fixes that without touching the
// ledger. This suite holds the lines that make it safe:
//   1. exposure never writes the ledger and never feeds the review ladder;
//   2. prioritizePool puts met-elsewhere items AFTER the truly unseen ones and
//      ahead of misses and resting items, in both orders;
//   3. history is filled in from baseline records and class routes already in
//      the browser — once, additively, per student;
//   4. dueForReview returns a class MISS only when the plan opts in, and a
//      baseline miss never;
//   5. an item met under an alias id counts for its canonical question.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? ' — ' + d : '')); } };
const eq = (n, a, b) => ok(n, JSON.stringify(a) === JSON.stringify(b), 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));

function storage() {
    const m = new Map();
    return {
        getItem: k => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: k => m.delete(k),
        key: i => [...m.keys()][i] ?? null,
        get length() { return m.size; },
        _map: m,
    };
}

const BANK = [
    { id: 'u1', skill: 'S', difficulty: 'Medium' },
    { id: 'u2', skill: 'S', difficulty: 'Medium' },
    { id: 'p1', skill: 'S', difficulty: 'Medium', difficultyStatus: 'provisional' },
    { id: 'bl', skill: 'S', difficulty: 'Medium' },          // met in the baseline
    { id: 'cl', skill: 'S', difficulty: 'Medium' },          // met in a class route
    { id: 'al', skill: 'S', difficulty: 'Medium', altIds: ['al-old'] }, // met under an alias
    { id: 'mw', skill: 'S', difficulty: 'Medium' },          // homework miss (ledger)
    { id: 'rs', skill: 'S', difficulty: 'Medium' },          // homework correct (ledger)
];

function load(student) {
    const ctx = { console, Date, JSON, Math, Object, Array, Number, String, isFinite, Infinity };
    ctx.localStorage = storage();
    ctx.sessionStorage = storage();
    ctx.sessionStorage.setItem('psat89_user', student || 'student-a');
    ctx.window = ctx;
    ctx.questionBank = BANK;
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'progress.js'), 'utf8'), ctx);
    return ctx;
}
const HOUR = 3_600_000, DAY = 86_400_000;

console.log('\n1 · Exposure is not the ledger');
{
    const c = load();
    c.recordExposure('cl', 'class', false);
    c.recordExposure('bl', 'baseline', false);
    eq('no ledger row is created', Object.keys(c.getProgress()), []);
    ok('the exposure record holds both', !!c.getExposure().cl && !!c.getExposure().bl);
    eq('first meeting per source is kept', c.getExposure().cl.by.class.result, 'wrong');
    c.recordExposure('cl', 'class', true);
    eq('a later class answer does not overwrite the first', c.getExposure().cl.by.class.result, 'wrong');
    eq('dueForReview ignores exposure by default', c.dueForReview(BANK, 5, {}).map(q => q.id), []);
    ok('stored under its own key', c.localStorage.getItem('psat89_seen_student-a') !== null && c.localStorage.getItem('psat89_progress_student-a') === null);
}

console.log('\n2 · The draw serves never-met material first');
{
    const c = load();
    c.recordAnswer('mw', false, 'homework');
    c.recordAnswer('rs', true, 'homework');
    c.recordExposure('bl', 'baseline', false);
    c.recordExposure('cl', 'class', true);
    c.recordExposure('al-old', 'class', true);
    for (let t = 0; t < 20; t++) {
        const ids = c.prioritizePool(BANK).map(q => q.id);
        const pos = id => ids.indexOf(id);
        const met = ['bl', 'cl', 'al'].map(pos), fresh = ['u1', 'u2', 'p1'].map(pos);
        if (!(Math.max(...fresh) < Math.min(...met))) { ok('unseen before met-elsewhere', false, ids.join(',')); break; }
        if (!(Math.max(...met) < pos('mw') && pos('mw') < pos('rs'))) { ok('met-elsewhere before misses before resting', false, ids.join(',')); break; }
        if (t === 19) { ok('unseen before met-elsewhere (20 shuffles)', true); ok('met-elsewhere before misses before resting (20 shuffles)', true); }
    }
    ok('official unseen still lead provisional', (() => { const ids = c.prioritizePool(BANK).map(q => q.id); return ids.indexOf('p1') > Math.max(ids.indexOf('u1'), ids.indexOf('u2')); })());
    const mf = c.prioritizePool(BANK, { missesFirst: true }).map(q => q.id);
    ok('missesFirst: misses, then unseen, then met-elsewhere, then resting',
        mf[0] === 'mw' && mf.indexOf('p1') < Math.min(mf.indexOf('bl'), mf.indexOf('cl'), mf.indexOf('al')) && mf[mf.length - 1] === 'rs', mf.join(','));
    eq('the whole pool is still served', c.prioritizePool(BANK).length, BANK.length);
}

console.log('\n3 · History is filled in from what the browser already holds');
{
    const c = load('student-a');
    c.localStorage.setItem('psat89_baseline_student-a', JSON.stringify([{ form: 'A', takenAt: 1000, items: [
        { id: 'bl', chosen: 'A', correct: false }, { id: 'u2', chosen: '', correct: false }] }]));
    // A structured class route stores answers BY POSITION; sets.js maps them to bank ids.
    c.window.CHALLENGE_SETS = { 'student-a': [{ setId: 'route-1', learningPath: {
        steps: [{ bankId: 'cl' }, { bankId: 'u1' }], checks: [{ bankId: 'al-old' }],
        exitChoices: [{ bankId: 'mw' }, { bankId: 'rs' }] } }] };
    BANK.find(q => q.id === 'cl').answer = 'B';
    c.localStorage.setItem('psat89_classroute_student-a_route-1', JSON.stringify({
        lesson: { index: 1, reasons: ['r'], answers: [0] },          // cl: chose A, key B → wrong; u1 unanswered
        gate: { index: 0, reasons: [], answers: [] },
        exit: { ids: ['rs'], index: 0, reasons: [], answers: [2] } }));
    c.localStorage.setItem('psat89_classroute_student-b_route-1', JSON.stringify({ lesson: { answers: [1, 1] } }));
    const e = c.getExposure();
    eq('baseline answer → baseline/wrong', e.bl && e.bl.by.baseline.result, 'wrong');
    eq('baseline blank → seen', e.u2 && e.u2.by.baseline.result, 'seen');
    eq('class answer by position → class/wrong (bank loaded)', e.cl && e.cl.by.class.result, 'wrong');
    ok('an unanswered step is not recorded', !(e.u1 && e.u1.by.class));
    ok('an exit answer resolves through its chosen id', !!(e.rs && e.rs.by.class));
    ok('a check never answered is not recorded', !e.al);
    ok("another student's route is not read", !(e.u1 && e.u1.by.class));
    eq('no ledger row from the backfill', Object.keys(c.getProgress()), []);
    const before = c.localStorage.getItem('psat89_seen_student-a');
    c.getExposure(); c.getExposure();
    eq('repeat reads change nothing', c.localStorage.getItem('psat89_seen_student-a'), before);
    const c2 = load('student-a');
    c2.localStorage._map.set('psat89_seen_student-a', before);
    c2.localStorage.setItem('psat89_baseline_student-a', c.localStorage.getItem('psat89_baseline_student-a'));
    eq('a fresh page re-syncing the same history adds nothing', JSON.stringify(c2.getExposure()), before);
}

console.log('\n3b · A page without the bank notes "seen"; a page with it upgrades');
{
    BANK.find(q => q.id === 'cl').answer = 'B';   // position 0 is A: a miss
    const route = JSON.stringify({ lesson: { answers: [0] } });
    const sets = { 'student-a': [{ setId: 'r2', learningPath: { steps: [{ bankId: 'cl' }], checks: [], exitChoices: [] } }] };
    const c = load('student-a');
    c.questionBank = undefined;
    c.window.CHALLENGE_SETS = sets;
    c.localStorage.setItem('psat89_classroute_student-a_r2', route);
    eq('no bank: answered but noted as seen', c.getExposure().cl && c.getExposure().cl.by.class.result, 'seen');
    const stored = c.localStorage.getItem('psat89_seen_student-a');
    const c2 = load('student-a');
    c2.window.CHALLENGE_SETS = sets;
    c2.localStorage.setItem('psat89_classroute_student-a_r2', route);
    c2.localStorage.setItem('psat89_seen_student-a', stored);
    eq('bank loaded later: upgraded to wrong', c2.getExposure().cl.by.class.result, 'wrong');
    const c3 = load('student-a');
    c3.localStorage.setItem('psat89_classroute_student-a_r2', route);
    ok('no sets.js on the page: the route is skipped, not misread', !c3.getExposure().cl);
}

console.log('\n4 · Class misses come back only when the plan asks');
{
    const c = load();
    const realNow = Date.now;
    c.recordExposure('cl', 'class', false);
    c.recordExposure('bl', 'baseline', false);
    c.recordExposure('u1', 'class', true);
    eq('within the cooldown: not due', c.dueForReview(BANK, 5, {}, { classMisses: true }).map(q => q.id), []);
    c.Date.now = () => realNow() + 21 * HOUR;
    try {
        eq('after the cooldown, opted in: the class miss only', c.dueForReview(BANK, 5, {}, { classMisses: true }).map(q => q.id), ['cl']);
        eq('not opted in: nothing', c.dueForReview(BANK, 5, {}).map(q => q.id), []);
        eq('excludeIds still applies', c.dueForReview(BANK, 5, { cl: true }, { classMisses: true }).map(q => q.id), []);
        c.recordAnswer('cl', true, 'homework');
        eq('once answered in homework, the ledger governs (1-day rung, not due yet)', c.dueForReview(BANK, 5, {}, { classMisses: true }).map(q => q.id), []);
    } finally { c.Date.now = realNow; }
}

console.log('\n5 · Per student');
{
    const c = load('student-a');
    c.recordExposure('u1', 'class', true);
    c.sessionStorage.setItem('psat89_user', 'student-b');
    ok("student-b does not inherit student-a's exposure", !c.getExposure().u1);
}

console.log('\n6 · Wiring');
{
    const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
    ok('the class route records exposure on commit', /recordExposure\(q\.bankId\|\|q\.id,'class'/.test(read('challenge/structured-class.js')));
    ok('the baseline records exposure, and still no ledger write', /recordExposure\(i\.id, 'baseline'/.test(read('baseline.html')) && !/recordAnswer\(/.test(read('baseline.html')));
    ok('homework passes the plan opt-in to dueForReview', /reviewClassMisses/.test(read('homework-run.html')) && /dueForReview\(QB, reviewN, _inSet, _reviewOpts\)/.test(read('homework-run.html')));
}

console.log('\n' + '─'.repeat(64));
if (fail) { console.log(`${fail} FAILED, ${pass} passed`); process.exit(1); }
console.log(`ALL ${pass} ASSERTIONS PASSED`);
