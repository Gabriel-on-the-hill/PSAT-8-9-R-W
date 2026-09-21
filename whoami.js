// ─────────────────────────────────────────────────────────────────
// whoami.js  —  Who is this session, with no gate in front of it.
//
// This replaces the identity half of the old gate.js. The password gate is
// gone: nothing here blocks, prompts or hides the page. All it does is work
// out a name for the session, because a great deal downstream is keyed to
// one:
//
//   storage.js / progress.js   namespace saved progress per student
//   baseline-store.js          saves the screener to psat89_baseline_<name>
//   sheet-sync.js              attributes the row posted to the tutor sheet
//   homework-hub.html          picks the student's assignments
//   challenge/challenge.js     labels the challenge record
//
// Without a name every one of those silently collapses to "guest": three
// students' progress merged into one bucket, and tutor-sheet rows posted as
// "(unknown)".
//
// How the name is set, in order:
//   1. ?user=Maysa on the URL — hand each student their own bookmark once.
//   2. A name already set on this tab's session — never clobbered, so a page
//      opened from another one keeps whoever was already working.
//   3. Whatever was used last in this browser (localStorage).
//   4. "guest".
//
// It is remembered per browser, so the query string is needed once, not
// every visit. To point a shared browser at someone else, open any page with
// a new ?user=. Nothing here is a security boundary and it is not meant to
// be one — it is bookkeeping, and anyone can type any name they like.
// ─────────────────────────────────────────────────────────────────

(function () {
    var SESSION_KEY = 'psat89_user';     // read by storage.js, sheet-sync.js, et al.
    var REMEMBER_KEY = 'psat89_user_last';

    function clean(name) {
        if (!name) return '';
        // First names only — the tutor sheet and the old watermark both
        // assumed a short label, and a stray query string shouldn't be able
        // to push arbitrary length or markup into either.
        return String(name).replace(/[^A-Za-z '-]/g, '').trim().slice(0, 24);
    }

    function titleCase(name) {
        return name.replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    }

    var fromUrl = '';
    try {
        fromUrl = clean(new URLSearchParams(location.search).get('user'));
    } catch (e) { /* older browser or no search params — fall through */ }
    if (fromUrl) fromUrl = titleCase(fromUrl);

    // Only a name off the URL is untrusted input, so only that one is cleaned.
    // A name already in storage was put there deliberately — by an earlier page,
    // or by a test harness — and is passed through exactly as found.
    var name = fromUrl;
    if (!name) {
        // Don't overwrite a name this tab already has.
        try { name = sessionStorage.getItem(SESSION_KEY) || ''; } catch (e) {}
    }
    if (!name) {
        try { name = localStorage.getItem(REMEMBER_KEY) || ''; } catch (e) {}
    }
    if (!name) name = 'guest';

    try { sessionStorage.setItem(SESSION_KEY, name); } catch (e) {}
    if (fromUrl) {
        try { localStorage.setItem(REMEMBER_KEY, name); } catch (e) {}
    }

    // The hub shows this, and a couple of pages read it directly.
    window.psatUser = name;

    // gate.js exposed this for the hub's "Lock" link. The link is gone with
    // the gate; the stub stays so any page still calling it clears the
    // remembered name instead of throwing.
    window.lockMastery = function () {
        try {
            sessionStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(REMEMBER_KEY);
        } catch (e) {}
        location.reload();
    };
})();
