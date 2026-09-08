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
t('bank assembled in the page', () => eq(ev('questionBank.length'), 683));
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

t('the screener is persisted the moment it finishes', () => {
    const list = JSON.parse(ev('JSON.stringify(getBaselines())'));
    eq(list.length, 1);
    eq(list[0].stage, 'complete');
    eq(list[0].total, 22);
    ok(list[0].projection.low > 0, 'no projection stored');
    eq(Object.keys(list[0].skills).length, 11);
    ok(list[0].items.every(i => typeof i.seconds === 'number'), 'per-item timing not stored');
});

// This assertion used to read "ledger writes are tagged baseline, not practice"
// and it guarded the wrong thing. Tagging the writes was never the problem; the
// writes were. A ledger row makes a question "seen", a miss lands it on rung
// zero of the review ladder — due in one day — and dueForReview() draws from
// the whole bank on nothing but "seen and overdue". So a baseline, which is
// designed to produce misses across all eleven skills, seeded the next morning's
// homework with review questions from skills nobody had taught. AGENTS.md:
// "a 'review' block that hands a student an untaught skill cold is not review."
t('the baseline never touches the mastery ledger', () => {
    const ledger = JSON.parse(ev('JSON.stringify(getProgress())'));
    const rows = Object.entries(ledger);
    eq(rows.length, 0,
        'the baseline wrote ' + rows.length + ' ledger rows: '
        + rows.slice(0, 3).map(([id]) => id).join(', '));
});

t('and so nothing it served can be drawn for review the next day', () => {
    // The end-to-end statement of the rule above, made against the real draw
    // rather than against the ledger it reads. If someone re-adds the write,
    // this is the test that says what it costs.
    const due = JSON.parse(ev(
        'JSON.stringify((dueForReview(questionBank, 50, {})||[]).map(function(q){return q.id;}))'));
    eq(due, [], 'the baseline made ' + due.length + ' questions due for review');
});

t('the focus queue is handed off to the app', () => {
    const fq = JSON.parse(ev('JSON.stringify(getFocusQueue())'));
    ok(fq && fq.skills.length > 0, 'focus queue empty');
    ok(fq.skills[0].score >= fq.skills[fq.skills.length-1].score, 'queue unsorted');
});

t('the bands read straight off the screener', () => {
    eq(ev('profile["Boundaries"].band'), 'Proficient', '2/2:');
    eq(ev('profile["Rhetorical Synthesis"].band'), 'Priority', '0/2:');
    eq(ev('profile["Boundaries"].confidence'), 'measured');
});

console.log('\nTHE SITTING ENDS AT SUBMIT\n' + '-'.repeat(26));

// The screener used to offer a follow-up here — a Hard item at every 2/2 skill
// and an Easy one at every 0/2, served after the student had already finished.
// It is removed. Once a student submits, that is the whole sitting.
t('no follow-up is offered', () => {
    const html = doc.getElementById('results').innerHTML;
    ok(!/follow-up/i.test(html), 'the results screen still offers a follow-up');
});

t('and there is nothing left to drive it with', () => {
    eq(ev('typeof startProbes'), 'undefined', 'startProbes still exists');
    eq(ev('typeof finishProbes'), 'undefined', 'finishProbes still exists');
});

t('the record is complete the moment it is written', () => {
    const list = JSON.parse(ev('JSON.stringify(getBaselines())'));
    eq(list.length, 1);
    eq(list[0].stage, 'complete');
    eq(list[0].items.length, 22, 'the sitting is 22 questions and no more:');
});

t('the ledger is still untouched', () => {
    eq(Object.keys(JSON.parse(ev('JSON.stringify(getProgress())'))).length, 0);
});

t('review shows every item with its explanation', () => {
    const revs = doc.querySelectorAll('#results .rev');
    ok(revs.length >= 22, 'only ' + revs.length + ' review rows');
    ok(doc.querySelectorAll('#results details.exp').length >= 22, 'explanations missing');
});

// The review panel used to print the skill, two letters and the rationale — and
// nothing else. No stem, no passage, no options. "Your answer: B · Correct: C"
// is not something a student can work through, and the rationale referred to a
// text that was no longer on the page. AGENTS.md: "Every question survives the
// set — passage, her answer, the right answer, the explanation — re-readable."
// The baseline is the sitting most likely to be reviewed with a tutor, and it
// was the one sitting you could not review.
t('the review carries the whole question, not just the letters', () => {
    const revs = [...doc.querySelectorAll('#results .rev')];
    ok(revs.length >= 22, 'only ' + revs.length + ' review rows');
    // textContent walks a subtree that now holds a whole passage, so compute it
    // once per row rather than once per row per lookup.
    const revText = revs.map(r => r.textContent);

    const served = JSON.parse(ev(
        'JSON.stringify(screenerItems.map(function(i){'
        + 'var q=questionBank.find(function(x){return x.id===i.id;});'
        + 'return {stem:q.question, n:(q.options||[]).length};}))'));

    served.forEach(s => {
        const at = revText.findIndex(t => t.indexOf(s.stem.slice(0, 40)) !== -1);
        ok(at !== -1, 'no review row carries the stem: ' + s.stem.slice(0, 60));
        const opts = revs[at].querySelectorAll('.opt');
        eq(opts.length, s.n, 'review row shows ' + opts.length
            + ' of ' + s.n + ' options for: ' + s.stem.slice(0, 40));
    });
});

t('the review marks the right answer and the one that was chosen', () => {
    const html = doc.getElementById('results').innerHTML;
    ok(/correct/i.test(html), 'nothing in the review is marked correct');
    ok(/you chose this/i.test(html),
       'a wrong answer is never pointed at, so the student cannot see what they did');
});

t('misses come first', () => {
    // Same rule the runner follows: the review that matters is the one on what
    // went wrong, and a student who stops scrolling should have met those first.
    const tags = [...doc.querySelectorAll('#results .rev .tag')].map(e => e.textContent.trim());
    const firstCorrect = tags.indexOf('Correct');
    const lastMiss     = tags.lastIndexOf('Review');
    ok(firstCorrect === -1 || lastMiss === -1 || lastMiss < firstCorrect,
       'correct items are mixed in above misses: ' + tags.join(','));
});

t('no script errors across the entire session', () => eq(pageErrors, []));

console.log('\n' + '='.repeat(46));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(46) + '\n');
win.close();
process.exit(fail ? 1 : 0);
