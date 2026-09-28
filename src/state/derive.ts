import type { AgentRow, Session, SessionState } from './types';
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
const stateRank: Record<SessionState, number> = {
  waiting: 0,
  finished: 1,
  working: 2,
};
export const projectName = (cwd: string): string => {
  if (!cwd) return 'unknown';
  const splitted = cwd.split(/[\\/]/);
  const lastPart = splitted.filter((c) => c !== '').pop();
  return lastPart || cwd;
};
const toSession = (row: AgentRow, computerId: string): Session | null => {
  let state: SessionState | undefined;
  if (row.kind === 'interactive') {
    if (!row.status) return null;
    state = stateMap.interactive[row.status];
  }
  if (row.kind === 'background') {
    if (!row.state) return null;
    state = stateMap.background[row.state];
  }
  if (!state) return null;
  const isWaitingFor = (v: string | undefined): v is Session['waitingFor'] => {
    if (!v) return false;
    return [
      'permission prompt',
      'input needed',
      'sandbox request',
      'worker request',
      'dialog open',
    ].includes(v);
  };
  return {
    id: row.sessionId,
    name: row.name || projectName(row.cwd),
    project: projectName(row.cwd),
    state: state,
    since: row.startedAt,
    computerId,
    waitingFor:
      state === 'waiting' && isWaitingFor(row.waitingFor)
        ? row.waitingFor
        : undefined,
  };
};

export const deriveSessions = (
  rows: AgentRow[],
  computerId: string,
  now: number,
): Session[] => {
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
