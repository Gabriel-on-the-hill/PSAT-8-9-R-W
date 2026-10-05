// ─────────────────────────────────────────────────────────────────
// lease.test.js — one login at a time, server half.
//
//   node tutor-sheet/lease.test.js
//
// No jsdom, no network, no Google account. The code under test is EXTRACTED
// FROM psat-apps-script.md, so what you paste into the Apps Script editor is
// exactly what these assertions ran against. The client half (gate.js) is in
// gate.test.js.
//
// The sheet below is deliberately tiny: getRange / getValues / setValues /
// appendRow / getLastRow over an array of rows. Enough for lease_(), which is
// all this file tests.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const md = fs.readFileSync(path.join(__dirname, 'psat-apps-script.md'), 'utf8');
const m = md.match(/```javascript\r?\n([\s\S]*?)```/);   // \r?: a Windows checkout is CRLF
if (!m) { console.error('no javascript block in psat-apps-script.md'); process.exit(1); }
const CODE = m[1];

function makeSheet() {
    const rows = [];
    const range = (row, col, nr, nc) => ({
        getValues() {
            const out = [];
            for (let i = 0; i < (nr || 1); i++) {
                const src = rows[row - 1 + i] || [];
                const line = [];
                for (let j = 0; j < (nc || 1); j++) line.push(src[col - 1 + j] === undefined ? '' : src[col - 1 + j]);
                out.push(line);
            }
            return out;
        },
        setValues(vals) {
            vals.forEach((v, i) => {
                while (rows.length < row + i) rows.push([]);
                const t = rows[row - 1 + i];
                v.forEach((x, j) => { t[col - 1 + j] = x; });
            });
            return this;
        },
    });
    return {
        _rows: rows,
        getRange: range,
        getLastRow: () => rows.length,
        appendRow(a) { rows.push(a.slice()); },
        setFrozenRows() {},
    };
}

function makeCtx() {
    const tabs = new Map();
    const ss = {
        getSheetByName: n => tabs.get(n) || null,
        insertSheet: n => { const s = makeSheet(); tabs.set(n, s); return s; },
    };
    const ctx = {
        console, Date, Math, JSON, String, Number, Array, Object, isNaN,
        SpreadsheetApp: { getActiveSpreadsheet: () => ss },
        ContentService: {
            MimeType: { JSON: 'json', JAVASCRIPT: 'javascript' },
            createTextOutput: s => ({ _s: s, setMimeType() { return this; }, getContent() { return this._s; } }),
        },
        LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    };
    vm.createContext(ctx);
    vm.runInContext(CODE, ctx, { filename: 'psat-apps-script' });
    ctx.__rows = n => (tabs.get(n) || { _rows: [] })._rows;
    ctx.__get = params => {
        const out = ctx.doGet({ parameter: params }).getContent();
        const mm = out.match(/^[A-Za-z_$][\w$]*\(([\s\S]*)\);$/);
        return { raw: out, body: JSON.parse(mm ? mm[1] : out) };
    };
    ctx.__post = body => ctx.doPost({ postData: { contents: JSON.stringify(body) } }).getContent();
    return ctx;
}

let pass = 0, fail = 0; const fails = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; fails.push(n); console.log('  ✗ ' + n + (d ? ' — ' + d : '')); } };

