// baseline-recover.test.js — can a baseline sat before the sync went live still
// be got into the sheet? Run: node baseline-recover.test.js
//
// The record is written to localStorage before any network call, so it survives
// a failed or absent upload. This proves the recovery page finds it, attributes
// it correctly, and posts a row identical to the one that would have gone up at
// the time.
//
// The awkward case is the one that actually happened: the screener was ungated
// until 20 Aug 2026, so a student who opened it directly sat it as "guest" and
// the record is filed under psat89_baseline_guest.

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

// A saved record, shaped exactly as baseline.html writes one.
const REC = {
    takenAt: 1755640000000,
    form: 'A',
    stage: 'screener',
    correct: 14,
    total: 22,
    projection: { low: 480, high: 540, accuracy: 64, domains: {}, caveat: 'x' },
    skills: {
        'Inferences':   { band: 'Priority',   confidence: 'provisional',
                          screenCorrect: 0, screenTotal: 2, routedProbe: 'Easy' },
        'Boundaries':   { band: 'Proficient', confidence: 'provisional',
                          screenCorrect: 2, screenTotal: 2, routedProbe: 'Hard' },
        'Transitions':  { band: 'Developing', confidence: 'confirmed',
                          screenCorrect: 1, screenTotal: 2, routedProbe: null },
    },
    items: [
        { id: 'a1', skill: 'Inferences',  difficulty: 'Medium', stage: 1, chosen: 'B', correct: false, seconds: 40 },
        { id: 'a2', skill: 'Inferences',  difficulty: 'Medium', stage: 1, chosen: 'C', correct: false, seconds: 55 },
        { id: 'b1', skill: 'Boundaries',  difficulty: 'Medium', stage: 1, chosen: 'A', correct: true,  seconds: 30 },
        { id: 'b2', skill: 'Boundaries',  difficulty: 'Medium', stage: 1, chosen: 'D', correct: true,  seconds: 25 },
        { id: 'c1', skill: 'Transitions', difficulty: 'Medium', stage: 1, chosen: 'A', correct: true,  seconds: 35 },
        { id: 'c2', skill: 'Transitions', difficulty: 'Medium', stage: 1, chosen: 'B', correct: false, seconds: 45 },
    ],
    version: 2, savedAt: 1755640001000,
};

const pageErrors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => pageErrors.push(e.message.split('\n')[0]));

let html = fs.readFileSync(path.join(__dirname, 'baseline-recover.html'), 'utf8');
const inlined = [];
html = html.replace(/<script src="([^"]+?)(?:\?[^"]*)?"><\/script>/g, (whole, src) => {
    if (/^https?:/.test(src)) return '';
    const file = path.join(__dirname, src);
    if (!fs.existsSync(file)) throw new Error('page references a missing file: ' + src);
    inlined.push(src);
    return '<script>' + fs.readFileSync(file, 'utf8').replace(/<\/script/gi, '<\\/script') + '<\/script>';
});
html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g, '');

const posts = [];
console.log('\nBOOTING WITH A GUEST-FILED RECORD\n' + '-'.repeat(33));
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost/baseline-recover.html',
    virtualConsole: vc,
    beforeParse(win) {
        win.alert = () => {}; win.confirm = () => true; win.scrollTo = () => {};
        win.fetch = (url, opts) => {
            let body = null;
            try { body = JSON.parse((opts && opts.body) || 'null'); } catch (e) {}
            posts.push({ url, body });
            return Promise.resolve({ ok: true, status: 200 });
        };
        win.URL.createObjectURL = () => 'blob:stub';
        win.URL.revokeObjectURL = () => {};
        // The record was sat before the gate existed, so it is under "guest".
        win.localStorage.setItem('psat89_baseline_guest', JSON.stringify([REC]));
        win.sessionStorage.setItem('mastery_unlocked', '1');
        win.sessionStorage.setItem('psat89_user', 'Gabe');
        win.sessionStorage.setItem('mastery_role', 'student');
    },
});
const win = dom.window;
const doc = win.document;
const ev  = e => win.eval(e);
const $   = id => doc.getElementById(id);

function waitFor(fn, ms) {
    const end = Date.now() + (ms || 15000);
    return new Promise((res, rej) => {
        (function poll() {
            let v = false; try { v = fn(); } catch (e) { v = false; }
            if (v) return res(true);
            if (Date.now() > end) return rej(new Error('timed out booting'));
            setTimeout(poll, 40);
        })();
    });
}

