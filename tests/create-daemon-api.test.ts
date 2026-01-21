import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { createDaemon } from 'turbo-daemon';
import { afterAll, beforeAll, describe, expect as throwErrorIfNot, it } from 'vitest';

const expect = throwErrorIfNot.soft;

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

describe('createDaemon bodyLimit option', () => {
  beforeAll(async () => {
    if (existsSync(log.daemon)) await rm(log.daemon);
    if (existsSync(log.turbo)) await rm(log.turbo);
  });

  afterAll(async () => {
    // Clean up environment variable
    delete process.env.BODY_LIMIT;
  });

  it('accepts bodyLimit option and starts successfully', async () => {
    // Create daemon with custom body limit (150 MB)
    const daemon = createDaemon({ bodyLimit: 150 * 1024 * 1024 });

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    let turbo = await readFastifyLog(log.turbo);

    for (let entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);

  it('works without bodyLimit option (uses default)', async () => {
    const daemon = createDaemon();

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    let turbo = await readFastifyLog(log.turbo);

    for (let entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);
});