console.log('\nOne login at a time (lease_ in psat-apps-script.md)');
{
    const c = makeCtx();
    const lease = (op, token, extra) => c.__get(Object.assign(
        { action: 'lease', op, student: 'Maysa', token, callback: 'cb1' }, extra || {})).body;
    const row = () => c.__rows('Active Logins').find((x, i) => i > 0 && x[0] === 'Maysa');

    const a = lease('acquire', 'tokA');
    ok('the first login is granted', a.ok === true && a.granted === true, JSON.stringify(a));
    ok('the reply is JSONP the gate can read',
        /^cb1\(\{/.test(c.__get({ action: 'lease', op: 'beat', student: 'Maysa', token: 'tokA', callback: 'cb1' }).raw));
    ok('the Active Logins tab has its header row', c.__rows('Active Logins')[0].join('|') === 'Student|Token|Since|Last seen|App');

    const b = lease('acquire', 'tokB');
    ok('a second tab or device is REFUSED while the first is live', b.ok === false && b.reason === 'held', JSON.stringify(b));
    ok('the holder can still beat', lease('beat', 'tokA').ok === true);
    ok('a new page in the SAME tab (same token) is let straight back in', lease('acquire', 'tokA').ok === true);
    ok('a beat from the refused token is refused too', lease('beat', 'tokB').ok === false);
    ok('a release from a token that does not hold it frees nothing', lease('release', 'tokB').released === false);

    const logLen = () => c.__rows('Login Log').length;
    const before = logLen();
    ok('the holder can release', lease('release', 'tokA').released === true);
    ok('a release writes no log row (it is sent on every page change)', logLen() === before);
    ok('the same tab walks straight back in after its own release', lease('acquire', 'tokA').ok === true);
    lease('release', 'tokA');
    ok('another device is still refused inside the grace window', lease('acquire', 'tokC').ok === false);
    row()[3] = new Date(row()[3].getTime() - (c.LEASE_GRACE_SEC + 1) * 1000);
    ok('once the grace window passes, a closed tab has freed the name', lease('acquire', 'tokC').ok === true);

    row()[3] = new Date(Date.now() - (c.LEASE_TTL_SEC + 5) * 1000);
    ok('a lease not beaten for the TTL is granted to the next login', lease('acquire', 'tokD').ok === true);
    ok('...and the stale tab loses it on its next beat', lease('beat', 'tokC').ok === false);

    row()[1] = '';
    ok('clearing the Token cell frees the login', lease('acquire', 'tokE').ok === true);
    ok('names are case-insensitive, one row per student',
        lease('acquire', 'tokF', { student: 'maysa' }).ok === false
        && c.__rows('Active Logins').filter((x, i) => i > 0).length === 1);
    ok('students do not block each other', lease('acquire', 'tokG', { student: 'Luke' }).ok === true);

    const log = c.__rows('Login Log');
    const events = log.slice(1).map(x => x[2]);
    ok('the Login Log tab has its header row', log[0].join('|') === 'Timestamp|Student|Event|Token|Detail');
    ok('refusals, grants and lost leases are logged',
        ['refused', 'granted', 'lost'].every(e => events.indexOf(e) >= 0), events.join(','));
    ok('the log keeps only a token prefix', log.slice(1).every(x => String(x[3]).length <= 6));

    ok('an unknown op is rejected', lease('steal', 'x').ok === false);
    ok('a missing token is rejected',
        c.__get({ action: 'lease', op: 'acquire', student: 'Maysa', callback: 'cb1' }).body.ok === false);
    const evil = c.doGet({ parameter: { action: 'lease', op: 'beat', student: 'Maysa', token: 'tokE', callback: 'alert(1);x' } }).getContent();
    ok('a callback that is not a plain name gets plain JSON, never script', /^\{/.test(evil), evil.slice(0, 30));

    const c2 = makeCtx();
    c2.__get({ action: 'lease', op: 'acquire', student: 'Faith', token: 'tokS', callback: 'cb' });
    const pr = JSON.parse(c2.__post({ action: 'lease', op: 'release', student: 'Faith', token: 'tokS' }));
    ok('doPost accepts the beacon release', pr.ok === true && pr.released === true, JSON.stringify(pr));
    ok('...and writes no Homework or Sessions row',
        c2.__rows('Homework').length === 0 && c2.__rows('Sessions').length === 0);
    ok('the plan endpoint still answers', /backend is running/.test(c2.doGet({ parameter: {} }).getContent()));
}

console.log('\n' + '─'.repeat(64));
console.log(fail === 0 ? `ALL ${pass} ASSERTIONS PASSED` : `${pass} passed, ${fail} FAILED:\n  - ` + fails.join('\n  - '));
process.exit(fail === 0 ? 0 : 1);
