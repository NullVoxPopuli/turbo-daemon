import type { Daemon, PidFile } from 'salvatore';
import type { createApp } from 'turborepo-remote-cache';

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
type DaemonOptions = Omit<FullOptions, 'logFile' | 'pidFilePath'>;
type FastifyServerOptions = Parameters<typeof createApp>[0];

export interface CreateDaemonOptions extends DaemonOptions {
  fastifyOptions?: FastifyServerOptions;
}

/**
 * Creates a Daemon instance for starting, stopping, and managing the daemon.
 *
 * Also takes FastifyServerOptions in `fastifyOptions` property.
 *
 * https://github.com/fastify/fastify/blob/5c14e05670c80455b99286ee0b6eac05eabec831/fastify.d.ts#L109
 *
 * Which are passed to the underlying turborepo-remote-cache here:
 * https://github.com/ducktors/turborepo-remote-cache/blob/2d02cacaa2f6cb6cfe9877cb90fa22f3cebc7fac/src/app.ts#L23
 */
export function createDaemon(options?: CreateDaemonOptions): Daemon;
