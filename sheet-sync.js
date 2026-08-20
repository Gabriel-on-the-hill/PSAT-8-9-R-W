// sheet-sync.js — fire-and-forget upload of completed sessions/homework
// to the tutor-owned Google Sheet (via Apps Script Web App).
// Set SHEET_SYNC_ENDPOINT = '' to disable upload entirely.

const SHEET_SYNC_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbww5MvDsh6crhh4LxE5lapi4LD2OAAFeB1zghjKEWghUc3rBbkAguhFuArIx5ndLccz/exec';   // tutor sync + sheet-based assignments

const SHEET_SYNC_SECRET = '';

function syncSessionToSheet(record) {
    if (!SHEET_SYNC_ENDPOINT) return;
    if (!record) return;

    let student = '';
    try { student = sessionStorage.getItem('psat89_user') || ''; } catch (e) { }

    const payload = {
        date: record.date || new Date().toISOString(),
        student,
        type: record.source || 'practice',
        assignmentId: record.assignmentId || '',
        assignmentTitle: record.assignmentTitle || '',
        score: record.score ?? '',
        total: record.total ?? '',
        pct: record.pct ?? '',
        skills: Array.isArray(record.skills) ? record.skills : [],
        diffs: Array.isArray(record.diffs) ? record.diffs : [],
        mode: record.mode || '',
        duration: record.duration ?? '',
        avgSecs: record.avgSecs ?? '',
        skillStats: record.skillStats || {},
        blurCount: record.blurCount ?? '',
        questions: Array.isArray(record.questions) ? record.questions : [],
    };
    // The baseline screener carries things a practice session has no concept of:
    // a per-skill band, a projected score RANGE, and which parallel form was
    // sat. This payload is built key by key, so anything not named here is
    // dropped — which is why the baseline reached localStorage and nothing else.
    if (record.baseline) payload.baseline = record.baseline;
    if (SHEET_SYNC_SECRET) payload.secret = SHEET_SYNC_SECRET;

    try {
        fetch(SHEET_SYNC_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            redirect: 'follow',
            cache: 'no-store',
            body: JSON.stringify(payload),
            keepalive: true,
        })
            .then(() => { console.log('[sync] posted:', payload.type); })
            .catch(err => { console.warn('[sync] upload failed (silent):', err); });
    } catch (e) {
        console.warn('[sync] threw synchronously:', e);
    }
}