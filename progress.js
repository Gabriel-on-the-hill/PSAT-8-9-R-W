// ── PSAT 8/9 R&W — shared progress ledger ─────────────────────────
// Storage key: 'psat89_progress'
// Shape: { [questionId]: { correct: number, wrong: number, lastSeen: number } }

// Per-student keys: the mastery ledger is scoped to whoever is signed in,
// so multiple students can share a device without their progress mixing.
function _hwUser() { try { return sessionStorage.getItem('psat89_user') || 'guest'; } catch (e) { return 'guest'; } }
const MASTERY_THRESHOLD = 2;
const MASTERY_DECAY_MS  = 21 * 86_400_000; // 21 days
// After any answer, a question "rests" for this long before it can resurface in
// a new practice set — so answering a question sends it to the back of the queue
// instead of bringing it straight back in the next set. Long enough to clear a
// single sitting, short enough that a not-yet-mastered item returns the next day
// for reinforcement.
const REVIEW_COOLDOWN_MS = 20 * 3_600_000;  // 20 hours

// ── The review ladder ─────────────────────────────────────────────
// A correct answer does not FINISH a question. It SCHEDULES it. Each consecutive
// correct pushes the next sighting further out; a miss drops it to the bottom rung.
//
//   1st correct → back in 1 day    4th → back in 3 weeks
//   2nd         → 3 days           5th+ → back in 6 weeks, then it is maintenance
//   3rd         → 1 week
//
// This exists because the ledger had no way to bring a learned question BACK.
// Two corrects made a question "mastered" (bottom tier of the draw). At 21 days
// _isMastered() went false and — because `wrong` was still 0 — the question fell
// into softMastered, a tier that sits BEHIND `unseen`. The bank holds ~719
// questions and a set takes six, so `unseen` never ran out and the question was
// never drawn again. The 21-day decay only ever changed a label on the progress
// screen. A topic taught in April was gone by May and nothing brought it back.
//
// Spacing is the largest, most replicated effect in the learning literature
// (`MR-1`, `MR-3` in the root handbook). We had none of it. This is it.
const REVIEW_LADDER_DAYS = [1, 3, 7, 21, 42];
const DAY_MS = 86_400_000;

function _questionAliasMap() {
    var bank;
    try { bank = questionBank; } catch (e) { return {}; }
    if (!Array.isArray(bank)) return {};
    var aliases = {};
    bank.forEach(function(q) {
        (q.altIds || []).forEach(function(id) { if (id && id !== q.id) aliases[id] = q.id; });
    });
    return aliases;
}

function _canonicalQuestionId(id) {
    return _questionAliasMap()[id] || id;
}

function _mergeAliasProgressRecord(current, aliasRecord) {
    if (!current) return aliasRecord;
    var currentSeen = current.lastSeen || 0;
    var aliasSeen = aliasRecord.lastSeen || 0;
    var latest = aliasSeen > currentSeen ? aliasRecord : current;
    var merged = Object.assign({}, current, aliasRecord, latest);
    merged.correct = (current.correct || 0) + (aliasRecord.correct || 0);
    merged.wrong = (current.wrong || 0) + (aliasRecord.wrong || 0);
    merged.lastSeen = Math.max(currentSeen, aliasSeen);
    return merged;
}

function _migrateQuestionAliases(ledger) {
    var aliases = _questionAliasMap();
    var changed = false;
    Object.keys(aliases).forEach(function(alias) {
        if (!Object.prototype.hasOwnProperty.call(ledger, alias)) return;
        var canonical = aliases[alias];
        ledger[canonical] = _mergeAliasProgressRecord(ledger[canonical], ledger[alias]);
        delete ledger[alias];
        changed = true;
    });
    return changed;
}

function getProgress() {
    try {
        var ledger = JSON.parse(localStorage.getItem(('psat89_progress_' + _hwUser()))) || {};
        if (_migrateQuestionAliases(ledger)) _saveProgress(ledger);
        return ledger;
    } catch(e) { return {}; }
}

