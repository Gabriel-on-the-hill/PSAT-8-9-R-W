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

function saveBaseline(record) {
    const list = getBaselines();
    list.push({ ...record, version: BASELINE_STORE_VERSION, savedAt: Date.now() });
    _saveBaselines(list);
    return list.length;
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

// The plan the rest of the app reads. Written separately from the record so
// homework generation never has to parse a full sitting.
function saveFocusQueue(queue) {
    try {
        localStorage.setItem('psat89_focus_' + _blUser(), JSON.stringify({
            at: Date.now(),
            skills: queue.map(q => ({
                skill: q.skill, band: q.band,
                weight: q.weight, score: q.priorityScore,
            })),
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
        firstBaseline, latestBaseline, baselineDelta,
        saveFocusQueue, getFocusQueue, BASELINE_STORE_VERSION,
    };
}
