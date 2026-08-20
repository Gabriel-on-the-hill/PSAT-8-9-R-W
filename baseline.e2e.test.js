// baseline.e2e.test.js — loads the real page in jsdom and drives a student
// through it. Catches what static checks cannot: a null element, a handler that
// throws, a results panel that renders empty.
//
// Run: node baseline.e2e.test.js
// (JSDOM_PATH=/path/to/jsdom node baseline.e2e.test.js to point at jsdom
//  elsewhere — the repo keeps it one level up.)
//
// NOTE ON ACCESS: baseline.html declares its state with top-level `const`/`let`
// in a classic script. Those create bindings in the global LEXICAL environment,
// which is shared across scripts but is NOT exposed as properties of `window` —
// so `win.questionBank` is undefined even though the page works perfectly.
// Everything here therefore reads page state through win.eval().

const fs = require('fs');
const path = require('path');
const JSDOM_PATH = process.env.JSDOM_PATH
    || path.join(__dirname, '..', 'node_modules', 'jsdom');
const { JSDOM, VirtualConsole } = require(JSDOM_PATH);

let pass = 0, fail = 0;
function t(name, fn) {
    try { fn(); console.log('  ok   ' + name); pass++; }
    catch (e) { console.log('  FAIL ' + name + '\n       ' + e.message); fail++; }
}
function ok(c, m) { if (!c) throw new Error(m || 'expected truthy'); }
function eq(a, b, m) {
    if (JSON.stringify(a) !== JSON.stringify(b))
        throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
}

const pageErrors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => pageErrors.push(e.message));
vc.on('error', (...a) => pageErrors.push(a.join(' ')));

