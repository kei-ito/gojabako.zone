import * as childProcess from 'child_process';
import * as process from 'process';
import {Error, Promise} from '../es/global';
import {Terminator} from './Terminator';

export interface SpawnResult {
    stdout: string,
    stderr: string,
}

export const spawn = async (
    command: string,
    {quiet, ...options}: childProcess.ExecOptions & {quiet?: boolean} = {},
): Promise<SpawnResult> => await new Promise<SpawnResult>((resolve, reject) => {
    const subprocess = childProcess.spawn(command, {shell: true, ...options});
    subprocess.once('error', reject);
    const stdout = subprocess.stdout.pipe(new Terminator());
    const stderr = subprocess.stderr.pipe(new Terminator());
    subprocess.once('close', (code) => {
        if (code === 0) {
            resolve({
                stdout: stdout.flushAsString(),
                stderr: stderr.flushAsString(),
            });
        } else {
            reject(new Error(`The process exited with ${code}. ${stderr.flushAsString()}`));
        }
    });
    if (!quiet) {
        process.stdout.write(`> ${command}\n`);
        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);
    }
});
