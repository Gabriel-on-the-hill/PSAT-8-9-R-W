// ─────────────────────────────────────────────────────────────────
// ruletype.test.js — every Conventions question carries a concept tag,
// and the vocabulary is the SAME ONE the sister app uses.
//
// WHY THIS EXISTS
//
// `skill` + `difficulty` is all `assignments.js` can select on, and it is not
// enough to build a diagnostic. "Seven Boundaries questions at Medium and Hard"
// can come back as seven comma items and tell you nothing about whether the
// student can place a colon. `ruleType` is the axis that makes coverage
// expressible: one comma item, one semicolon, one colon, one dash, one where no
// mark belongs at all.
//
// The vocabulary is copied from `MasteryApp/data-conventions.js` deliberately.
// Two banks that tag the same concept with different words cannot share a
// selector, and `challenge/build-challenge-set.js` selects on exactly this field
// ("MAY: skill, ruleType, goalType"). Invent a synonym here — "Semicolon" for
// "Semi", "Apostrophe" for "Poss" — and the generator silently matches nothing.
//
// WHAT THIS TEST CANNOT DO
//
// It checks that every tag EXISTS and is SPELLED from the fixed vocabulary. It
// cannot check that a tag is RIGHT. The tags were proposed by a classifier
// validated at 93% against the already-human-tagged SAT bank; 33 of the 101 were
// flagged low-confidence and want a human read. That review list is
// `_ruletype-review.md`, outside this repo. Until it is worked through, treat
// `ruleType` as good enough to draw a set from and not yet good enough to quote
// a coverage guarantee from.
// ─────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

function load(file, varName) {
    const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const ctx = { window: {}, out: null };
    vm.createContext(ctx);
    vm.runInContext(src + '\n;out = typeof ' + varName + " !== 'undefined' ? " + varName + ' : null;', ctx);
    return ctx.out;
}

// The tag sets are per SKILL, not global. A Boundaries question cannot be "SVA"
// and a Form/Structure question cannot be "Colon"; a tag that crosses the line is
// a mis-tag, not an unusual item.
const BY_SKILL = {
    'Boundaries':                 ['Commas', 'Semi', 'Colon', 'Dash', 'NoPunct'],
    'Form, Structure, and Sense': ['SVA', 'VTense', 'VForm', 'Pron', 'Poss', 'Mod'],
};

let pass = 0;
const fails = [];
function ok(what, cond, detail) {
    if (cond) { pass++; console.log('  ✓ ' + what); }
    else { fails.push(what + (detail ? ' — ' + detail : '')); console.log('  ✗ ' + what + (detail ? ' — ' + detail : '')); }
}
function section(t) { console.log('\n' + t); }

const bank = load('data-conventions.js', 'questionBank_CON');

section('1 · Every Conventions question carries a ruleType');
ok('the bank loaded', Array.isArray(bank) && bank.length > 0, 'got ' + (bank && bank.length));

const untagged = bank.filter(q => !q.ruleType);
ok('no item is missing its tag', untagged.length === 0,
   untagged.length + ' untagged: ' + untagged.map(q => q.id).slice(0, 8).join(', '));

section('2 · Tags come from the shared vocabulary, per skill');
const unknownSkill = bank.filter(q => !BY_SKILL[q.skill]);
ok('every item is a skill this test knows about', unknownSkill.length === 0,
   [...new Set(unknownSkill.map(q => q.skill))].join(', '));

const offVocab = bank.filter(q => BY_SKILL[q.skill] && BY_SKILL[q.skill].indexOf(q.ruleType) < 0);
ok('no tag is outside its skill’s vocabulary', offVocab.length === 0,
   offVocab.map(q => q.id + '=' + q.skill.slice(0, 10) + '/' + q.ruleType).slice(0, 8).join(', '));

section('3 · The vocabulary still matches the sister app’s');
// Not a style point. challenge/build-challenge-set.js picks sibling questions by
// ruleType across both banks; a divergence here is a generator that finds nothing.
const SISTER = path.join(__dirname, '..', '..', 'SAT GUIDES', 'MasteryApp', 'data-conventions.js');
if (fs.existsSync(SISTER)) {
    const sister = load(SISTER, 'questionBank_CON') || [];
    const theirs = new Set(sister.map(q => q.ruleType).filter(Boolean));
    const ours = new Set(bank.map(q => q.ruleType));
    const strays = [...ours].filter(t => !theirs.has(t));
    ok('every tag we use also exists in the sister bank', strays.length === 0, strays.join(', '));
} else {
    console.log('  – sister bank not reachable from here; vocabulary cross-check skipped');
}

section('4 · Coverage is actually drawable');
// A tag that exists on paper but has no questions at a difficulty cannot be put in
// a set at that difficulty. This does not fail the build — it PRINTS, because it is
// a fact about the bank a set author has to plan around, not a defect to fix.
const DIFFS = ['Easy', 'Medium', 'Hard'];
for (const skill of Object.keys(BY_SKILL)) {
    console.log('  ' + skill);
    for (const t of BY_SKILL[skill]) {
        const row = DIFFS.map(d => bank.filter(q => q.skill === skill && q.ruleType === t && q.difficulty === d).length);
        const total = row.reduce((a, b) => a + b, 0);
        const gaps = DIFFS.filter((d, i) => row[i] === 0);
        console.log('    ' + t.padEnd(8) + DIFFS.map((d, i) => (d[0] + ':' + row[i]).padEnd(6)).join('') +
                    'total ' + String(total).padStart(3) +
                    (gaps.length ? '   ← none at ' + gaps.join('/') : ''));
    }
}
ok('every tag in the vocabulary has at least one question somewhere',
   Object.keys(BY_SKILL).every(s => BY_SKILL[s].every(t => bank.some(q => q.skill === s && q.ruleType === t))));

console.log('\n' + '─'.repeat(64));
if (fails.length) { console.log(fails.length + ' FAILED: ' + fails.join(' · ')); process.exit(1); }
console.log('ALL ' + pass + ' ASSERTIONS PASSED');
