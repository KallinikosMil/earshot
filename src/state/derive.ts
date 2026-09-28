import type { AgentRow, Session } from './types';
//TODO: Fix projectName and then implement deriveSessions and waitingCount functions
export const projectName = (cwd: string): string => {
  if (!cwd) return 'unknown';
  const splitted = cwd.split(/[\\/]/);
  const lastPart = splitted.filter((c) => c !== '').pop();
  return lastPart || '';
};

export const deriveSessions = (
  rows: AgentRow[],
  computerId: string,
  now: number,
): Session[] => {
  // εδώ
};

export const waitingCount = (sessions: Session[]): number => {
  // εδώ
};
