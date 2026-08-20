// baseline-sync.test.js — does the baseline actually report to the tutor sheet?
// Run: node baseline-sync.test.js
//
// The screener was writing to localStorage and nothing else, so a result existed
// only in the browser the student sat it in. This drives the real page with
// fetch stubbed and asserts on what would have gone up the wire.
//
// NOTE: this proves the CLIENT posts. Whether the row lands in the sheet depends
// on the Apps Script at SHEET_SYNC_ENDPOINT handling type/source 'baseline',
// which is outside this repo and cannot be tested from here.

const fs = require('fs');
const path = require('path');
const JSDOM_PATH = process.env.JSDOM_PATH
    || path.join(__dirname, '..', 'node_modules', 'jsdom');
const { JSDOM, VirtualConsole } = require(JSDOM_PATH);

let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + '\n       ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m || 'expected truthy'); };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };

const pageErrors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => pageErrors.push(e.message.split('\n')[0]));

let html = fs.readFileSync(path.join(__dirname, 'baseline.html'), 'utf8');
const inlined = [];
html = html.replace(/<script src="([^"]+?)(?:\?[^"]*)?"><\/script>/g, (whole, src) => {
    if (/^https?:/.test(src)) return '';
    const file = path.join(__dirname, src);
    if (!fs.existsSync(file)) throw new Error('page references a missing file: ' + src);
    inlined.push(src);
    return '<script>' + fs.readFileSync(file, 'utf8').replace(/<\/script/gi, '<\\/script') + '<\/script>';
});
html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g, '');

console.log('\nBOOTING\n-------');
const posts = [];
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost/baseline.html',
    virtualConsole: vc,
    beforeParse(win) {
        win.confirm = () => true;
        win.alert = () => {};
        win.scrollTo = () => {};
        // Capture what the page tries to upload instead of letting it out.
        win.fetch = (url, opts) => {
            let body = null;
            try { body = JSON.parse((opts && opts.body) || 'null'); } catch (e) { body = (opts||{}).body; }
            posts.push({ url, opts, body });
            return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') });
        };
    },
});
const win = dom.window;
const ev  = expr => win.eval(expr);

function waitFor(fn, ms) {
    const end = Date.now() + (ms || 20000);
    return new Promise((res, rej) => {
        (function poll() {
            let v = false; try { v = fn(); } catch (e) { v = false; }
            if (v) return res(true);
            if (Date.now() > end) return rej(new Error('timed out booting'));
            setTimeout(poll, 50);
        })();
    });
}