function _saveProgress(ledger) {
    try { localStorage.setItem(('psat89_progress_' + _hwUser()), JSON.stringify(ledger)); } catch(e) {}
}

// ── Exposure: questions the student has MET, kept apart from the ledger ────
// Storage key: 'psat89_seen_<student>'
// Shape: { [questionId]: { at: firstMetMs, by: { [source]: { at, result } } } }
//   source: 'baseline' | 'class'      result: 'correct' | 'wrong' | 'seen'
//
// The ledger above answers two questions at once: "has he seen this?" (no row →
// prioritizePool calls it unseen) and "when does it come back?" (a row → the
// review ladder). Two surfaces stay out of it ON PURPOSE. The baseline is built
// to miss across all eleven skills, and a ledger row would put every one of
// those misses on rung zero — tomorrow's review dose, from skills nobody has
// taught (see baseline.html). The class route is teaching, and teaching answers
// earn no mastery credit.
//
// Both reasons are right, and both had the same side effect: an item met there
// had no row, so every draw treated it as never seen. A homework day served a
// baseline question as "new"; a question kept back for a class could be spent
// by homework first; and "never seen" accuracy quietly included items he had
// already answered. Nothing errored — it only showed when someone matched the
// export row by row.
//
// So exposure is its own record. It changes ONE thing: prioritizePool() puts a
// question met elsewhere behind the truly unseen ones, still ahead of misses
// and resting items. It never creates a ledger row, never moves the ladder, and
// dueForReview() ignores it — unless a plan opts in with `reviewClassMisses`,
// and even then only for CLASS misses, never baseline ones.
//
// History is filled in from what the browser already holds: every baseline
// record (psat89_baseline_<student>) and every structured class route
// (psat89_classroute_<student>_<setId>). A class route stores answers by
// position, so it can only be read where challenge/sets.js is loaded, and its
// right/wrong only where the bank is loaded too; elsewhere an answered item is
// noted as 'seen' and upgraded the next time a page holding both reads it. It
// runs once per page, per student, and only ever adds. It cannot see work done
// on another device.
var _exposureSynced = {};

function _exposureKey() { return 'psat89_seen_' + _hwUser(); }

function _readExposure() {
    try { return JSON.parse(localStorage.getItem(_exposureKey())) || {}; }
    catch (e) { return {}; }
}

function _saveExposure(map) {
    try { localStorage.setItem(_exposureKey(), JSON.stringify(map)); } catch (e) {}
}

// Adds one meeting to `map`. The FIRST meeting per source is the one kept: a
// class answer reopened after feedback is a re-read, not new evidence. Returns
// true when the map changed.
function _noteExposure(map, id, source, isCorrect, at) {
    if (!id || !source) return false;
    id = _canonicalQuestionId(id);
    at = (typeof at === 'number' && isFinite(at) && at > 0) ? at : Date.now();
    var result = isCorrect === true ? 'correct' : (isCorrect === false ? 'wrong' : 'seen');
    var rec = map[id] || (map[id] = { at: at, by: {} });
    if (!rec.by) rec.by = {};
    var changed = false;
    if (at < rec.at) { rec.at = at; changed = true; }
    var prev = rec.by[source];
    if (!prev) {
        rec.by[source] = { at: at, result: result };
        changed = true;
    } else if (prev.result === 'seen' && result !== 'seen') {
        // Seen on screen first, answered later in the same route: keep the answer.
        prev.result = result;
        changed = true;
    }
    return changed;
}

// Call where an item is met outside the ledger. Never writes the ledger.
function recordExposure(id, source, isCorrect) {
    var map = getExposure();
    if (_noteExposure(map, id, source, isCorrect, Date.now())) _saveExposure(map);
}

