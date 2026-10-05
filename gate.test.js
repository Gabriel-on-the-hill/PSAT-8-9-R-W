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
// Every boot gets a lease transport, because gate.js now asks the tutor-sheet
// script for a lease on every student login. The default answers "granted", so
// the password checks run exactly as they did before the lease existed. Tests
// of the lease itself pass their own transport, seed, query or channel.
function boot(file, opts) {
    opts = opts || {};
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
        url: 'http://localhost/' + file + (opts.query || ''),   // a real origin, or sessionStorage throws
        virtualConsole: vc,
        beforeParse(w) {
            w.scrollTo = () => {}; w.alert = () => {}; w.confirm = () => true;
            w.__calls = [];
            const answer = opts.transport || (() => ({ ok: true, granted: true }));
            w.__gateLeaseTransport = (op, params) => { w.__calls.push({ op, params }); return answer(op, params); };
            w.__reloads = 0;
            w.__gateReload = () => { w.__reloads++; };
            if (opts.channel) w.BroadcastChannel = opts.channel;
            for (const [k, v] of Object.entries(opts.seed || {})) w.sessionStorage.setItem(k, v);
            for (const [k, v] of Object.entries(opts.local || {})) w.localStorage.setItem(k, v);
        },
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

const [SAMPLE_PWD, SAMPLE_LABEL] = STUDENT_PASSWORDS[1];

console.log('\nONE LOGIN AT A TIME (the lease)\n-------------------------------');

const wait = ms => new Promise(r => setTimeout(r, ms));
const MSG = name => gate.split('const ' + name + ' = ')[1].split(';')[0]
    .split('+').map(x => x.trim().replace(/^'|'$/g, '')).join('');

t('the lease endpoint is the tutor sheet the app already posts to', () => {
    const sync = fs.readFileSync(path.join(__dirname, 'sheet-sync.js'), 'utf8');
    const want = (sync.match(/SHEET_SYNC_ENDPOINT\s*=\s*'([^']+)'/) || [])[1];
    const have = (gate.match(/LEASE_ENDPOINT\s*=\s*'([^']+)'/) || [])[1];
    ok(want, 'no SHEET_SYNC_ENDPOINT in sheet-sync.js');
    eq(have, want, 'LEASE_ENDPOINT drifted from SHEET_SYNC_ENDPOINT:');
});

{
    const w = await boot('index.html');
    const unlocked = await tryPwd(w, SAMPLE_PWD);
    const acq = w.__calls.find(c => c.op === 'acquire');
    t('a student login asks for a lease on its own name', () => {
        ok(unlocked, 'still locked');
        ok(acq, 'no acquire was sent');
        eq(acq.params.student, SAMPLE_LABEL);
        ok(/^[0-9a-f]{24}$/.test(acq.params.token), 'token is not 24 hex chars: ' + acq.params.token);
    });
    t('...and keeps the token for the rest of this tab', () =>
        eq(w.sessionStorage.getItem('psat89_lease'), acq && acq.params.token));
    w.lockMastery();
    t('Lock releases the lease it holds', () => {
        const rel = w.__calls.find(c => c.op === 'release');
        ok(rel, 'no release on Lock');
        eq(rel.params.token, acq && acq.params.token);
        eq(w.sessionStorage.getItem('psat89_lease'), null);
    });
    w.close();
}

{
    const w = await boot('index.html', { transport: op => op === 'acquire'
        ? { ok: false, reason: 'held', idleSecs: 12, ttlSecs: 150 } : { ok: true } });
    const unlocked = await tryPwd(w, SAMPLE_PWD);
    t('a second login while the name is live is REFUSED', () => {
        ok(!unlocked, 'the second login got in');
        eq(w.document.getElementById('__gateError').textContent, MSG('MSG_REFUSED'));
        eq(w.sessionStorage.getItem('mastery_unlocked'), null);
        eq(w.sessionStorage.getItem('psat89_user'), null);
    });
    w.close();
}

{
    const w = await boot('index.html', { transport: () => null });
    const unlocked = await tryPwd(w, SAMPLE_PWD);
    t('if the script cannot be reached the student is let in (fails open)', () => {
        ok(unlocked, 'an unreachable script locked a student out');
        eq(w.sessionStorage.getItem('psat89_user'), SAMPLE_LABEL);
    });
    w.close();
}

{
    const w = await boot('index.html', { transport: () => { throw new Error('network'); } });
    const unlocked = await tryPwd(w, SAMPLE_PWD);
    t('...and a transport that throws is treated the same way', () => ok(unlocked, 'a thrown error locked the student out'));
    w.close();
}

{
    const w = await boot('index.html', { seed: {
        mastery_unlocked: '1', psat89_user: SAMPLE_LABEL, mastery_role: 'student', psat89_lease: 'abc123' } });
    await wait(400);
    t('an already-unlocked page beats the lease it holds', () => {
        ok(!locked(w), 'an unlocked session was re-prompted');
        const b = w.__calls.find(c => c.op === 'beat');
        ok(b, 'no beat on page load');
        eq(b.params.token, 'abc123');
        eq(b.params.student, SAMPLE_LABEL);
    });
    w.close();
}

{
    const w = await boot('index.html', { seed: {
        mastery_unlocked: '1', psat89_user: SAMPLE_LABEL, mastery_role: 'student', psat89_lease: 'abc123' },
        transport: op => op === 'beat' ? { ok: false, reason: 'held' } : { ok: true } });
    await wait(400);
    t('a page whose lease was taken by another screen signs itself out', () => {
        eq(w.__reloads, 1, 'did not reload to the gate');
        eq(w.sessionStorage.getItem('mastery_unlocked'), null);
        eq(w.sessionStorage.getItem('psat89_user'), null);
        eq(w.sessionStorage.getItem('psat89_lease_msg'), MSG('MSG_LOST'));
    });
    w.close();
}

{
    const w = await boot('index.html', { seed: {
        mastery_unlocked: '1', psat89_user: SAMPLE_LABEL, mastery_role: 'student', psat89_lease: 'abc123' },
        transport: () => null });
    await wait(400);
    t('an unanswered beat never signs anyone out', () => {
        eq(w.__reloads, 0);
        eq(w.sessionStorage.getItem('mastery_unlocked'), '1');
    });
    w.close();
}

{
    const w = await boot('index.html', { seed: { psat89_lease_msg: 'signed out elsewhere' } });
    t('the gate tells a signed-out student why', () => {
        ok(locked(w), 'not gated');
        eq(w.document.getElementById('__gateError').textContent, 'signed out elsewhere');
        eq(w.sessionStorage.getItem('psat89_lease_msg'), null);
    });
    w.close();
}

{
    // A duplicated tab copies sessionStorage — token included — so the server
    // cannot tell the two apart. The pages can: one bus shared by both windows.
    const listeners = new Set();
    class Bus {
        constructor() { this.onmessage = null; listeners.add(this); }
        postMessage(data) { for (const l of listeners) if (l !== this && l.onmessage)
            setTimeout(() => l.onmessage && l.onmessage({ data }), 5); }
        close() { listeners.delete(this); this.onmessage = null; }
    }
    const seed = { mastery_unlocked: '1', psat89_user: SAMPLE_LABEL, mastery_role: 'student', psat89_lease: 'dup777' };
    const until = async (cond, ms) => { const end = Date.now() + ms; while (!cond() && Date.now() < end) await wait(25); };
    const first = await boot('index.html', { seed, channel: Bus });
    await until(() => first.__calls.some(c => c.op === 'beat'), 3000);   // first is now holding
    await wait(1100);                                                     // ...and established
    const second = await boot('index.html', { seed, channel: Bus });
    await until(() => second.__reloads > 0, 3000);
    t('a duplicated tab (same token, same browser) is signed out', () => {
        eq(second.__reloads, 1, 'the duplicate stayed in');
        eq(second.sessionStorage.getItem('psat89_lease_msg'), MSG('MSG_DUPLICATE'));
    });
    t('...and the original tab is untouched', () => {
        eq(first.__reloads, 0);
        eq(first.sessionStorage.getItem('mastery_unlocked'), '1');
    });
    first.close(); second.close();
}

{
    // The passphrase is not in this repo, so drive the tutor path by seeding it.
    const w2 = await boot('index.html', { seed: { mastery_unlocked: '1', psat89_user: 'Tutor', mastery_role: 'tutor' } });
    await wait(400);
    t('a tutor session never takes a lease', () => {
        eq(w2.__calls.length, 0, 'tutor sent: ' + w2.__calls.map(c => c.op).join(','));
    });
    w2.close();
}


{
    // whoami.js loads after gate.js on the hub, the runner and progress. With a
    // password on every page it must never relabel a logged-in session.
    const w = await boot('homework-hub.html', { query: '?user=faith',
        local: { psat89_user_last: 'Luke' },
        seed: { mastery_unlocked: '1', psat89_user: 'Maysa', mastery_role: 'student', psat89_lease: 'who1' } });
    await wait(300);
    t('on a gated page ?user= cannot relabel a logged-in session', () => {
        eq(w.sessionStorage.getItem('psat89_user'), 'Maysa');
        eq(w.psatUser, 'Maysa');
    });
    t('...nor does a name remembered from an earlier visit', () =>
        eq(w.localStorage.getItem('psat89_user_last'), 'Luke', 'whoami wrote over the remembered name'));
    t("...and whoami.js leaves gate.js's Lock (which releases the lease) in place", () => {
        w.lockMastery();
        ok(w.__calls.some(c => c.op === 'release'), 'Lock no longer releases the lease');
    });
    w.close();
}

{
    const w = await boot('homework-hub.html', { query: '?user=faith' });
    t('a gated page with ?user= and no password still asks for the password', () => {
        ok(locked(w), 'the hub opened on a name off the URL');
        ok(!w.sessionStorage.getItem('mastery_unlocked'));
    });
    w.close();
}

console.log('\n' + '='.repeat(48));
console.log(`${pass} passed, ${fail} failed`);
console.log('='.repeat(48) + '\n');
process.exit(fail ? 1 : 0);

})().catch(e => { console.error('\nHARNESS ERROR: ' + e.message); process.exit(1); });
