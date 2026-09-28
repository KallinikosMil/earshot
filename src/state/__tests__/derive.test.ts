import { deriveSessions, projectName, waitingCount } from '../derive';
import type { AgentRow } from '../types';

describe('projectName', () => {
  test('takes the last folder', () => {
    expect(projectName('C:\Users\k\research')).toBe('research');
  });

  test('survives a trailing separator', () => {
    expect(projectName('/Users/k/earshot/')).toBe('earshot');
  });

  test('empty becomes unknown', () => {
    expect(projectName('')).toBe('unknown');
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
