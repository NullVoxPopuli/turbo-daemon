import type { Daemon, PidFile } from 'salvatore';

/**
 * The non-secret that the turbo CLI/client uses to communicate with the server.
 * When using Vercel's cloud storage, this would be a secret,
 *   but since we're communicating locally (on the same machine), it just needs to be "a value".
 *
 * Real auth happens with AWS S3
 */
export const TURBO_TOKEN: string;

/**
 * The PidFile utility instance for asking questions about the turbo daemon's pid file
 */
export const pidFile: PidFile;

type FullOptions = ConstructorParameters<typeof Daemon>[1];
export type CreateDaemonOptions = Omit<FullOptions, 'logFile' | 'pidFilePath'>;

/**
 * Creates a Daemon instance for starting, stopping, and managing the daemon.
 */
export function createDaemon(options?: CreateDaemonOptions): Daemon;
