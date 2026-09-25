# Earshot — engineering standards

A board for the Claude Code sessions running on your own machines: who is working, who finished,
who is blocked on you and for how long, with a push when one blocks and allow/deny from the
phone. Expo SDK 57, TypeScript strict, Expo Router, Android first. The reporter is a Claude Code
plugin written in Node. Accessibility is a product requirement, and so is being honest about
what we do not know.

@AGENTS.md

## Standards

**Reading session state.** `claude agents --json` is the only source of truth. Never parse
`~/.claude/jobs/` or transcript `.jsonl` — both are internal and documented as unstable. Hooks
exist only to make a transition arrive sooner; every hook does the same thing, so a missed or
duplicated event must cost nothing.

**Never write to a live session.** `claude --resume <id> -p` against a running session
interleaves two streams into one transcript. The only write path we use is a hook returning a
permission decision. No exceptions, no experiments on real sessions.

**Transport.** Every push carries a full snapshot, never a delta; the phone replaces its store
rather than merging. One collapse key for the whole app. Transitions are debounced before
sending. High priority only for transitions into `waiting`.

**Security.** The relay may only carry a decision the paired device sent — it can never
originate one. Decision rows are single-use, bound to one device, deleted on read. The phone
always shows the tool name and the command text verbatim; never a summary or a hash. Silence
must never approve anything.

**Honesty in the UI.** When a machine goes quiet we say so and freeze what we last knew; we do
not guess, and we do not dim data into ambiguity. A sleeping laptop and a crashed agent are
indistinguishable from the phone and the UI says that in words.

**The scene.** Information is structural, art is not. The waiting count renders before the scene
and independently of it, and every waiting session also appears as a card with its real words.
Colour is given only to `waiting`. A skin supplies places and traits over a fixed state model; a
skin can never change what a state means.

**Accessibility.** Interactive elements declare `accessibilityRole` and, where the visible text
is not the label, `accessibilityLabel`. Each character in the scene is one node with a full
sentence. Touch targets ≥ 44 dp. Meaning is never conveyed by colour alone. Motion respects the
system reduce-motion setting. Text scales with the system font.

**Formatting.** Elapsed times, dates and counts go through `Intl` with the user's locale.

**Copy.** User-facing strings live in i18n resources (`el`, `en`), never inline. Strings that
come from Claude Code — `waitingFor` values, the plugin trust warning — are quoted verbatim and
never rewritten.

**State.** Device-derived state lives in one store with explicit persistence; UI state stays
local. Loading, empty, unpaired, blocked-by-organisation and no-news are distinct UI states.

## Review scope

Reviews focus on the standards above and on correctness. Formatting and style are owned by
Prettier and ESLint and enforced in CI; they are not review topics. Naming is not debated when
it is clear.

## Workflow

- Conventional Commits: `feat` / `fix` / `chore` / `ci` / `docs`. Squash merge; one commit per PR.
- Layout: `src/app` (routes), `src/components`, `src/scene`, `src/state`, `src/push`, `src/hooks`,
  `src/theme`, `src/i18n`, `plugin/` (the Claude Code plugin and its reporter). Named exports,
  except route files.
- `npm run lint`, `npm test` and `npm run format` are clean before a PR is opened.
- Node version is pinned in `.nvmrc`; CI reads it from there.
- LF line endings, enforced by `.gitattributes`.
- No secrets in the repository.
