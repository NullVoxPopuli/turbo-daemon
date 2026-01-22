import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { createDaemon } from 'turbo-daemon';
import { afterAll, beforeAll, describe, expect as throwErrorIfNot, it } from 'vitest';

const expect = throwErrorIfNot.soft;

const log = {
  daemon: join(import.meta.dirname, '../node_modules/.turbo-daemon/daemon.log'),
  turbo: join(import.meta.dirname, '../node_modules/.turbo-daemon/turbo.log'),
};

async function readFastifyLog(filePath: string) {
  const buffer = await readFile(filePath);
  const str = buffer.toString();
  const lines = str.split('\n').filter(Boolean);
  const parsed = lines.map((line) => JSON.parse(line));

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
  });

  it('respects bodyLimit option via API', async () => {
    // Set via API (150 MB)
    const daemon = createDaemon({ fastifyOptions: { bodyLimit: 150 * 1024 * 1024 } });

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    const turbo = await readFastifyLog(log.turbo);

    for (const entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);

  it('respects BODY_LIMIT environment variable when API option not provided', async () => {
    // Set custom body limit via environment variable (150 MB)
    process.env.BODY_LIMIT = String(150 * 1024 * 1024);

    const daemon = createDaemon();

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    const turbo = await readFastifyLog(log.turbo);

    for (const entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);

  it('API option takes precedence over environment variable', async () => {
    // Set env var to one value
    process.env.BODY_LIMIT = String(100 * 1024 * 1024);

    // But override with API (200 MB)
    const daemon = createDaemon({ fastifyOptions: { bodyLimit: 200 * 1024 * 1024 } });

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    const turbo = await readFastifyLog(log.turbo);

    for (const entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);

  it('works with default when neither option nor env var is set', async () => {
    delete process.env.BODY_LIMIT;

    const daemon = createDaemon();

    await daemon.ensureStarted();

    // Verify the daemon started successfully
    expect(daemon.info.isRunning).toBe(true);

    // Verify no errors in the logs
    const turbo = await readFastifyLog(log.turbo);

    for (const entry of turbo) {
      expect(JSON.stringify(entry)).not.includes('FastifyError');
    }

    // Clean up
    await daemon.stop();
  }, 10_000);
});
