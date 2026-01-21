import { pino } from 'pino';
import { PidFile } from 'salvatore';

import { pidFilePath, turboLogsPath } from '../shared.js';

export const pidFile = new PidFile(pidFilePath);

export const THIRTY_MINUTES = 1000 * 60 * 30;
export const fileLogger = pino(pino.destination(turboLogsPath));

export function cleanup() {
  fileLogger.info('Cleaning up...');
  pidFile.delete();
}
