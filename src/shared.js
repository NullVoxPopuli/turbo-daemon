import { spawnSync } from 'node:child_process';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const showTopLevel = spawnSync('git', ['rev-parse', '--show-toplevel']);

export const MONOREPO_ROOT = showTopLevel.stdout.toString().trim();

export const ourStorage = path.join(MONOREPO_ROOT, 'node_modules/.turbo-daemon');

fsSync.mkdirSync(ourStorage, { recursive: true });

export const daemonLogsPath = path.join(ourStorage, 'daemon.log');
export const turboLogsPath = path.join(ourStorage, 'turbo.log');
export const daemonScriptPath = path.join(__dirname, 'daemon', 'index.js');
export const pidFilePath = path.join(ourStorage, '.turbo.pid');

const serverPath = path.join(ourStorage, 'server-config.json');

export function readServerConfig() {
  if (!fsSync.existsSync(serverPath)) {
    return {};
  }

  try {
    const buffer = fsSync.readFileSync(serverPath);
    const json = JSON.parse(buffer.toString());

    return json;
  } catch {
    return {};
  }
}

export function writeServerConfig(options = {}) {
  fsSync.writeFileSync(serverPath, JSON.stringify(options ?? {}));
}

/**
 * We don't need an actual secret, because the client and server live
 * on the same machine.
 */
export const TURBO_TOKEN = 'non-secret__turbo-well-known';
