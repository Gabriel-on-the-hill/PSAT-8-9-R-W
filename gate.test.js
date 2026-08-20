// gate.test.js — run: node gate.test.js
//
// Two things are checked, and the second is the one that matters:
//   1. Every password opens the app as the right person.
//   2. NO student password opens a tutor page.
//
// (2) is a regression guard with history. tutor-dashboard.html once loaded the
// same gate as the app, so any student's own password opened a page showing
// every student's accuracy, retention, weakest skills and tab-switch counts.
// Adding a password is exactly the moment that could come back, so the check
// runs against every password in the file rather than a sampled one.
//
// NOTE ON INLINING: gate.js's header comment contains a literal </script> in
// its usage example. Harmless when the browser loads it via src, fatal when
// pasted into an inline <script> — the HTML parser ends the block there and
// silently parses the rest of the gate as markup, which mounts a half-built
// overlay whose handlers never attach. The inliner below escapes it.

const fs = require('fs');
const path = require('path');
const nodecrypto = require('crypto');
const JSDOM_PATH = process.env.JSDOM_PATH
    || path.join(__dirname, '..', 'node_modules', 'jsdom');
const { JSDOM, VirtualConsole } = require(JSDOM_PATH);

let pass = 0, fail = 0;
const t = (n, f) => { try { f(); console.log('  ok   ' + n); pass++; }
                      catch (e) { console.log('  FAIL ' + n + '\n       ' + e.message); fail++; } };
const ok = (c, m) => { if (!c) throw new Error(m || 'expected truthy'); };
const eq = (a, b, m) => { if (a !== b)
    throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };

const gate = fs.readFileSync(path.join(__dirname, 'gate.js'), 'utf8');
const sha  = s => nodecrypto.createHash('sha256').update(s).digest('hex');

// Read the tables out of the shipped file rather than a copy of them.
function table(name) {
    const body = gate.split(name + ' = {')[1].split('};')[0];
    const o = {};
    [...body.matchAll(/'([0-9a-f]{64})':\s*'([^']+)'/g)].forEach(m => o[m[1]] = m[2]);
    return o;
}
const STUDENTS = table('ACCEPTED_HASHES');
const TUTORS   = table('TUTOR_HASHES');

// Every student password the app ships with. Add new ones here too.
const STUDENT_PASSWORDS = [
    ['gabe',  'Gabe'],
    ['maysa', 'Maysa'],
    ['faith', 'Faith'],
    ['luke',  'Luke'],
];

console.log('\nHASH TABLE\n----------');

t('every listed password hashes to a registered student', () => {
    STUDENT_PASSWORDS.forEach(([pwd, label]) =>
        eq(STUDENTS[sha(pwd)], label, '"' + pwd + '":'));
});

t('the table holds no unaccounted-for entries', () => {
    eq(Object.keys(STUDENTS).length, STUDENT_PASSWORDS.length,
        'student count (a hash nobody knows the password to is dead weight):');
});

t('no student password is also a tutor password', () => {
    STUDENT_PASSWORDS.forEach(([pwd]) =>
        eq(TUTORS[sha(pwd)], undefined, '"' + pwd + '" is in TUTOR_HASHES:'));
});

t('no hash collides with another', () => {
    const all = Object.keys(STUDENTS).concat(Object.keys(TUTORS));
    eq(all.length, new Set(all).size, 'duplicate hash:');
});

t('no display label is duplicated', () => {
    // Labels key sessionStorage, so two people sharing one label would share
    // one progress ledger and one baseline record.
    const l = Object.values(STUDENTS).concat(Object.values(TUTORS));
    eq(l.length, new Set(l).size, 'duplicate label:');
});

t('labels are Title-Cased first names, per house convention', () => {
    Object.values(STUDENTS).forEach(l =>
        ok(/^[A-Z][a-z]+$/.test(l), 'bad label: ' + l));
});

t('the header comment lists every student password', () => {
    STUDENT_PASSWORDS.forEach(([pwd]) =>
        ok(new RegExp('"' + pwd + '"').test(gate), pwd + ' missing from header comment'));
});

