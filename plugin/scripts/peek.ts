import { execFileSync } from 'node:child_process';
import { hostname } from 'node:os';
import { deriveSessions } from '../../src/state/derive';
import type { AgentRow } from '../../src/state/types';

const output = execFileSync('claude', ['agents', '--json'], {
  encoding: 'utf-8',
});

const outputParsed: AgentRow[] = JSON.parse(output);

console.table(deriveSessions(outputParsed, hostname(), Date.now()));
