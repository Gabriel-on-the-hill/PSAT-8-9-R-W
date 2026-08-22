// ══════════════════════════════════════════════════════════════════
// baseline-store.js — the record that survives the page
//
// The old baseline painted its diagnosis into the DOM and stopped. Refresh and
// it was gone. There was no "then vs. now", nothing for the tutor dashboard,
// and no starting anchor for a parent report — which is the single thing a
// baseline exists to provide.
//
// One record per sitting, appended. Never overwrite: the first baseline is the
// anchor and a retake is a second data point, not a correction.
// ══════════════════════════════════════════════════════════════════

const BASELINE_STORE_VERSION = 2;

function _blUser() {
    try { return sessionStorage.getItem('psat89_user') || 'guest'; }
    catch (e) { return 'guest'; }
}

function _blKey() { return 'psat89_baseline_' + _blUser(); }

function getBaselines() {
    try { return JSON.parse(localStorage.getItem(_blKey())) || []; }
    catch (e) { return []; }
}

function _saveBaselines(list) {
    try { localStorage.setItem(_blKey(), JSON.stringify(list)); return true; }
    catch (e) { console.error('baseline: could not save', e); return false; }
}

// Which form this student has not sat yet. A retake that re-serves the same 22
// questions measures memory, so the form advances every sitting.
function nextBaselineForm() {
    const taken = getBaselines().map(b => b.form);
    const fresh = BASELINE_FORMS.find(f => !taken.includes(f));
    return fresh || BASELINE_FORMS[taken.length % BASELINE_FORMS.length];
}

// `sitting` is stamped here rather than computed at report time, because the
// only place that knows it is the device the sitting happened on. A record
// recovered months later, or exported and re-imported, still knows it was the
// second baseline this student sat — and the tutor sheet needs that to tell a
// retake from a first reading without joining rows by date.
function saveBaseline(record) {
    const list = getBaselines();
    list.push({
        ...record,
        sitting: list.length + 1,
        version: BASELINE_STORE_VERSION,
        savedAt: Date.now(),
    });
    _saveBaselines(list);
    return list.length;
}

// Merge, never replace. A restore must not drop a sitting the device already
// has, and re-importing the same file twice must not create a duplicate — so
// records are keyed on (takenAt, form) and the list is kept in date order.
function mergeBaselines(incoming) {
    if (!Array.isArray(incoming) || !incoming.length) return false;
    const list = getBaselines();
    const seen = new Set(list.map(b => String(b.takenAt) + '|' + b.form));
    let added = 0;
    incoming.forEach(b => {
        if (!b || typeof b !== 'object') return;
        const key = String(b.takenAt) + '|' + b.form;
        if (seen.has(key)) return;
        seen.add(key);
        list.push(b);
        added++;
    });
    if (!added) return false;
    list.sort((a, b) => (a.takenAt || 0) - (b.takenAt || 0));
    _saveBaselines(list);
    return true;
}

function firstBaseline() { return getBaselines()[0] || null; }
function latestBaseline() { const l = getBaselines(); return l[l.length - 1] || null; }

// Update the newest record in place — used when the follow-up probes come back
// after the screener has already been written. The screener result must be
// durable the moment it finishes, not held in memory pending a stage the
// student may never choose to sit.
function amendLatestBaseline(patch) {
    const list = getBaselines();
    if (!list.length) return false;
    list[list.length - 1] = { ...list[list.length - 1], ...patch, amendedAt: Date.now() };
    return _saveBaselines(list);
}

// Growth against the anchor, per skill. This is the comparison the old build
// could not make at all.
function baselineDelta() {
    const list = getBaselines();
    if (list.length < 2) return null;
    const a = list[0], b = list[list.length - 1];
    const out = { from: a.takenAt, to: b.takenAt, skills: {}, projection: null };
    Object.keys(b.skills || {}).forEach(s => {
        const was = a.skills && a.skills[s] ? a.skills[s].band : null;
        const now = b.skills[s].band;
        if (!was || !now) return;
        out.skills[s] = {
            was, now,
            moved: (BASELINE_BANDS[now]?.rank ?? 0) - (BASELINE_BANDS[was]?.rank ?? 0),
        };
    });
    if (a.projection && b.projection) {
        out.projection = {
            was: [a.projection.low, a.projection.high],
            now: [b.projection.low, b.projection.high],
            // Only claim movement when the two bands do not overlap. Inside a
            // 60-point band the difference is instrument noise, and telling a
            // parent otherwise is how a baseline loses its credibility.
            meaningful: b.projection.low > a.projection.high
                     || b.projection.high < a.projection.low,
        };
    }
    return out;
}

