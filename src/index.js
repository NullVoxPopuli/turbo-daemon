import { Daemon, PidFile } from 'salvatore';

import { daemonLogsPath, daemonScriptPath, pidFilePath } from './shared.js';

export { TURBO_TOKEN } from './shared.js';

export const pidFile = new PidFile(pidFilePath);

/**
 * This can safely be called multiple times, though, not quickly.
 * There would be a race condition with multiple processes trying to
 * create a daemon at the same time -- last would win.
 *
 * To fix, `Daemon` probably needs a pidfile as well.
 * See: https://github.com/NullVoxPopuli/salvatore/issues/5
 *
 * @param {import('./index.d.ts').CreateDaemonOptions} [options]
 */
export function createDaemon(options = {}) {
  const { fastifyOptions = {}, ...opts } = options;
  const daemon = new Daemon(daemonScriptPath, {
    pidFilePath,
    logFile: daemonLogsPath,
    // This is arbitrary, but can be overwritten, depending on average machine performance
    timeout: 5_000,
    ...opts,
  });

  pidFile.write({
    fastifyOptions,
  });

  return daemon;
}
