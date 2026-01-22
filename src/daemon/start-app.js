import closeWithGrace from 'close-with-grace';
import getPort from 'get-port';
/**
 * This file is await-imported, because this import checks that TURBO_TOKEN is set.
 * we set TURBO_TOKEN in env.js.
 *
 * See daemon/index.js for load order.
 */
// @ts-expect-error - this package does not provide types
import { createApp } from 'turborepo-remote-cache';

import { pidFilePath, readServerConfig } from '../shared.js';
import { cleanup, fileLogger, pidFile, THIRTY_MINUTES } from './setup.js';

/** @type {ReturnType<typeof setTimeout>} */
let exitTimer;

fileLogger.info('Booting Turbo fastify app...');

/**
 * Sanity checks for the consumer passing in environment variables
 */
fileLogger.info(`Detected TURBO_TEAM: \`${process.env.TURBO_TEAM}\``);

const storageEnv = Object.entries(process.env).filter(([key]) => key.startsWith('STORAGE_'));

for (const [key, value] of storageEnv) {
  fileLogger.info(`Detected ${key}: \`${value}\``);
}

const options = readServerConfig();

/**
 * Some of this file is token from
 * https://github.com/ducktors/turborepo-remote-cache/blob/main/src/index.ts
 */
const fastifyApp = createApp({
  /**
   * Allows us to debug, since, as a daemon, we won't have access to stdout/stderr
   * (default logger logs to stdout/stderr)
   */
  loggerInstance: fileLogger,
  /**
   * Passed in from the pid file written after the daemon is created
   * in src/index.js
   */
  ...options,
});

/**
 * Because we run as a daemon, there is a possibility that we accidentally create a zombie process.
 * (where the daemon's pid does not match the pid in the pid file - the launcher code would start up a new daemon).
 *
 * To help prevent the leakage of zombies, we need a way to determine if we should should ourselves down.
 * This criteria is arbitrary, but if no request is received in >= 30 minutes, the daemon will shut itself down.
 */
function bumpExitTimer() {
  clearTimeout(exitTimer);
  exitTimer = setTimeout(() => {
    fileLogger.info(`No request received in 30 minutes. Exiting...`);

    cleanup();

    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }, THIRTY_MINUTES);
}

// @ts-expect-error
fastifyApp.addHook('onRequest', (_request, _reply, done) => {
  bumpExitTimer();
  done();
});

closeWithGrace(
  { delay: 100 /* ms expected finish time */, logger: fileLogger },
  async function ({ err, signal }) {
    if (err) {
      fastifyApp.log.error(err);
    }

    fastifyApp.log.info(`[${signal}] Gracefully closing the server instance.`);

    await fastifyApp.close();
    cleanup();
  }
);

const port = await getPort();

console.debug(`Attempting to use port ${port} ...`);

fastifyApp.listen(
  { host: '0.0.0.0', port },
  /**
   * @param {unknown} err
   */
  (err) => {
    if (err) {
      fastifyApp.log.error(err);
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }

    const { port } = fastifyApp.server.address();

    fileLogger.info(`Fastify app booted on port ${port}`);

    pidFile.write({ port });
    fileLogger.info(`Pid file @ ${pidFilePath} written`);
    console.info(`Server booted.`);
    console.info(`Using Port ${port}`);
    console.info(`Pidfile @ ${pidFilePath}`);
    bumpExitTimer();
  }
);