(async function run() {
    await waitFor(() => ev('typeof questionBank !== "undefined" && questionBank.length') > 400);

    t('the page loads sheet-sync.js at all', () => {
        ok(inlined.includes('sheet-sync.js'),
           'baseline.html does not load sheet-sync.js — it cannot report');
    });
    t('syncSessionToSheet is reachable from the page', () =>
        eq(ev('typeof syncSessionToSheet'), 'function'));
    t('an endpoint is configured', () => {
        ok(ev('typeof SHEET_SYNC_ENDPOINT === "string" && SHEET_SYNC_ENDPOINT.length > 0'),
           'SHEET_SYNC_ENDPOINT is empty — sync is disabled');
    });
    t('page boots clean', () => eq(pageErrors, []));

    t('the screener is gated like every other student page', () => {
        ok(inlined.includes('gate.js'),
           'baseline.html does not load gate.js — it is open to anyone with the URL');
    });

    t('an unauthenticated visitor is stopped', () => {
        ok(win.document.getElementById('__gateInput'),
           'the gate did not mount — the screener rendered without a password');
    });

    console.log('\nSITTING THE SCREENER\n--------------------');
    // Unlock the way a real unlock does, so `psat89_user` is set by the gate
    // rather than by the test reaching around it.
    ev('sessionStorage.setItem("mastery_unlocked","1")');
    ev('sessionStorage.setItem("psat89_user","Luke")');
    ev('sessionStorage.setItem("mastery_role","student")');
    var _ov = win.document.getElementById('__gateOverlay');
    if (_ov) _ov.remove();
    win.startTest();
    // Answer by DOMAIN, not alternately. The two items of a skill sit ~11 apart
    // after spreadBaseline, so an i%2 pattern gives every skill exactly 1/2 —
    // which routes no probes at all and leaves the follow-up with nothing to do.
    // This pattern guarantees all three routing paths fire.
    ev(`
      Q.forEach(function(q,i){
        var d = SKILL_DOMAIN[q.skill];
        var correct = d === 'Std. English Conv.'  ? true      // -> Hard probes
                    : d === 'Expression of Ideas' ? false     // -> Easy probes
                    : (q.skill.charCodeAt(0) % 2 === 0);      // -> mixed
        var wrong = q.options.map(function(o){return o.trim()[0];})
                             .filter(function(l){return l !== q.answer;})[0];
        answers[i] = correct ? q.answer : wrong;
        times[i]   = 50;
      });
    `);
    const before = posts.length;
    win.finishScreener();

    t('finishing the screener posts exactly one row', () => {
        eq(posts.length - before, 1, 'posts fired: ' + (posts.length - before));
    });

    const p1 = posts[posts.length - 1];

    t('it posts to the configured endpoint', () => {
        eq(p1.url, ev('SHEET_SYNC_ENDPOINT'));
        eq((p1.opts || {}).method, 'POST');
    });

    t('the row is attributed to the signed-in student', () =>
        eq(p1.body.student, 'Luke'));

    t('the row is NOT anonymous', () => {
        ok(p1.body.student && p1.body.student !== '' && p1.body.student !== '(unknown)',
           'the sheet would log this baseline against nobody');
    });

    t('the Seconds column the Apps Script reads is populated', () => {
        ok(typeof p1.body.seconds === 'number' && p1.body.seconds > 0,
           'seconds: ' + JSON.stringify(p1.body.seconds));
    });

    t('the row is typed as a baseline, not a practice session', () => {
        eq(p1.body.type, 'baseline', 'the tutor cannot tell this apart from practice:');
        eq(p1.body.mode, 'screener');
    });

    t('score, total and percentage are present', () => {
        eq(p1.body.total, 22);
        ok(p1.body.score > 0 && p1.body.score < 22, 'score: ' + p1.body.score);
        eq(p1.body.pct, Math.round(p1.body.score / 22 * 100));
    });

    t('per-skill stats cover all 11 skills', () => {
        eq(Object.keys(p1.body.skillStats).length, 11);
        Object.values(p1.body.skillStats).forEach(s => eq(s.total, 2));
    });

    t('every question is reported with its timing', () => {
        eq(p1.body.questions.length, 22);
        ok(p1.body.questions.every(q => typeof q.secs === 'number'), 'timings missing');
        ok(p1.body.questions.every(q => q.id && q.skill), 'question rows incomplete');
    });

    console.log('\nTHE BASELINE-SPECIFIC PAYLOAD\n-----------------------------');

    t('the baseline block survives sheet-sync\'s key-by-key rebuild', () => {
        ok(p1.body.baseline, 'the baseline block was dropped in transit');
    });

    t('it carries the form and the sitting number', () => {
        eq(p1.body.baseline.form, 'A');
        eq(p1.body.baseline.sitting, 1);
    });

    t('it carries the projected RANGE, not a single number', () => {
        const b = p1.body.baseline;
        ok(b.projectionLow > 0 && b.projectionHigh > b.projectionLow,
           'projection is not a range: ' + b.projectionLow + '-' + b.projectionHigh);
    });

    t('it carries a band for every skill', () => {
        const bands = p1.body.baseline.bands;
        eq(Object.keys(bands).length, 11);
        Object.entries(bands).forEach(([skill, v]) => {
            ok(v.band, skill + ' has no band');
            ok(v.screener, skill + ' has no screener score');
            ok(v.confidence, skill + ' has no confidence marker');
        });
    });

    t('bands are marked provisional before the follow-up', () => {
        const bands = p1.body.baseline.bands;
        const provisional = Object.values(bands).filter(v => v.confidence === 'provisional');
        ok(provisional.length > 0, 'nothing marked provisional after a screener-only sitting');
    });

    t('it carries the ranked focus queue the tutor should act on', () => {
        ok(Array.isArray(p1.body.baseline.focus), 'no focus list');
        ok(p1.body.baseline.focus.length > 0, 'focus list is empty');
    });

    console.log('\nAFTER THE FOLLOW-UP\n-------------------');
    const beforeProbe = posts.length;
    win.startProbes();
    ev(`
      Q.forEach(function(q,i){
        answers[i] = q.probeTier === 'Hard' ? q.answer
          : q.options.map(function(o){return o.trim()[0];})
                     .filter(function(l){return l !== q.answer;})[0];
        times[i] = 65;
      });
    `);
    win.finishProbes();

    t('the follow-up posts a second row', () =>
        eq(posts.length - beforeProbe, 1));

    const p2 = posts[posts.length - 1];

    t('the second row is marked complete, not screener', () => {
        eq(p2.body.mode, 'complete');
        eq(p2.body.type, 'baseline');
    });

    t('its bands are confirmed rather than provisional', () => {
        const confirmed = Object.values(p2.body.baseline.bands)
            .filter(v => v.confidence === 'confirmed');
        ok(confirmed.length > 0, 'no bands confirmed after the probes');
    });

    t('probe results are reported with their tier', () => {
        const probes = p2.body.questions.filter(q => q.stage === 2);
        ok(probes.length > 0, 'no probe questions in the payload');
        probes.forEach(q => ok(['Easy','Hard'].includes(q.probeTier),
            'probe tier missing: ' + JSON.stringify(q.probeTier)));
    });

    t('the screener row is not overwritten — both rows stand', () => {
        eq(posts.filter(p => p.body && p.body.type === 'baseline').length, 2);
    });

    console.log('\nFAILURE IS SILENT\n-----------------');

    t('a failing upload never costs the student their result', () => {
        // The record is already in localStorage before any network call.
        const saved = JSON.parse(ev('JSON.stringify(getBaselines())'));
        eq(saved.length, 1);
        eq(saved[0].stage, 'complete');
    });

    t('no script errors across the whole run', () => eq(pageErrors, []));

    console.log('\n' + '='.repeat(48));
    console.log(`${pass} passed, ${fail} failed`);
    console.log('='.repeat(48) + '\n');
    win.close();
    process.exit(fail ? 1 : 0);
})().catch(e => {
    console.error('\nHARNESS ERROR: ' + e.message);
    console.error(pageErrors.slice(0, 5).join('\n'));
    process.exit(1);
});