// Inline every local <script src> before parsing. Keeps the test off the
// network and off jsdom's resource loader; the page under test is still the
// real file, just with its own dependencies pasted in.
let pageHtml = fs.readFileSync(path.join(__dirname, 'baseline.html'), 'utf8');
const inlined = [];
pageHtml = pageHtml.replace(
    /<script src="([^"]+?)(?:\?[^"]*)?"><\/script>/g,
    (whole, src) => {
        if (/^https?:/.test(src)) return whole;
        const file = path.join(__dirname, src);
        if (!fs.existsSync(file)) throw new Error('page references a missing file: ' + src);
        inlined.push(src);
        return '<script>' + fs.readFileSync(file, 'utf8') + '</script>';
    });
pageHtml = pageHtml.replace(/<link[^>]*fonts\.googleapis[^>]*>/g, '');

console.log('\nBOOTING PAGE\n------------');
const dom = new JSDOM(pageHtml, {
    runScripts: 'dangerously',
    // A real origin is required or localStorage throws SecurityError on the
    // default opaque one — the page would still degrade safely, but then the
    // persistence assertions below would be testing nothing.
    url: 'http://localhost/baseline.html',
    virtualConsole: vc,
    beforeParse(win) {
        win.confirm = () => true;
        win.alert = (m) => { win.__alerts = (win.__alerts || []).concat(m); };
        win.scrollTo = () => {};
    },
});
const win = dom.window;
const doc = win.document;
const ev  = (expr) => win.eval(expr);

t('page loads all of its own dependencies', () => {
    ['progress.js', 'baseline-spec.js', 'baseline-grade.js', 'baseline-store.js']
        .forEach(f => ok(inlined.includes(f), 'page does not load ' + f));
});
t('page boots with no script errors', () => eq(pageErrors, []));
t('bank assembled in the page', () => eq(ev('questionBank.length'), 464));
t('form built to 22 items', () => eq(ev('Q.length'), 22));
t('form note tells the student which sitting this is', () => {
    const s = doc.getElementById('formNote').textContent;
    ok(/Form A/.test(s) && /first sitting/.test(s), 'got: ' + s);
});

console.log('\nDRIVING THE SCREENER\n--------------------');

t('start reveals the test and hides the intro', () => {
    win.startTest();
    ok(doc.getElementById('intro').classList.contains('hidden'), 'intro still visible');
    ok(!doc.getElementById('test').classList.contains('hidden'), 'test not visible');
});

t('every question renders a stem and at least two options', () => {
    const n = ev('Q.length');
    for (let i = 0; i < n; i++) {
        ev('idx = ' + i); win.render();
        const stem = doc.querySelector('.qtext');
        const opts = doc.querySelectorAll('.opt');
        ok(stem && stem.textContent.trim().length > 0, 'question ' + (i+1) + ' has no stem');
        ok(opts.length >= 2, 'question ' + (i+1) + ' rendered ' + opts.length + ' options');
    }
});

t('the two items of a skill are never adjacent', () => {
    const skills = ev('JSON.stringify(Q.map(q=>q.skill))');
    const arr = JSON.parse(skills);
    for (let i = 1; i < arr.length; i++) {
        ok(arr[i] !== arr[i-1], 'adjacent duplicate skill at ' + i + ': ' + arr[i]);
    }
});

t('all 11 skills are present, twice each', () => {
    const arr = JSON.parse(ev('JSON.stringify(Q.map(q=>q.skill))'));
    const counts = {};
    arr.forEach(s => counts[s] = (counts[s] || 0) + 1);
    eq(Object.keys(counts).length, 11);
    Object.entries(counts).forEach(([s, n]) => eq(n, 2, s + ':'));
});

t('every served item is Medium difficulty', () => {
    const diffs = JSON.parse(ev('JSON.stringify(Q.map(q=>q.difficulty))'));
    diffs.forEach(d => eq(d, 'Medium'));
});

t('selecting an option marks it', () => {
    ev('idx = 0'); win.render();
    const letter = ev('Q[0].options[0].trim()[0]');
    win.choose(letter);
    eq(ev('answers[0]'), letter);
    ok(doc.querySelector('.opt.sel'), 'no option shows as selected');
});

// Answer everything: correct on Conventions, wrong on Expression of Ideas,
// alternating elsewhere — so all three routing paths fire in a single run.
t('a full run of answers is accepted', () => {
    ev(`
      Q.forEach(function(q,i){
        var d = SKILL_DOMAIN[q.skill];
        var correct = d === 'Std. English Conv.'  ? true
                    : d === 'Expression of Ideas' ? false
                    : (i % 2 === 0);
        var wrong = q.options.map(function(o){return o.trim()[0];})
                             .filter(function(l){return l !== q.answer;})[0];
        answers[i] = correct ? q.answer : wrong;
        times[i]   = 55;
      });
    `);
    eq(ev('answers.filter(function(a){return a===null;}).length'), 0);
});

t('finishing the screener renders results without error', () => {
    const before = pageErrors.length;
    win.finishScreener();
    eq(pageErrors.slice(before), [], 'errors during finish:');
    ok(!doc.getElementById('results').classList.contains('hidden'), 'results hidden');
    ok(doc.getElementById('test').classList.contains('hidden'), 'test still visible');
});

console.log('\nRESULTS PANEL\n-------------');
const html = () => doc.getElementById('results').innerHTML;

t('a score RANGE is shown, never a single number', () => {
    const m = doc.querySelector('#results .big').textContent.trim();
    ok(/^\d{3}–\d{3}$/.test(m), 'expected a range, got "' + m + '"');
    const [lo, hi] = m.split('–').map(Number);
    ok(hi > lo && lo >= 120 && hi <= 720, 'range out of bounds: ' + m);
});

t('all 11 skills appear in the results table', () => {
    const text = html();
    JSON.parse(ev('JSON.stringify(BASELINE_SKILLS)'))
        .forEach(s => ok(text.includes(s), 'missing skill: ' + s));
});

t('a ranked plan is rendered', () => {
    ok(doc.querySelectorAll('#results .focus').length > 0, 'no focus items rendered');
    ok(/Start here/.test(html()), 'no plan heading');
});

t('the follow-up is offered with a real count', () => {
    ok(/Optional follow-up/.test(html()), 'no follow-up offer');
    const m = html().match(/Optional follow-up · (\d+) question/);
    ok(m && Number(m[1]) > 0, 'follow-up count missing or zero');
});

t('the screener is persisted the moment it finishes', () => {
    const list = JSON.parse(ev('JSON.stringify(getBaselines())'));
    eq(list.length, 1);
    eq(list[0].stage, 'screener');
    eq(list[0].total, 22);
    ok(list[0].projection.low > 0, 'no projection stored');
    eq(Object.keys(list[0].skills).length, 11);
    ok(list[0].items.every(i => typeof i.seconds === 'number'), 'per-item timing not stored');
});

t('ledger writes are tagged baseline, not practice', () => {
    const ledger = JSON.parse(ev('JSON.stringify(getProgress())'));
    const rows = Object.values(ledger);
    ok(rows.length >= 22, 'only ' + rows.length + ' ledger rows');
    ok(rows.every(r => r.lastSource === 'baseline'),
        'some rows tagged: ' + [...new Set(rows.map(r => r.lastSource))].join(', '));
});

t('the focus queue is handed off to the app', () => {
    const fq = JSON.parse(ev('JSON.stringify(getFocusQueue())'));
    ok(fq && fq.skills.length > 0, 'focus queue empty');
    ok(fq.skills[0].score >= fq.skills[fq.skills.length-1].score, 'queue unsorted');
});

t('conventions routed to a ceiling probe, expression to a floor probe', () => {
    eq(ev('profile["Boundaries"].routedProbe'), 'Hard');
    eq(ev('profile["Rhetorical Synthesis"].routedProbe'), 'Easy');
    eq(ev('profile["Transitions"].routedProbe'), 'Easy');
});

console.log('\nDRIVING THE FOLLOW-UP\n---------------------');

t('the follow-up starts and serves only routed skills at the right tier', () => {
    const before = pageErrors.length;
    win.startProbes();
    eq(pageErrors.slice(before), [], 'errors starting probes:');
    eq(ev('stage'), 2);
    ok(ev('Q.length') > 0, 'no probes served');
    JSON.parse(ev('JSON.stringify(Q.map(q=>q.difficulty))'))
        .forEach(d => ok(['Easy','Hard'].includes(d), 'probe at wrong tier: ' + d));
});

t('probes never reuse a screener question', () => {
    const probeIds  = JSON.parse(ev('JSON.stringify(Q.map(q=>q.id))'));
    const screenIds = JSON.parse(ev('JSON.stringify(screenerItems.map(i=>i.id))'));
    probeIds.forEach(id => ok(!screenIds.includes(id), id + ' reused from screener'));
});

t('finishing the follow-up amends the same record', () => {
    ev(`
      Q.forEach(function(q,i){
        var wrong = q.options.map(function(o){return o.trim()[0];})
                             .filter(function(l){return l !== q.answer;})[0];
        answers[i] = q.probeTier === 'Hard' ? q.answer : wrong;
        times[i]   = 70;
      });
    `);
    const before = pageErrors.length;
    win.finishProbes();
    eq(pageErrors.slice(before), [], 'errors finishing probes:');
    const list = JSON.parse(ev('JSON.stringify(getBaselines())'));
    eq(list.length, 1, 'a second record was created instead of amending:');
    eq(list[0].stage, 'complete');
    ok(list[0].amendedAt > 0, 'amendedAt not stamped');
});

t('bands resolve in both directions after the probes', () => {
    eq(ev('profile["Boundaries"].band'), 'Secure');
    eq(ev('profile["Boundaries"].confidence'), 'confirmed');
    eq(ev('profile["Rhetorical Synthesis"].band'), 'Foundational');
    ok(/Secure/.test(html()) && /Foundational/.test(html()),
        'bands not shown in the results table');
});

t('the follow-up offer disappears once it is done', () => {
    ok(!/Optional follow-up/.test(html()), 'stale follow-up offer still showing');
});

t('review shows every item with its explanation', () => {
    const revs = doc.querySelectorAll('#results .rev');
    ok(revs.length >= 22, 'only ' + revs.length + ' review rows');
    ok(doc.querySelectorAll('#results details.exp').length >= 22, 'explanations missing');
});

t('no script errors across the entire session', () => eq(pageErrors, []));

console.log('\n' + '='.repeat(46));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(46) + '\n');
win.close();
process.exit(fail ? 1 : 0);
