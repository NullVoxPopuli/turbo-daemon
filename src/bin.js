#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import os from 'node:os';
import process from 'node:process';

import { createDaemon, pidFile } from './index.js';
import { ourStorage, pidFilePath } from './shared.js';

const [, , ...args] = process.argv;
const [command] = args;
const daemon = createDaemon();
const isMac = os.platform() === 'darwin';

/**
 * @param {string} cmd
 * @param {string[]} cmdArgs
 */
const run = (cmd, cmdArgs) => spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: true });

async function cli() {
  switch (command) {
    case 'start':
      return await daemon.ensureStarted();
    case 'stop':
      return await daemon.stop();
    case 'restart': {
      await daemon.stop();
      await daemon.ensureStarted();

      return;
    }
    case 'status':
      return status();
    case 'logs': {
      const tailTarget = `${ourStorage}/*.log`;

      console.log(`Tailing ${tailTarget} ...`);

      if (isMac) {
        return run(`tail`, ['-F', tailTarget]);
      }

      return run(`tail`, [`--retry`, `--follow`, tailTarget]);
    }
  }
}

function status() {
  if (!pidFile.exists) {
    console.log(
      `pidFile @ ${pidFilePath} does not exist. Cannot gather more information. The process may have exited and cleaned itself up.`
    );

    return;
  }

  const isRunning = pidFile.isRunning;
  const startedAt = isRunning ? pidFile.startedAt : null;
  const uptime = isRunning ? pidFile.uptime : null;

  console.log(`
    Running: ${isRunning}
    PID:     ${pidFile.pid}
    Started: ${startedAt}
    Uptime:  ${uptime}
    Data:    ${JSON.stringify(pidFile.data)}
  `);
}

await cli();
