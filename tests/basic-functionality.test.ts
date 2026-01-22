import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

import { $ } from 'execa';
import { afterAll, beforeAll, describe, expect as throwErrorIfNot, it } from 'vitest';

import { bin, log, readDaemonLog, readFastifyLog } from './test-helpers.ts';

const expect = throwErrorIfNot.soft;

describe('boots', () => {
  beforeAll(async () => {
    if (existsSync(log.daemon)) await rm(log.daemon);
    if (existsSync(log.turbo)) await rm(log.turbo);
  });

  afterAll(async () => {
    const { exitCode } = await $({ reject: false })`node ${bin} stop`;

    throwErrorIfNot(exitCode).toEqual(0);
  });

  it('without error', async () => {
    const { stdout, exitCode, stderr } = await $({ reject: false })`node ${bin} start`;

    expect(stdout).toEqual('');
    expect(exitCode).toEqual(0);
    expect(stderr).toEqual('');

    expect(await readDaemonLog()).not.includes('UncaughtException');

    const turbo = await readFastifyLog(log.turbo);

    for (const entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }
  }, 10_000);
});
