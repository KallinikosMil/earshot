import { deriveSessions, projectName, waitingCount } from '../derive';
import type { AgentRow } from '../types';

describe('projectName', () => {
  test('takes the last folder', () => {
    expect(projectName('C:\\Users\\k\\research')).toBe('research');
  });

  test('survives a trailing separator', () => {
    expect(projectName('/Users/k/earshot/')).toBe('earshot');
  });

  test('empty becomes unknown', () => {
    expect(projectName('')).toBe('unknown');
  });

  test('input / output /', () => {
    expect(projectName('/')).toBe('/');
  });
});

// A complete, valid row. Each test overrides only what it cares about.
const row = (over: Partial<AgentRow>): AgentRow => ({
  sessionId: 'a',
  cwd: '/p/app',
  kind: 'interactive',
  startedAt: 1000,
  status: 'busy',
  ...over,
});

describe('deriveSessions', () => {
  test('busy becomes working', () => {
    const [s] = deriveSessions([row({ status: 'busy' })], 'pc', 0);
    expect(s.state).toBe('working');
  });

  test('a row with no status is dropped', () => {
    expect(deriveSessions([row({ status: undefined })], 'pc', 0)).toEqual([]);
  });

  test('waiting comes first', () => {
    const out = deriveSessions(
      [
        row({ sessionId: 'b', status: 'busy' }),
        row({ sessionId: 'w', status: 'waiting' }),
      ],
      'pc',
      0,
    );
    expect(out.map((s) => s.id)).toEqual(['w', 'b']);
  });
  test('longest wait comes first', () => {
    const out = deriveSessions(
      [
        row({ sessionId: 'new', status: 'waiting', startedAt: 5000 }),
        row({ sessionId: 'old', status: 'waiting', startedAt: 1000 }),
      ],
      'pc',
      0,
    );
    expect(out.map((s) => s.id)).toEqual(['old', 'new']);
  });

  test('equal times sort by id, whatever the input order', () => {
    const rows = [
      row({ sessionId: 'zeta', status: 'waiting', startedAt: 7000 }),
      row({ sessionId: 'alpha', status: 'waiting', startedAt: 7000 }),
    ];
    expect(deriveSessions(rows, 'pc', 0).map((s) => s.id)).toEqual([
      'alpha',
      'zeta',
    ]);
    expect(
      deriveSessions([...rows].reverse(), 'pc', 0).map((s) => s.id),
    ).toEqual(['alpha', 'zeta']);
  });
  test('carries waitingFor only when waiting', () => {
    const [w, b] = deriveSessions(
      [
        row({ sessionId: 'w', status: 'waiting', waitingFor: 'input needed' }),
        row({ sessionId: 'b', status: 'busy', waitingFor: 'input needed' }),
      ],
      'pc',
      0,
    );
    expect(w.waitingFor).toBe('input needed');
    expect(b.waitingFor).toBeUndefined();
  });

  test('drops a waitingFor value we do not know', () => {
    const [s] = deriveSessions(
      [row({ status: 'waiting', waitingFor: 'something new' })],
      'pc',
      0,
    );
    expect(s.waitingFor).toBeUndefined();
  });
});

describe('waitingCount', () => {
  test('counts only waiting', () => {
    const out = deriveSessions(
      [
        row({ sessionId: '1', status: 'waiting' }),
        row({ sessionId: '2', status: 'idle' }),
      ],
      'pc',
      0,
    );
    expect(waitingCount(out)).toBe(1);
  });

  test('an empty list is zero', () => {
    expect(waitingCount([])).toBe(0);
  });
});
