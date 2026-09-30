import {
  buildSnapshot,
  encodeSnapshot,
  FCM_LIMIT,
  MAX_SESSIONS,
} from '../snapshot';
import type { Session } from '../types';

const NOW = Date.UTC(2026, 8, 25, 12);

// UTF-8 size of a string: what FCM counts. Works in Node and on the phone.
const bytes = (s: string) => new TextEncoder().encode(s).length;

const session = (i: number, over: Partial<Session> = {}): Session => ({
  id: `session-${i}`,
  name: `a-fairly-long-session-name-${i}`,
  project: `project-${i}`,
  state: 'working',
  since: NOW - i * 60_000,
  computerId: 'pc',
  ...over,
});

const build = (
  sessions: Session[],
  decision?: Parameters<typeof buildSnapshot>[0]['decision'],
) =>
  buildSnapshot({
    sessions,
    computerId: 'pc',
    computerName: 'DESKTOP-KALLI',
    takenAt: NOW,
    decision,
  });

test('keeps the order it was given and caps at 20', () => {
  const s = build(Array.from({ length: 40 }, (_, i) => session(i)));
  expect(s.sessions).toHaveLength(MAX_SESSIONS);
  expect(s.sessions[0].id).toBe('session-0');
  expect(s.more).toBe(20);
});

test('more is zero when nothing was dropped', () => {
  expect(build([session(1)]).more).toBe(0);
});

test('a small snapshot is left untouched', () => {
  const s = build([session(1, { lastLine: 'done' })]);
  expect(s.sessions[0].lastLine).toBe('done');
});

test('RF-3 forty sessions with long English lines still fit', () => {
  const long =
    'I have finished the refactor and there are two things worth checking before we continue, ' +
    'the first is the cache invalidation and the second is the migration order';
  const s = build(
    Array.from({ length: 40 }, (_, i) =>
      session(i, { state: 'finished', lastLine: long, lastLineAt: NOW }),
    ),
  );
  expect(bytes(encodeSnapshot(s))).toBeLessThan(FCM_LIMIT);
});

test('RF-3 Greek lines count in bytes, not characters', () => {
  // Greek letters are 2 bytes each. Short names leave room for long lines, so an
  // implementation that counts .length instead of bytes overflows here.
  const greek =
    'Τελείωσα την αναδιάρθρωση και υπάρχουν δύο πράγματα να ελέγξουμε πριν συνεχίσουμε, ' +
    'πρώτα την ακύρωση της μνήμης και μετά τη σειρά των μεταναστεύσεων';
  const s = build(
    Array.from({ length: 20 }, (_, i) =>
      session(i, {
        name: 'n',
        project: 'p',
        state: 'finished',
        lastLine: greek,
      }),
    ),
  );
  expect(bytes(encodeSnapshot(s))).toBeLessThan(FCM_LIMIT);
});

test('a shortened line ends in an ellipsis and never splits an emoji', () => {
  // an emoji is two UTF-16 units; cutting between them leaves half a character.
  // Different prefixes move where the cut lands, so one of them hits the middle.
  for (const prefix of ['', 'x', 'xx', 'xxx']) {
    const s = build(
      Array.from({ length: 20 }, (_, i) =>
        session(i, {
          name: 'n',
          project: 'p',
          lastLine: prefix + '🤖'.repeat(300),
        }),
      ),
    );
    const line = s.sessions[0].lastLine ?? '';
    expect(line.endsWith('…')).toBe(true);
    expect(
      Array.from(line).every((ch) => ch === 'x' || ch === '🤖' || ch === '…'),
    ).toBe(true);
  }
});

test('a decision rides along with the command verbatim', () => {
  const s = build(
    [session(1, { state: 'waiting', waitingFor: 'permission prompt' })],
    {
      id: 'd1',
      sessionId: 'session-1',
      tool: 'Bash',
      command: 'rm -rf build/',
      expiresAt: NOW + 45_000,
    },
  );
  expect(s.decision?.command).toBe('rm -rf build/');
  expect(bytes(encodeSnapshot(s))).toBeLessThan(FCM_LIMIT);
});

test('the version travels so an old app can refuse a new shape', () => {
  expect(build([]).v).toBe(1);
});
