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
    childProcess.exec(command, options, (error, rawStdout, rawStderr) => {
        if (error) {
            reject(error);
        } else {
            const stdout = rawStdout.trim();
            const stderr = rawStderr.trim();
            if (stderr) {
                console.info(`--- command --------\n${command}`);
                console.info(`--- stdout --------\n${stdout}`);
                console.error(`--- stderr --------\n${stderr}`);
            }
            resolve({stdout, stderr});
        }
    });
});
