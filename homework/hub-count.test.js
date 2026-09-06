// ─────────────────────────────────────────────────────────────────
// hub-count.test.js — the hub card must not advertise a shorter set than the
// runner serves.
//
//   node homework/hub-count.test.js
//
// Needs no jsdom: it runs homework-hub.html's OWN inline script in a vm against
// a stub document, so what is asserted is the page's real behaviour and not a
// reimplementation of it.
//
// WHY THIS EXISTS. The card's question count summed the day's `sections` and
// ignored the spaced-review dose. A day authored as 4 new + 2 review printed
// "4 questions · 8 min"; the runner then built six on that same clock. Seven
// sets across three students were doing it — Maysa's 2 and 3, Faith's 3–5,
// Luke's 3 and 4 — and there was no symptom anywhere. Nothing errored, and the
// runner's own "Question 1 of 6" was correct all along, so the only way to see
// it was to open a set and count, by which point the clock is running.
//
// It matters more than its size because the plans this app serves are built on
// stated per-question budgets: every tip names a split before the student
// starts. A denominator that is a third too small breaks the exact skill the
// week is teaching. Advertising HIGH is safe — dueForReview() may return fewer
// when the ladder is dry, and the student finishes early. Advertising LOW is
// the bug.
//
// The dose resolves day → plan → 2 in BOTH homework-hub.html and
// homework-run.html. If those two ever drift apart, the card lies again — so
// this test derives the expected number from the plan itself rather than from
// either file, and both have to agree with it.
//
// Assertions:
//   1. The hub's inline script parses.
//   2. Every card's count == the day's own draw + the resolved review dose.
//   3. No timed set is advertised at a pace below anything we teach — a card
//      that says six questions in two minutes is a different bug with the same
//      cause, and this is where it would show up.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP = path.join(__dirname, '..');
const STUDENTS = ['Maysa', 'Faith', 'Luke', 'Gabe'];

// Nothing we author should ever land below this. It is a floor, not a target:
// the real test gives ~71s, and the tightest set anyone has been given is 70s.
const MIN_SECONDS_PER_QUESTION = 40;

