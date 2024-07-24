import './env.js';

import { cleanup, fileLogger } from './setup.js';

process.on('unhandledRejection', (reason) => {
  fileLogger.error(reason);
  cleanup();
});
process.on('uncaughtException', (error) => {
  fileLogger.error(error);
  cleanup();
});

await import('./start-app.js');
