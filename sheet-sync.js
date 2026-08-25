// sheet-sync.js — fire-and-forget upload of completed sessions/homework
// to the tutor-owned Google Sheet (via Apps Script Web App).
// Set SHEET_SYNC_ENDPOINT = '' to disable upload entirely.

const SHEET_SYNC_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbww5MvDsh6crhh4LxE5lapi4LD2OAAFeB1zghjKEWghUc3rBbkAguhFuArIx5ndLccz/exec';   // tutor sync + sheet-based assignments

const SHEET_SYNC_SECRET = '';

function syncSessionToSheet(record) {
    if (!SHEET_SYNC_ENDPOINT) return;
    if (!record) return;

    // Whoever is signed in NOW is usually the right answer, but not always. A
    // baseline recovered from this browser months later belongs to the student
    // who sat it, not to whoever happens to be logged in while it is backfilled
    // — and a record sat before the screener was gated is filed under "guest",
    // so the caller is the only thing that knows the real name. An explicit
    // record.student therefore wins.
    let student = '';
    try { student = sessionStorage.getItem('psat89_user') || ''; } catch (e) { }
    if (record.student) student = record.student;

    const payload = {
        date: record.date || new Date().toISOString(),
        student,
        type: record.source || 'practice',
        // The script derives the "Day / Focus / Skills" cell as
        // `data.focus || skills.join(', ')`, so `focus` was never sent from here
        // and the column always fell back to the skill list. It is named now
        // because logPartialSession() marks an unfinished sitting there — the
        // only place a marker can land without a ninth column and a redeploy.
        focus: record.focus || '',
        // An unfinished sitting flushed by pagehide. Rides in Raw payload as
        // well as in the focus cell, so a script that later learns to read it
        // can supersede the partial row using the shared sessionId.
        partial: !!record.partial,
        sessionId: record.sessionId || '',
        assignmentId: record.assignmentId || '',
        assignmentTitle: record.assignmentTitle || '',
        score: record.score ?? '',
        total: record.total ?? '',
        pct: record.pct ?? '',
        skills: Array.isArray(record.skills) ? record.skills : [],
        diffs: Array.isArray(record.diffs) ? record.diffs : [],
        mode: record.mode || '',
        duration: record.duration ?? '',
        // The Apps Script's Seconds column reads `seconds`. Homework posts that
        // key directly and has always filled the column; everything routed
        // through here posted only `duration`, so the Sessions tab's Seconds
        // column has been blank for every practice session ever logged.
        seconds: record.seconds ?? record.duration ?? '',
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
    // Marks a row backfilled from a device long after the fact, so a late
    // arrival in the sheet is not read as a sitting that happened today.
    if (record.recovered) payload.recovered = true;
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