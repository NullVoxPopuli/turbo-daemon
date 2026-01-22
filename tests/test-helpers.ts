import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const bin = join(import.meta.dirname, '../src/bin.js');
export const log = {
  daemon: join(import.meta.dirname, '../node_modules/.turbo-daemon/daemon.log'),
  turbo: join(import.meta.dirname, '../node_modules/.turbo-daemon/turbo.log'),
};

export async function readFastifyLog(filePath: string) {
  const buffer = await readFile(filePath);
  const str = buffer.toString();
  const lines = str.split('\n').filter(Boolean);
  const parsed = lines.map((line) => JSON.parse(line));

  return parsed;
}

export async function readDaemonLog() {
  const buffer = await readFile(log.daemon);
  const str = buffer.toString();

  return str;
}
