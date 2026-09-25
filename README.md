# Earshot

See every coding agent you have running, and know which one is waiting for you.

Earshot watches the Claude Code sessions on your own machines and shows them in one place: who
is working, who finished, and who has been blocked on you — and for how long. When one needs a
decision, your phone tells you, and you can allow or deny the tool call without getting up.

**Status:** in development — not released. Android first.

## How it works

A Claude Code plugin on your machine reads session state through the documented
`claude agents --json` interface and sends a snapshot straight to your phone. Nothing is stored
on a server: the only thing that ever touches one is a six-character pairing code, deleted the
moment it is used, and an in-flight permission answer that lives for under a minute.

## Stack

- Expo SDK 57, TypeScript (strict), Expo Router
- Reanimated for the scene, FCM for delivery, SQLite on device
- A Claude Code plugin (Node) as the reporter — hooks for latency, a poll for truth
- Accessibility is a product requirement: the scene is read as a list by a screen reader, colour
  never carries meaning alone, and the count of what is waiting renders before and independently
  of any artwork.

## Run

```bash
npm ci
npx expo start --android
```

## Development

- Every change goes through a pull request; CI runs typecheck, lint and tests; PRs get an
  automated review.
- `npm run lint` · `npm run format`
- Conventions for contributors and reviewers: [CLAUDE.md](./CLAUDE.md)