function _syncExposure(map) {
    var user = _hwUser(), changed = false;
    try {
        var baselines = JSON.parse(localStorage.getItem('psat89_baseline_' + user)) || [];
        baselines.forEach(function (b) {
            (b && Array.isArray(b.items) ? b.items : []).forEach(function (i) {
                if (i && i.id && _noteExposure(map, i.id, 'baseline',
                        i.chosen ? !!i.correct : null, b.takenAt || b.savedAt)) changed = true;
            });
        });
    } catch (e) {}
    try {
        var sets = (typeof window !== 'undefined' && window.CHALLENGE_SETS && window.CHALLENGE_SETS[user]) || [];
        var bank = (typeof questionBank !== 'undefined' && Array.isArray(questionBank)) ? questionBank : [];
        var prefix = 'psat89_classroute_' + user + '_';
        sets.forEach(function (set) {
            var path = set && set.learningPath;
            if (!path) return;
            var s;
            try { s = JSON.parse(localStorage.getItem(prefix + set.setId)); } catch (e) { return; }
            if (!s) return;
            function note(ref, chosenIndex) {
                if (!ref || !ref.bankId || chosenIndex === undefined || chosenIndex === null) return;
                var q = bank.find(function (x) { return x.id === ref.bankId; });
                var result = (q && typeof q.answer === 'string' && q.answer) ? (chosenIndex === q.answer.charCodeAt(0) - 65) : null;
                if (_noteExposure(map, ref.bankId, 'class', result, 0)) changed = true;
            }
            function block(refs, b) {
                if (!b || !Array.isArray(b.answers)) return;
                b.answers.forEach(function (a, i) { note((refs || [])[i], a); });
            }
            block(path.steps, s.lesson);
            block(path.checks, s.gate);
            if (s.exit && Array.isArray(s.exit.ids)) block(s.exit.ids.map(function (id) {
                return (path.exitChoices || []).find(function (r) { return r.bankId === id; });
            }), s.exit);
        });
    } catch (e) {}
    return changed;
}

function getExposure() {
    var map = _readExposure(), user = _hwUser();
    if (!_exposureSynced[user]) {
        _exposureSynced[user] = true;
        if (_syncExposure(map)) _saveExposure(map);
    }
    return map;
}

// The record for bank question `q`, under its id or any alias it was met under.
function _exposureFor(map, q) {
    if (!q || !map) return null;
    if (map[q.id]) return map[q.id];
    var alts = q.altIds || [];
    for (var i = 0; i < alts.length; i++) if (map[alts[i]]) return map[alts[i]];
    return null;
}

// A class miss due back, for a plan that opted in. Same timing as a ledger miss:
// it returns once the cooldown clears. Baseline misses never qualify.
function _classMissOverdueBy(rec) {
    var c = rec && rec.by && rec.by['class'];
    if (!c || c.result !== 'wrong') return -Infinity;
    return Date.now() - (c.at + REVIEW_COOLDOWN_MS);
}

// Call after every answered question.
// source: 'practice' | 'exam' | 'homework'  — exam answers count double.
// meta:   { skill, review } — optional. `review: true` means the ladder chose this
//         question (dueForReview), so the answer is a DELAYED retrieval and counts
//         toward retention. `skill` is the bucket it counts into. Both are ignored
//         when absent, so the three-argument callers keep working unchanged.
//
//         `source` says where the answer happened; `review` says why the question
//         was drawn. They are different questions and must not be folded together —
//         an exam answer still counts double whether or not it was a review.
function recordAnswer(id, isCorrect, source, meta) {
    id = _canonicalQuestionId(id);
    const ledger = getProgress();
    if (!ledger[id]) ledger[id] = { correct: 0, wrong: 0, lastSeen: 0 };
    // Read the rung BEFORE touching anything. _streak() falls back to `correct` for
    // ledgers written before the ladder, so computing it after correct++ would count
    // a single right answer as two rungs and double-space the question.
    const rung = _streak(ledger[id]);
    ledger[id].lastSeen   = Date.now();
    ledger[id].lastSource = source || 'practice';
    ledger[id].lastResult = isCorrect ? 'correct' : 'wrong';
    if (isCorrect) {
        ledger[id].correct += (source === 'exam') ? 2 : 1;
        ledger[id].streak   = rung + 1;                  // climb a rung
    } else {
        ledger[id].wrong++;
        ledger[id].streak = 0;                            // back to the bottom
        if (ledger[id].correct > 0) ledger[id].correct--;
    }
    _saveProgress(ledger);
    if (meta && meta.review) _recordRetention(meta.skill, isCorrect);
}

