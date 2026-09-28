import type { AgentRow, Session, SessionState } from './types';
//TODO:  implement waitingCount function
export const projectName = (cwd: string): string => {
  if (!cwd) return 'unknown';
  const splitted = cwd.split(/[\\/]/);
  const lastPart = splitted.filter((c) => c !== '').pop();
  return lastPart || cwd;
};
const toSession = (row: AgentRow, computerId: string): Session | null => {
  let state: SessionState | undefined;
  const stateMap: Record<AgentRow['kind'], Record<string, SessionState>> = {
    interactive: {
      waiting: 'waiting',
      idle: 'finished',
      busy: 'working',
    },
    background: {
      blocked: 'waiting',
      done: 'finished',
      stopped: 'finished',
      failed: 'finished',
      working: 'working',
    },
  };
  if (row.kind === 'interactive') {
    if (!row.status) return null;
    state = stateMap.interactive[row.status];
  }
  if (row.kind === 'background') {
    if (!row.state) return null;
    state = stateMap.background[row.state];
  }
  if (!state) return null;
  return {
    id: row.sessionId,
    name: row.name || projectName(row.cwd),
    project: projectName(row.cwd),
    state: state,
    since: row.startedAt,
    computerId,
    // waitingFor: row.waitingFor as any,
  };
};

export const deriveSessions = (
  rows: AgentRow[],
  computerId: string,
  now: number,
): Session[] => {
  const stateRank: Record<SessionState, number> = {
    waiting: 0,
    working: 2,
    finished: 1,
  };
  return rows
    .map((row) => toSession(row, computerId))
    .filter((s) => s !== null)
    .sort((a, b) => {
      return (
        stateRank[a.state] - stateRank[b.state] ||
        a.since - b.since ||
        a.id.localeCompare(b.id)
      );
    });
};

export const waitingCount = (sessions: Session[]): number => {
  return sessions.filter((s) => s.state === 'waiting').length;
};
