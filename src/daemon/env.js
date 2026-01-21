import { TURBO_TOKEN, turboLogsPath } from '../shared.js';

Object.assign(process.env, {
  // turbo server
  // LOG_MODE: 'stdout', // stdout gets sent to daemon.log
  LOG_MODE: 'file',
  LOG_LEVEL: 'trace',
  LOG_FILE: turboLogsPath,
  TURBO_TOKEN,
  // BODY_LIMIT can be set via createDaemon({ bodyLimit: ... }) and will be inherited here
  // Default is 104857600 (100 MB) if not set
});
