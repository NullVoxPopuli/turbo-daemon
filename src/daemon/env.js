import { TURBO_TOKEN, turboLogsPath } from '../shared.js';

Object.assign(process.env, {
  // turbo server
  // LOG_MODE: 'stdout', // stdout gets sent to daemon.log
  LOG_MODE: 'file',
  LOG_LEVEL: 'trace',
  LOG_FILE: turboLogsPath,
  TURBO_TOKEN,
  // BODY_LIMIT can be set by users to configure max upload size (default: 100MB)
});