(async function run() {
    await waitFor(() => ev('typeof findAllBaselines') === 'function');
    ev('render()');

    t('the page boots clean', () => eq(pageErrors, []));
    t('it is gated like every other page', () => ok(inlined.includes('gate.js')));

    t('it finds a record filed under guest', () => {
        const found = JSON.parse(ev('JSON.stringify(findAllBaselines())'));
        eq(found.length, 1);
        eq(found[0].who, 'guest');
        eq(found[0].list.length, 1);
    });

    t('it shows what the sitting actually contained', () => {
        const text = $('out').textContent;
        ok(/Form A/.test(text), 'form not shown');
        ok(/3\/6 correct/.test(text), 'score not shown: ' + text.slice(0, 200));
        ok(/480–540/.test(text), 'projected range not shown');
    });

    t('it warns that a guest record is attributed to nobody', () => {
        ok(/guest/i.test($('out').textContent), 'no mention of guest');
        ok(doc.querySelector('.warn'), 'no warning shown');
    });

    t('the name box starts empty for a guest record', () => {
        ok($('name-0-0'), 'no name field');
        eq($('name-0-0').value, '', 'a guest record must not be silently attributed');
    });

    console.log('\nREFUSING TO SEND AN UNATTRIBUTED ROW\n' + '-'.repeat(36));

    t('sending with no name posts nothing', () => {
        $('send-0-0').dispatchEvent(new win.Event('click'));
        eq(posts.length, 0, 'an anonymous row was posted anyway');
        ok(/name first/i.test($('msg-0-0').textContent), 'no explanation given');
    });

    console.log('\nBACKFILLING THE ROW\n' + '-'.repeat(19));

    t('naming the student and sending posts exactly one row', () => {
        $('name-0-0').value = 'Luke';
        $('send-0-0').dispatchEvent(new win.Event('click'));
        eq(posts.length, 1);
    });

    const p = posts[0];

    t('it goes to the configured endpoint', () => eq(p.url, ev('SHEET_SYNC_ENDPOINT')));

    t('it is attributed to the student, not to guest or the signed-in user', () => {
        eq(p.body.student, 'Luke');
    });

    t('it is typed as a baseline', () => {
        eq(p.body.type, 'baseline');
        eq(p.body.mode, 'screener');
    });

    t('the ORIGINAL sitting date is preserved, not today', () => {
        eq(p.body.date, new Date(REC.takenAt).toISOString());
    });

    t('the score is recomputed from the stored items', () => {
        eq(p.body.score, 3);
        eq(p.body.total, 6);
        eq(p.body.pct, 50);
    });

    t('the projected range survives', () => {
        eq(p.body.baseline.projectionLow, 480);
        eq(p.body.baseline.projectionHigh, 540);
    });

    t('every band survives, with its confidence', () => {
        const b = p.body.baseline.bands;
        eq(Object.keys(b).length, 3);
        eq(b['Inferences'].band, 'Priority');
        eq(b['Inferences'].screener, '0/2');
        eq(b['Boundaries'].confidence, 'provisional');
        eq(b['Transitions'].band, 'Developing');
    });

    t('per-question detail survives', () => {
        eq(p.body.questions.length, 6);
        ok(p.body.questions.every(q => q.id && typeof q.secs === 'number'));
    });

    t('the Seconds column is populated', () => eq(p.body.seconds, 230));

    t('the row is marked as a backfill, not mistaken for a live sitting', () => {
        eq(p.body.recovered, true);
    });

    t('the button disables so it cannot be double-posted', () => {
        $('send-0-0').dispatchEvent(new win.Event('click'));
        eq(posts.length, 1, 'the row went up twice');
    });

    console.log('\nIT MATCHES WHAT A LIVE SITTING WOULD HAVE SENT\n' + '-'.repeat(45));

    t('the payload builder is shared with baseline.html', () => {
        const live = JSON.parse(ev('JSON.stringify(baselineSheetPayload('
            + JSON.stringify(REC) + ', "Luke"))'));
        // `recovered` is the only field the recovery page adds.
        const sent = Object.assign({}, p.body);
        delete sent.recovered;
        // sheet-sync fills a couple of defaults the raw builder leaves out, and
        // renames one: the builder's `source` is what sheet-sync posts as
        // `type`, asserted separately above. Comparing it here only asserts
        // that the rename did not happen.
        ['assignmentId', 'blurCount'].forEach(k => delete sent[k]);
        delete live.source;
        Object.keys(live).forEach(k => {
            eq(sent[k], live[k], 'field "' + k + '" differs from a live row:');
        });
    });

    console.log('\nAN EMPTY DEVICE SAYS SO PLAINLY\n' + '-'.repeat(31));

    t('a browser with no baseline reports nothing found', () => {
        ev('localStorage.removeItem("psat89_baseline_guest")');
        ev('render()');
        ok(/No baseline found/i.test($('out').textContent),
           'an empty device did not say so: ' + $('out').textContent.slice(0, 120));
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
