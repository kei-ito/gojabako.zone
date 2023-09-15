import type { ExecOptions } from 'child_process';
import { spawn as nodeSpawn } from 'node:child_process';
import * as process from 'process';
import { Terminator } from './Terminator.mjs';

interface SpawnResult {
  stdout: string;
  stderr: string;
}

type SpawnStdio = 'both' | 'err' | 'none';

export const spawn = async (
  command: string,
  { stdio = 'err', ...options }: ExecOptions & { stdio?: SpawnStdio } = {},
): Promise<SpawnResult> =>
  await new Promise<SpawnResult>((resolve, reject) => {
    const subprocess = nodeSpawn(command, { shell: true, ...options });
    subprocess.once('error', reject);
    const stdout = subprocess.stdout.pipe(new Terminator());
    const stderr = subprocess.stderr.pipe(new Terminator());
    subprocess.once('close', (code) => {
      if (code === 0) {
        resolve({
          stdout: stdout.flush().toString('utf-8').trim(),
          stderr: stderr.flush().toString('utf-8').trim(),
        });
      } else {
        reject(new Error(`The process exited with ${code}. ${stderr.flush()}`));
      }
    });
    switch (stdio) {
      case 'both':
        process.stdout.write(`> ${command}\n`);
        subprocess.stdout.pipe(process.stdout);
        subprocess.stderr.pipe(process.stderr);
        break;
      case 'none':
        break;
      case 'err':
      default:
        subprocess.stderr.pipe(process.stderr);
        break;
    }
  });
