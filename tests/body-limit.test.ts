import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'execa';
import { afterAll, beforeAll, describe, expect as throwErrorIfNot, it } from 'vitest';

const expect = throwErrorIfNot.soft;

let bin = join(import.meta.dirname, '../src/bin.js');
let log = {
  daemon: join(import.meta.dirname, '../node_modules/.turbo-daemon/daemon.log'),
  turbo: join(import.meta.dirname, '../node_modules/.turbo-daemon/turbo.log'),
};

async function readFastifyLog(filePath: string) {
  let buffer = await readFile(filePath);
  let str = buffer.toString();
  let lines = str.split('\n').filter(Boolean);
  let parsed = lines.map((line) => JSON.parse(line));

  return parsed;
}

describe('bodyLimit configuration', () => {
  beforeAll(async () => {
    if (existsSync(log.daemon)) await rm(log.daemon);
    if (existsSync(log.turbo)) await rm(log.turbo);
  });

  afterAll(async () => {
    // Clean up environment variable
    delete process.env.BODY_LIMIT;

    let { exitCode } = await $({ reject: false })`node ${bin} stop`;

    throwErrorIfNot(exitCode).toEqual(0);
  });

  it('uses default body limit when not configured', async () => {
    // Start the daemon without setting BODY_LIMIT
    let { exitCode } = await $({ reject: false })`node ${bin} start`;

    expect(exitCode).toEqual(0);

    // The daemon should start successfully with the default limit
    let turbo = await readFastifyLog(log.turbo);

    for (let entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await $({ reject: false })`node ${bin} stop`;
  }, 10_000);

  it('respects BODY_LIMIT environment variable when set', async () => {
    // Set a custom body limit (200 MB = 209715200 bytes)
    process.env.BODY_LIMIT = '209715200';

    let { exitCode } = await $({ reject: false })`node ${bin} start`;

    expect(exitCode).toEqual(0);

    // The daemon should start successfully with the custom limit
    let turbo = await readFastifyLog(log.turbo);

    for (let entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await $({ reject: false })`node ${bin} stop`;
  }, 10_000);
});
