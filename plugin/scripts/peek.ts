import { execFileSync } from 'node:child_process';
import { projectName } from '../../src/state/derive';
import type { AgentRow } from '../../src/state/types';

const output = execFileSync('claude', ['agents', '--json'], {
  encoding: 'utf-8',
});

const outputParsed: AgentRow[] = JSON.parse(output);

outputParsed.map((agent) => projectName(agent.cwd));
