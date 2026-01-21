import { TURBO_TOKEN, turboLogsPath } from '../shared.js';

Object.assign(process.env, {
  // turbo server
  // LOG_MODE: 'stdout', // stdout gets sent to daemon.log
  LOG_MODE: 'file',
  LOG_LEVEL: 'trace',
  LOG_FILE: turboLogsPath,
  TURBO_TOKEN,
  // Note: BODY_LIMIT is set internally by createDaemon() if provided
  // It should not be set directly by users
});
