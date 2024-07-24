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

import { pidFilePath } from '../shared.js';
import { cleanup, fileLogger, ONE_HUNDRED_MB, pidFile, THIRTY_MINUTES } from './setup.js';

/** @type {ReturnType<typeof setTimeout>} */
let exitTimer;

fileLogger.info('Booting Turbo fastify app...');

// const { createApp } = await import("turborepo-remote-cache");

/**
 * Some of this file is token from
 * https://github.com/ducktors/turborepo-remote-cache/blob/main/src/index.ts
 */
const fastifyApp = createApp({
  /**
   * Default is 50MB (for turborepo-remote-cache) and 1MB (for fastify)
   * we have some very large assets.
   */
  bodyLimit: ONE_HUNDRED_MB,

  /**
   * Allows us to debug, since, as a daemon, we won't have access to stdout/stderr
   * (default logger logs to stdout/stderr)
   */
  logger: fileLogger,
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
