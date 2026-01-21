import { Daemon, PidFile } from 'salvatore';

import { daemonLogsPath, daemonScriptPath, pidFilePath } from './shared.js';

export { TURBO_TOKEN } from './shared.js';

/**
 * This can safely be called multiple times, though, not quickly.
 * There would be a race condition with multiple processes trying to
 * create a daemon at the same time -- last would win.
 *
 * To fix, `Daemon` probably needs a pidfile as well.
 * See: https://github.com/NullVoxPopuli/salvatore/issues/5
 *
 * @param {import('./index.d.ts').CreateDaemonOptions} [options]
 * @returns {Daemon}
 */
export function createDaemon(options = {}) {
  const { bodyLimit, ...daemonOptions } = options;

  // Set BODY_LIMIT environment variable for the daemon process
  // This is an internal implementation detail - users should only configure via the bodyLimit option
  if (bodyLimit !== undefined) {
    process.env.BODY_LIMIT = String(bodyLimit);
  } else {
    // Clear any pre-set BODY_LIMIT to ensure we use the default from turborepo-remote-cache
    delete process.env.BODY_LIMIT;
  }

  return new Daemon(daemonScriptPath, {
    pidFilePath,
    logFile: daemonLogsPath,
    // This is arbitrary, but can be overwritten, depending on average machine performance
    timeout: 5_000,
    ...daemonOptions,
    // TODO: configured "restartWhen" with nodemon
  });
}

export const pidFile = new PidFile(pidFilePath);
