# CLAUDE.md

See [AGENTS.md](AGENTS.md). It holds the working rules for this app —
they are not Claude-specific, so they live in the file every assistant reads.

The short version:

- **This repo is public. The gate names in `gate.js` are the only personal names it may contain** —
  never add another, in code, comments, docs, or a commit message, and never explain where one came
  from. Old commits break this; they are not precedent. Plans are keyed by the gate name.
- This app and its sister app run the **same homework engine from separate files**. Change one,
  change both, run both test suites.
- **Run the tests.** They exist because things broke silently. `homework/*.test.js`.
- Assigning homework means editing `homework/assignments.js` and nothing else.
- A homework day naming **more than one skill must use `sections`**, or the set silently
  collapses to one skill.
- The runner is a learning loop: predict → answer → see why → review the misses → redo. Do not
  reduce it to a quiz.
