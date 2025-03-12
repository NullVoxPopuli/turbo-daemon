import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'execa';
import { beforeAll, describe, expect as incorrectExpect, it } from 'vitest';

const expect = incorrectExpect.soft;

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

async function readDaemonLog() {
  let buffer = await readFile(log.daemon);
  let str = buffer.toString();

  return str;
}

describe('boots', () => {
  beforeAll(async () => {
    await rm(log.daemon);
    await rm(log.turbo);
  });

  it('without error', async () => {
    let { stdout, exitCode, stderr } = await $({ reject: false })`node ${bin} start`;

    expect(stdout).toEqual('');
    expect(exitCode).toEqual(0);
    expect(stderr).toEqual('');

    expect(await readDaemonLog()).not.includes('UncaughtException');

    let turbo = await readFastifyLog(log.turbo);

    for (let entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }
  }, 10_000);
});