// ── Retention: is it STAYING learned? ─────────────────────────────
// The ledger has always known whether an answer was right. It could not, until
// now, tell "learned and retained" from "learned and forgotten" — and that is the
// exact claim a monthly report makes to a parent.
//
// The difference between the two is delay. Getting a question right the first time
// you meet it is ACQUISITION. Getting it right when the ladder brings it back
// weeks later is RETENTION, and only the second is evidence that anything stuck
// (`AN-4`, `MR-8`). The spacing ladder already creates the delayed retrievals;
// this is what finally counts them.
//
// So exactly one thing lands here: an answer to a question dueForReview() chose.
// A first attempt must never be counted. Acquisition accuracy always looks good,
// so a first attempt leaking in moves this number in the flattering direction —
// and a flattering number that ends up in a report is a lie (`M1`). Nor does a
// redo count: the redo is untimed with notes open, and it is not a memory test.
//
// Shape: { [skill]: { correct, total } }
function getRetentionStats() {
    try { return JSON.parse(localStorage.getItem('psat89_retention_' + _hwUser())) || {}; }
    catch (e) { return {}; }
}

function _saveRetentionStats(stats) {
    try { localStorage.setItem('psat89_retention_' + _hwUser(), JSON.stringify(stats)); } catch (e) {}
}

function _recordRetention(skill, isCorrect) {
    if (!skill) return;
    const stats = getRetentionStats();
    if (!stats[skill]) stats[skill] = { correct: 0, total: 0 };
    stats[skill].total += 1;
    if (isCorrect) stats[skill].correct += 1;
    _saveRetentionStats(stats);
}

// The durable-learning readout: retention rate per skill, plus overall.
// Returns { bySkill: { [skill]: { correct, total, rate } }, overall: { correct, total, rate } }.
//
// The counts come back with the rates on purpose. "100%" off a single delayed
// retrieval is not a retention claim, and any surface showing this must be able to
// say 1/1 rather than imply a month of evidence.
function getRetention() {
    const stats   = getRetentionStats();
    const bySkill = {};
    let correct = 0, total = 0;
    Object.entries(stats).forEach(([skill, s]) => {
        const c = s.correct || 0, t = s.total || 0;
        if (!t) return;
        bySkill[skill] = { correct: c, total: t, rate: c / t };
        correct += c; total += t;
    });
    return {
        bySkill,
        overall: { correct, total, rate: total ? correct / total : 0 },
    };
}

function mergeRetention(incoming) {
    if (!incoming || typeof incoming !== 'object') return;
    const existing = getRetentionStats();
    Object.entries(incoming).forEach(([skill, s]) => {
        if (!existing[skill]) existing[skill] = { correct: 0, total: 0 };
        existing[skill].correct += s.correct || 0;
        existing[skill].total   += s.total   || 0;
    });
    _saveRetentionStats(existing);
}

// ── The ladder ────────────────────────────────────────────────────
// Consecutive corrects. Ledgers written before the ladder existed carry no
// `streak`, so infer one rather than resetting real students to zero: a record
// whose last answer was wrong sits at the bottom; otherwise credit the corrects
// it already banked.
function _streak(record) {
    if (!record) return 0;
    if (typeof record.streak === 'number') return record.streak;
    return record.lastResult === 'wrong' ? 0 : (record.correct || 0);
}