// ── the sheet payload, built from a SAVED record ──────────────────
// Deliberately takes the stored record rather than live page state, so a row
// recovered months later is byte-identical to the one that would have gone up
// at the time. baseline.html saves first and reports from what it saved;
// baseline-recover.html reports from what it finds. One code path, one shape.
//
// `student` is passed in rather than read from sessionStorage because a record
// sat before the screener was gated may be filed under 'guest' — the recovery
// page has to be able to say who it actually belonged to.
function baselineSheetPayload(rec, student) {
    if (!rec) return null;
    const items = Array.isArray(rec.items) ? rec.items : [];
    const stage1 = items.filter(i => i.stage === 1);

    const skillStats = {};
    stage1.forEach(i => {
        const s = skillStats[i.skill] || (skillStats[i.skill] = { correct: 0, total: 0 });
        s.total++; if (i.correct) s.correct++;
    });

    const bands = {};
    Object.entries(rec.skills || {}).forEach(([skill, s]) => {
        bands[skill] = {
            band: s.band, confidence: s.confidence,
            screener: (s.screenCorrect != null ? s.screenCorrect : '?') + '/'
                    + (s.screenTotal != null ? s.screenTotal : '?'),
            probe: s.probeTier ? (s.probeTier + ':' + (s.probeCorrect ? 'passed' : 'missed')) : '',
            note: s.note || '',
        };
    });

    const correct = stage1.filter(i => i.correct).length;
    const total   = stage1.length;
    const seconds = items.reduce((s, i) => s + (i.seconds || 0), 0);
    const proj    = rec.projection || {};

    return {
        date: new Date(rec.takenAt || rec.savedAt || Date.now()).toISOString(),
        student: student || '',
        source: 'baseline',
        mode: rec.stage || 'screener',
        assignmentTitle: 'Baseline Screener · Form ' + (rec.form || '?'),
        score: correct,
        total: total,
        pct: total ? Math.round(correct / total * 100) : 0,
        skills: Object.keys(skillStats),
        diffs: [...new Set(items.map(i => i.difficulty).filter(Boolean))],
        duration: seconds,
        seconds: seconds,
        avgSecs: items.length ? Math.round(seconds / items.length) : 0,
        skillStats: skillStats,
        questions: items.map(i => ({
            id: i.id, skill: i.skill, difficulty: i.difficulty,
            chosen: i.chosen, isCorrect: i.correct, secs: i.seconds,
            stage: i.stage, probeTier: i.probeTier || '',
        })),
        baseline: {
            form: rec.form,
            // Which sitting this is. Without it the sheet cannot tell a first
            // reading from a retake except by joining rows on date, and a
            // backfilled row lands with the wrong date to join on.
            sitting: rec.sitting,
            stage: rec.stage,
            takenAt: rec.takenAt,
            projectionLow: proj.low,
            projectionHigh: proj.high,
            accuracy: proj.accuracy,
            bands: bands,
            // The ranked plan, not just the bands it was derived from. The
            // queue was being written to localStorage and posted nowhere, so a
            // tutor could see that a skill was Priority but not that it was the
            // FIRST thing to teach — which is the whole output of the exercise
            // and the one thing they were meant to act on. Read off the stored
            // record so a recovered row carries the plan that was current when
            // the baseline was sat, not one recomputed against a later bank.
            focus: Array.isArray(rec.focus) ? rec.focus : [],
        },
    };
}

// One shape for the plan, used by the live key, the stored record and the sheet
// payload alike. Three hand-rolled projections of the same list is how the
// dashboard and the app end up disagreeing about what the plan was.
function slimFocusQueue(queue) {
    return (queue || []).map(q => ({
        skill: q.skill, band: q.band,
        weight: q.weight, score: q.priorityScore,
    }));
}

// The plan the rest of the app reads. Written separately from the record so
// homework generation never has to parse a full sitting.
function saveFocusQueue(queue) {
    try {
        localStorage.setItem('psat89_focus_' + _blUser(), JSON.stringify({
            at: Date.now(),
            skills: slimFocusQueue(queue),
        }));
        return true;
    } catch (e) { return false; }
}

function getFocusQueue() {
    try { return JSON.parse(localStorage.getItem('psat89_focus_' + _blUser())) || null; }
    catch (e) { return null; }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getBaselines, saveBaseline, amendLatestBaseline, nextBaselineForm,
        firstBaseline, latestBaseline, baselineDelta, baselineSheetPayload,
        mergeBaselines,
        saveFocusQueue, getFocusQueue, slimFocusQueue, BASELINE_STORE_VERSION,
    };
}