// ── driving the real pages ────────────────────────────────────────
function boot(file) {
    const vc = new VirtualConsole();
    const errs = [];
    vc.on('jsdomError', e => errs.push(e.message.split('\n')[0]));

    let html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    html = html.replace(/<script src="([^"]+?)(?:\?[^"]*)?"><\/script>/g, (whole, src) => {
        if (/^https?:/.test(src)) return '';        // no network in a test
        if (/^data-/.test(src))   return '';        // the banks are irrelevant here
        try {
            const js = fs.readFileSync(path.join(__dirname, src), 'utf8')
                         .replace(/<\/script/gi, '<\\/script');
            return '<script>' + js + '<\/script>';
        } catch (e) { return ''; }
    });

    const dom = new JSDOM(html, {
        runScripts: 'dangerously',
        url: 'http://localhost/' + file,           // a real origin, or sessionStorage throws
        virtualConsole: vc,
        beforeParse(w) { w.scrollTo = () => {}; w.alert = () => {}; w.confirm = () => true; },
    });
    const w = dom.window;
    // This jsdom build ships no crypto.subtle; the gate needs SHA-256.
    Object.defineProperty(w.crypto, 'subtle', { configurable: true, value: {
        digest: async (alg, buf) => nodecrypto.createHash('sha256')
            .update(Buffer.from(buf)).digest().buffer } });
    w.__errs = errs;

    return new Promise(res => {
        const go = () => setTimeout(() => res(w), 60);
        if (w.document.readyState !== 'loading') go();
        else w.document.addEventListener('DOMContentLoaded', go);
    });
}

const locked = w => !!w.document.getElementById('__gateInput');

async function tryPwd(w, pwd) {
    const inp = w.document.getElementById('__gateInput');
    const btn = w.document.getElementById('__gateBtn');
    ok(inp && btn, 'the gate never mounted on this page');
    inp.value = pwd;
    btn.dispatchEvent(new w.Event('click'));
    await new Promise(r => setTimeout(r, 150));
    return !locked(w);
}

(async () => {

console.log('\nSTUDENT PAGE (index.html)\n-------------------------');

{
    const w = await boot('index.html');
    t('the page is gated before any password is entered', () => {
        ok(locked(w), 'index.html rendered without asking for a password');
        eq(w.__errs.length, 0, 'script errors: ' + w.__errs.join(' | '));
    });
    w.close();
}

for (const [pwd, label] of STUDENT_PASSWORDS) {
    const w = await boot('index.html');
    const unlocked = await tryPwd(w, pwd);
    t('"' + pwd + '" unlocks the app as ' + label, () => {
        ok(unlocked, 'still locked');
        eq(w.sessionStorage.getItem('psat89_user'), label);
        eq(w.sessionStorage.getItem('mastery_role'), 'student');
        eq(w.sessionStorage.getItem('mastery_unlocked'), '1');
    });
    w.close();
}

{
    const w = await boot('index.html');
    const unlocked = await tryPwd(w, 'LUKE');
    t('passwords are case-insensitive', () => {
        ok(unlocked, 'uppercase rejected');
        eq(w.sessionStorage.getItem('psat89_user'), 'Luke');
    });
    w.close();
}

{
    const w = await boot('index.html');
    const unlocked = await tryPwd(w, '  luke  ');
    t('surrounding whitespace is tolerated', () => ok(unlocked, 'padded input rejected'));
    w.close();
}

{
    const w = await boot('index.html');
    const unlocked = await tryPwd(w, 'lukas');
    t('a near-miss is rejected', () => {
        ok(!unlocked, 'a wrong password unlocked the app');
        eq(w.document.getElementById('__gateError').textContent, 'Incorrect password');
        eq(w.sessionStorage.getItem('psat89_user'), null);
    });
    w.close();
}

console.log('\nTUTOR PAGE MUST STAY SHUT (tutor-dashboard.html)\n-----------------------------------------------');

for (const [pwd] of STUDENT_PASSWORDS) {
    const w = await boot('tutor-dashboard.html');
    const unlocked = await tryPwd(w, pwd);
    t('"' + pwd + '" does NOT open the tutor dashboard', () => {
        ok(!unlocked, pwd + " opened a page showing every student's record");
        eq(w.sessionStorage.getItem('mastery_role'), null);
    });
    w.close();
}

console.log('\n' + '='.repeat(48));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(48) + '\n');
process.exit(fail ? 1 : 0);

})().catch(e => { console.error('\nHARNESS ERROR: ' + e.message); process.exit(1); });