// When this question should next be put in front of the student.
function _dueAt(record) {
    if (!record || !record.lastSeen) return 0;
    const s = _streak(record);
    // A miss is not on the ladder — it comes back as soon as the cooldown clears,
    // which is what makes "misses come back" true.
    if (s <= 0) return record.lastSeen + REVIEW_COOLDOWN_MS;
    const rung = REVIEW_LADDER_DAYS[Math.min(s, REVIEW_LADDER_DAYS.length) - 1];
    return record.lastSeen + rung * DAY_MS;
}

function _isDue(record) {
    if (!record || !record.lastSeen) return false;
    return Date.now() >= _dueAt(record);
}

// How long overdue, in ms. Negative means not due yet. Used to sort the review
// queue so the most-forgotten thing comes back first.
function _overdueBy(record) {
    if (!record || !record.lastSeen) return -Infinity;
    return Date.now() - _dueAt(record);
}

// ── The review draw ───────────────────────────────────────────────
// Up to `n` questions that are DUE, most overdue first.
//
// This is the one draw that is allowed to ignore the day's skill and difficulty
// filter, and it is the whole point of it. A homework day narrows the bank to
// (say) Words in Context / Hard before prioritizePool() ever sees it, so a
// Text Structure question due for review — or a Medium miss, when the day is
// Hard-only — CANNOT surface there, no matter how the pool is ordered. Review
// has to be drawn against the whole bank or it does not happen at all.
//
// It never returns an unseen question. A review block may only bring back
// something the student has actually been taught and has actually attempted;
// handing them a cold skill under the banner of "review" is the fastest way to
// lose them (`CD-2` — never assign what has not been taught).
//
// `opts.classMisses` (a plan's `reviewClassMisses`) is the one exception, and it
// is opt-in: a question MISSED in a class route, with no ledger row yet, counts
// as due once the miss cooldown clears. It was attempted, so it is not cold. It
// is a teaching decision, so it is off unless the plan asks. Baseline misses
// never qualify — the baseline tests untaught skills by design. Once she answers
// the item in homework it has a ledger row and the ladder takes over.
function dueForReview(bank, n, excludeIds, opts) {
    if (!bank || !bank.length || !n) return [];
    const ledger = getProgress();
    const skip   = excludeIds || {};
    const exposure = (opts && opts.classMisses) ? getExposure() : null;
    return bank
        .map(q => {
            if (skip[q.id]) return null;
            const r = ledger[q.id];
            if (r) return _isDue(r) ? { q, over: _overdueBy(r) } : null;
            if (!exposure) return null;
            const over = _classMissOverdueBy(_exposureFor(exposure, q));
            return over >= 0 ? { q, over } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.over - a.over)
        .slice(0, n)
        .map(x => x.q);
}

function _isMastered(record) {
    if (!record) return false;
    // Mastery expires after MASTERY_DECAY_MS of not seeing the question
    if (record.lastSeen && Date.now() - record.lastSeen > MASTERY_DECAY_MS) return false;
    return record.correct >= MASTERY_THRESHOLD;
}

// True when a question should be held back from a NEW practice set for now, so
// it doesn't reappear immediately after being answered — it goes to the back of
// the queue instead:
//   • mastered → rest (until 21-day decay re-opens it, handled by _isMastered);
//   • answered (right OR wrong) within the cooldown → rest;
//   • cooldown elapsed on a not-yet-mastered item → due again, so misses come
//     back for review and single corrects come back to confirm mastery.
// Unseen questions (no record) are never resting. Same-session review of a miss
// is still available on demand via the "Review missed" and weak-area buttons,
// which bypass this cooldown deliberately.
function _isResting(record) {
    if (!record) return false;
    if (_isMastered(record)) return true;
    if (record.lastSeen && (Date.now() - record.lastSeen) < REVIEW_COOLDOWN_MS) return true;
    return false;
}

// Reorder pool with THREE tiers:
//   1. needsWork — seen, has had at least one wrong answer, not yet mastered.
//                  Surfaces FIRST so the student practises their misses.
//   2. unseen    — never answered.
//   3. resting   — answered correctly at some point. Sorted by how OVERDUE it is
//                  (see the review ladder), not shuffled: when a narrow pool runs
//                  out of unseen questions, the thing the student is closest to
//                  forgetting is the thing that should come back.
// The first two tiers are shuffled so order within them is random.
//
// `unseen` deliberately stays AHEAD of `resting`. Review does not get to crowd out
// new material inside a normal draw — a day set to teach a new skill must still
// teach it. Review gets its own dose instead, drawn against the whole bank by
// dueForReview(), because that is the only draw that can reach a due question the
// day's skill/difficulty filter has already excluded.
// UNSEEN FIRST, then misses. Ported from the sister app 10 Aug 2026; it had run
// there since 22 Jul and never crossed over, which is the engine-duplication
// drift AGENTS.md warns about rather than any decision.
//
// This led with `needsWork`, so a day's own draw re-served misses ON TOP of the
// spaced-review dose dueForReview() already splices in. Review arrived through
// two channels and only one of them had any spacing.
//
// The cost lands on NARROW POOLS, which this bank is now full of: tag the
// Conventions bank by ruleType and `Colon` holds three questions and `Dash`
// three. A misses-first draw re-serves the same one or two every time and the
// rest are never met — training recall of those particular answers rather than
// the rule behind them, and a score cannot tell those two apart.
//
// `opts.missesFirst` restores the old order for the two callers that want it:
//   • a Challenge set — a closed, frozen list where there is no coverage to win
//     and the only goal is mastering those exact items. challenge-core.js
//     documents its SERVE_ORDER as "exactly prioritizePool(pool,
//     { missesFirst: true })" and passes it. Before the opts parameter existed
//     here, that argument was silently DROPPED and the Challenge got the order
//     it wanted only by coincidence.
//   • a homework day where the ladder turns out to have nothing due, so misses
//     would otherwise get no channel at all that day. See homework-run.html.
function prioritizePool(pool, opts) {
    const ledger    = getProgress();
    const exposure  = getExposure();
    const needsWork = [];
    const unseenOfficial = [];
    const unseenProvisional = [];
    const metElsewhere = [];   // no ledger row, but met in a baseline or class route
    const resting   = [];

    pool.forEach(q => {
        const r = ledger[q.id];
        if (!r && _exposureFor(exposure, q)) {
            metElsewhere.push(q);
        } else if (!r) {
            const provisional = q.difficultyStatus === 'provisional';
            (provisional ? unseenProvisional : unseenOfficial).push(q);
        } else if ((r.wrong || 0) > 0 && !_isMastered(r)) {
            needsWork.push(q); // has had at least one miss
        } else {
            resting.push(q);   // previously correct — the ladder decides when it returns
        }
    });

    resting.sort((a, b) => _overdueBy(ledger[b.id]) - _overdueBy(ledger[a.id]));

    // Both groups stay drawable, but trusted College Board items lead the unseen
    // tier. Shuffle inside each group, never across the provenance boundary.
    // Items met elsewhere (getExposure) follow the truly unseen ones. They are not
    // new to her, so they must not be served as new while new material remains —
    // but they carry no ledger history, so they still lead misses and resting items.
    const unseen = [
        ..._fyShuffle(unseenOfficial),
        ..._fyShuffle(unseenProvisional),
        ..._fyShuffle(metElsewhere),
    ];

    const missesFirst = !!(opts && opts.missesFirst);
    const lead = missesFirst ? needsWork : unseen;
    const next = missesFirst ? unseen    : needsWork;

    return [
        ...(lead === unseen ? lead : _fyShuffle(lead)),
        ...(next === unseen ? next : _fyShuffle(next)),
        ...resting,
    ];
}

// Returns true when every question in the pool is currently mastered.
function isPoolAllMastered(pool) {
    if (!pool || pool.length === 0) return false;
    const ledger = getProgress();
    return pool.every(q => _isMastered(ledger[q.id]));
}

// Returns { mastered, struggling, unseen, total } counts for a given question pool.
function getPoolSummary(pool) {
    const ledger  = getProgress();
    const summary = { mastered: 0, struggling: 0, unseen: 0, total: pool.length };
    pool.forEach(q => {
        const r = ledger[q.id];
        if (!r)               summary.unseen++;
        else if (_isMastered(r)) summary.mastered++;
        else                  summary.struggling++;
    });
    return summary;
}

// Merge an imported ledger into the existing one (take higher correct, sum wrongs).
function mergeProgress(incoming) {
    if (!incoming || typeof incoming !== 'object') return;
    const existing = getProgress();
    Object.entries(incoming).forEach(([id, r]) => {
        id = _canonicalQuestionId(id);
        if (!existing[id]) {
            existing[id] = r;
        } else {
            existing[id].correct  = Math.max(existing[id].correct  || 0, r.correct  || 0);
            existing[id].wrong    = (existing[id].wrong || 0) + (r.wrong || 0);
            existing[id].lastSeen = Math.max(existing[id].lastSeen || 0, r.lastSeen || 0);
        }
    });
    _saveProgress(existing);
}

// Clear the entire ledger (use when a student wants a fresh start).
function resetLedger() {
    localStorage.removeItem(('psat89_progress_' + _hwUser()));
    try { localStorage.removeItem(('psat89_trap_stats_' + _hwUser())); } catch (e) {}
    try { localStorage.removeItem(('psat89_retention_' + _hwUser())); } catch (e) {}
}

// ── Trap analytics ────────────────────────────────────────────────
// Tallies how often a student gets caught by each trap type. Questions
// with a specific `trapName` are tracked by that name; everything else
// falls back to a per-skill bucket. Shape:
//   { [bucket]: { wrong, total, calibrationWrong, calibrationTotal, skill } }


function getTrapStats() {
    try { return JSON.parse(localStorage.getItem(('psat89_trap_stats_' + _hwUser()))) || {}; }
    catch (e) { return {}; }
}

function _saveTrapStats(stats) {
    try { localStorage.setItem(('psat89_trap_stats_' + _hwUser()), JSON.stringify(stats)); } catch (e) {}
}

// Call after every answered question that has a known skill.
function recordTrapOutcome(skill, trapName, isCorrect, includeInCalibration = true) {
    if (!skill) return;
    const bucket = (trapName && String(trapName).trim())
        ? String(trapName).trim()
        : skill + ' — general';
    const stats = getTrapStats();
    if (!stats[bucket]) stats[bucket] = { wrong: 0, total: 0, skill };
    if (stats[bucket].calibrationTotal == null) {
        stats[bucket].calibrationTotal = stats[bucket].total || 0;
        stats[bucket].calibrationWrong = stats[bucket].wrong || 0;
    }
    stats[bucket].total += 1;
    if (!isCorrect) stats[bucket].wrong += 1;
    if (includeInCalibration) {
        stats[bucket].calibrationTotal += 1;
        if (!isCorrect) stats[bucket].calibrationWrong += 1;
    }
    stats[bucket].skill = skill;
    _saveTrapStats(stats);
}

// Most-fallen-for traps: buckets with at least `minTotal` attempts,
// sorted by wrong-rate then volume. Returns [{ bucket, skill, wrong, total, rate }].
function getTopTraps(minTotal = 3, limit = 6) {
    const stats = getTrapStats();
    return Object.entries(stats)
        .map(([bucket, s]) => ({
            bucket, skill: s.skill || "",
            wrong: s.wrong || 0, total: s.total || 0,
            rate: s.total ? (s.wrong || 0) / s.total : 0,
        }))
        .filter(t => t.total >= minTotal && t.wrong > 0)
        .sort((a, b) => (b.rate - a.rate) || (b.wrong - a.wrong))
        .slice(0, limit);
}

function mergeTrapStats(incoming) {
    if (!incoming || typeof incoming !== "object") return;
    const existing = getTrapStats();
    Object.entries(incoming).forEach(([bucket, s]) => {
        if (!existing[bucket]) {
            existing[bucket] = {
                wrong: s.wrong || 0,
                total: s.total || 0,
                calibrationWrong: s.calibrationWrong == null ? (s.wrong || 0) : s.calibrationWrong,
                calibrationTotal: s.calibrationTotal == null ? (s.total || 0) : s.calibrationTotal,
                skill: s.skill || "",
            };
        } else {
            if (existing[bucket].calibrationTotal == null) {
                existing[bucket].calibrationTotal = existing[bucket].total || 0;
                existing[bucket].calibrationWrong = existing[bucket].wrong || 0;
            }
            existing[bucket].wrong += s.wrong || 0;
            existing[bucket].total += s.total || 0;
            existing[bucket].calibrationWrong += s.calibrationWrong == null ? (s.wrong || 0) : s.calibrationWrong;
            existing[bucket].calibrationTotal += s.calibrationTotal == null ? (s.total || 0) : s.calibrationTotal;
            existing[bucket].skill = s.skill || existing[bucket].skill;
        }
    });
    _saveTrapStats(existing);
}

// ── Difficulty calibration ────────────────────────────────────────
// Rolling per-skill accuracy, rebuilt from the trap buckets — every bucket already
// carries its `skill`, `total` and `wrong`, so this is the one per-skill accuracy
// the app has. (The mastery ledger is keyed by question id and does not know what
// skill a question is.)
// Returns { [skill]: { correct, total, rate } }.
function getSkillAccuracy() {
    const out = {};
    Object.values(getTrapStats()).forEach(s => {
        const skill = s.skill;
        if (!skill) return;
        const total = s.calibrationTotal == null ? (s.total || 0) : s.calibrationTotal;
        const wrong = s.calibrationWrong == null ? (s.wrong || 0) : s.calibrationWrong;
        if (!out[skill]) out[skill] = { correct: 0, total: 0, rate: 0 };
        out[skill].total   += total;
        out[skill].correct += total - wrong;
    });
    Object.values(out).forEach(v => { v.rate = v.total ? v.correct / v.total : 0; });
    return out;
}

// ~85% success is where learning is maximised: below ~80% is overload and
// demoralisation, above ~90% there is no desirable difficulty left and the student
// is just being told what they already know (`AS-4`).
//
// This returns a BIAS — 'up' | 'hold' | 'down' — and never a difficulty. The tutor's
// homework day says which difficulties are allowed; calibration only chooses within
// what the day already permits. A day that pins one difficulty is a decision, not a
// range, and nothing here may touch it: never override the tutor.
//
// MIN_CALIBRATION_ATTEMPTS exists because 3-for-3 on a skill is a coin landing
// heads three times, not evidence of cruising. Under the threshold we hold, so a
// student's first day on a new skill runs exactly as authored.
const MIN_CALIBRATION_ATTEMPTS = 8;
const CALIBRATE_UP_ABOVE       = 0.90;
const CALIBRATE_DOWN_BELOW     = 0.80;

// `skills` is a skill name or an array of them. A section naming several skills is
// calibrated off their combined accuracy — one bias for the one draw it controls.
function recommendDifficulty(skills) {
    const names = Array.isArray(skills) ? skills : [skills];
    const acc   = getSkillAccuracy();
    let correct = 0, total = 0;
    names.forEach(n => {
        const a = acc[n];
        if (a) { correct += a.correct; total += a.total; }
    });
    if (total < MIN_CALIBRATION_ATTEMPTS) return 'hold';
    const rate = correct / total;
    if (rate > CALIBRATE_UP_ABOVE)   return 'up';
    if (rate < CALIBRATE_DOWN_BELOW) return 'down';
    return 'hold';
}

function _fyShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