let pass = 0, fail = 0;
const fails = [];
function ok(what, cond, detail) {
    if (cond) { pass++; console.log(`  ✓ ${what}`); }
    else { fail++; fails.push(what + (detail ? ` — ${detail}` : '')); console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ''}`); }
}

const html = fs.readFileSync(path.join(APP, 'homework-hub.html'), 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const src = blocks[blocks.length - 1];

console.log('\nhomework-hub.html — the card must not under-count the set\n');

try {
    new vm.Script(src, { filename: 'homework-hub.html inline' });
    ok('the hub\'s inline script parses', true);
} catch (e) {
    ok('the hub\'s inline script parses', false, e.message);
    console.log('\n' + '─'.repeat(64));
    console.log('1 FAILED:\n  · syntax');
    process.exit(1);
}

// Render the page for one student against a stub DOM. The hub reads only
// getElementById().textContent/.innerHTML and the two storages, so this is
// enough to drive it end to end.
function renderFor(student, seed) {
    const els = {}, store = Object.assign({}, seed || {});
    const el = id => els[id] || (els[id] = { textContent: '', innerHTML: '', style: {} });
    const ctx = {
        console: { log() {}, warn() {}, error() {} },
        JSON, Date, Math, encodeURIComponent,
        document: { getElementById: el },
        sessionStorage: { getItem: k => (k === 'psat89_user' ? student : null) },
        localStorage: {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = v; },
            removeItem: k => { delete store[k]; },
        },
    };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(APP, 'homework/assignments.js'), 'utf8'), ctx);
    vm.runInContext(fs.readFileSync(path.join(APP, 'progress.js'), 'utf8'), ctx);
    vm.runInContext(src, ctx);
    return { rendered: el('list').innerHTML, plan: ctx.HOMEWORK[student] };
}

// What the runner will build: the day's own draw, plus the dose. Derived from
// the plan, so neither page's copy of the rule is trusted here.
function expectedCount(plan, day) {
    const own = day.sections
        ? day.sections.reduce((s, x) => s + (x.count || 0), 0)
        : (day.count || 0);
    const dose = (typeof day.review === 'number') ? day.review
               : (typeof plan.review === 'number') ? plan.review
               : 2;
    return { own, dose, total: own + dose };
}

for (const student of STUDENTS) {
    const { rendered, plan } = renderFor(student);
    if (!plan || !plan.days || !plan.days.length) continue;   // no plan, nothing to assert

    console.log(`\n  ${student} — ${plan.days.length} sets`);
    const shown = [...rendered.matchAll(/<div class="meta">.*?(\d+) questions/g)].map(m => +m[1]);

    ok(`${student}: a card is rendered for every set in the plan`,
        shown.length === plan.days.length,
        `${shown.length} cards, ${plan.days.length} sets`);
    if (shown.length !== plan.days.length) continue;

    plan.days.forEach((day, i) => {
        const { own, dose, total } = expectedCount(plan, day);
        ok(`${student} set ${day.n}: card says ${shown[i]}, runner serves ${total} (${own} new + ${dose} review)`,
            shown[i] === total);

        if (day.minutes && shown[i]) {
            const per = Math.round((day.minutes * 60) / shown[i]);
            ok(`${student} set ${day.n}: ${day.minutes} min across ${shown[i]} questions is ${per}s each`,
                per >= MIN_SECONDS_PER_QUESTION,
                `${per}s is below the ${MIN_SECONDS_PER_QUESTION}s floor`);
        }
    });
}

// ── Answered but not submitted ────────────────────────────────────────────
// Added 6 Sep 2026. Answers are written per question as the student works; the
// completion flag is written only at the score screen. A set holding answers and
// no flag is work she has actually done that never reached the tutor — and under
// sequential unlock it is also what is holding up every set behind it.
//
// The card used to render that state as "Available", identical to a set she had
// never opened. So the hub told her to start something she had already finished,
// and told the tutor nothing at all. Both of them read her result on the score
// screen that same evening and neither could see it had not been sent. Seventeen
// days of it went unnoticed.
console.log('\n  answered but not submitted');
{
    const student = STUDENTS.find(s => {
        const p = renderFor(s).plan;
        return p && p.days && p.days.length;
    });
    if (!student) {
        ok('a student with a plan exists to test the state against', false);
    } else {
        const plan = renderFor(student).plan;
        const key = 'psat89_hwrec_' + student + '_' + plan.start + '_1';
        const worked = JSON.stringify({ at: Date.now(), recs: [{ id: 'a', chosen: 'B', ok: true }] });

        const clean = renderFor(student).rendered;
        ok('a set never opened still reads Available',
            /Available/.test(clean) && !/not submitted/.test(clean));

        const seeded = renderFor(student, { [key]: worked }).rendered;
        ok('a set with answers and no completion flag reads "Answered · not submitted"',
            /Answered\s*&middot;\s*not submitted/.test(seeded),
            'the card still calls answered work "Available"');
        ok('and its button says Finish, not Start',
            /Finish set 1/.test(seeded),
            'the hub must not ask her to start a set she has already worked');

        const doneKey = 'psat89_hw_' + student + '_' + plan.start + '_1';
        const submitted = renderFor(student, { [key]: worked, [doneKey]: '1' }).rendered;
        ok('a submitted set still reads Done, not the new state',
            /Done/.test(submitted) && !/not submitted/.test(submitted));
    }
}

console.log('\n' + '─'.repeat(64));
if (fail) { console.log(`${fail} FAILED:\n  · ` + fails.join('\n  · ')); process.exit(1); }
console.log(`ALL ${pass} ASSERTIONS PASSED`);
