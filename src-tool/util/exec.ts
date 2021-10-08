import * as childProcess from 'child_process';
import * as console from 'console';

export interface ExecResult {
    stdout: string,
    stderr: string,
}

export const exec = async (
    command: string,
    options: childProcess.ExecOptions = {},
): Promise<ExecResult> => await new Promise<ExecResult>((resolve, reject) => {
    console.info(command);
    childProcess.exec(command, options, (error, rawStdout, rawStderr) => {
        if (error) {
            reject(error);
        } else {
            const stdout = rawStdout.trim();
            const stderr = rawStderr.trim();
            if (stderr) {
                console.error(stderr);
            }
            resolve({stdout, stderr});
        }
    });
});
