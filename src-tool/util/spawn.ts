import * as childProcess from 'child_process';

export interface SpawnResult {
    stdout: string,
    stderr: string,
}

export const spawn = async (
    command: string,
    {quiet, ...options}: childProcess.ExecOptions & {quiet?: boolean} = {},
): Promise<SpawnResult> => await new Promise<SpawnResult>((resolve, reject) => {
    const subprocess = childProcess.spawn(command, [], {
        shell: true,
        ...options,
    });
    const stdoutChunks: Array<Buffer> = [];
    const stderrChunks: Array<Buffer> = [];
    subprocess.once('error', reject);
    subprocess.once('close', (code) => {
        const stderr = `${Buffer.concat(stderrChunks)}`.trim();
        if (code) {
            reject(stderr);
        } else {
            const stdout = `${Buffer.concat(stdoutChunks)}`.trim();
            resolve({stdout, stderr});
        }
    });
    if (!quiet) {
        process.stdout.write(`> ${command}\n`);
        subprocess.stdout.pipe(process.stdout);
        subprocess.stderr.pipe(process.stderr);
    }
    subprocess.stdout.on('data', (data: Buffer) => {
        stdoutChunks.push(data);
    });
    subprocess.stderr.on('data', (data: Buffer) => {
        stderrChunks.push(data);
    });
});
