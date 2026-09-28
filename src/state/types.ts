// types.ts — the app's shape, not the CLI's
export type SessionState = 'waiting' | 'finished' | 'working';
export type WaitingFor =
  | 'permission prompt'
  | 'input needed'
  | 'sandbox requested'
  | 'worker request'
  | 'dialog open';
export type Session = {
  id: string; // Session id from the CLI
  name: string; // display name, else the cwd basename (RF-1)
  project: string; // cwd basename, always
  state: SessionState;
  since: number; // epoch ms the session entered this state
  computerId: string;
  waitingFor?: WaitingFor;
  lastLine?: string;
  lastLineAt?: number;
};
export type AgentRow = {
  sessionId: string;
  cwd: string;
  kind: 'interactive' | 'background';
  startedAt: number;
  status?: 'busy' | 'waiting' | 'idle';
  waitingFor?: string;
  state?: string;
  name?: string;
};
