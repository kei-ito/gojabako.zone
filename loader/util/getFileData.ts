import type * as childProcess from 'child_process';
import type {ExecResult} from './exec';
import {exec} from './exec';
import {readline} from './readline';

export interface FileData {
    firstCommitAt: Date | null,
    lastCommitAt: Date | null,
}

export const getFileData = async (
    filePath: string,
): Promise<FileData> => {
    const [firstCommitAt, lastCommitAt] = await Promise.all([
        getFirstCommitterDate(filePath),
        getLastCommitterDate(filePath),
    ]);
    return {firstCommitAt, lastCommitAt};
};

const parseCommandOutput = (
    {stderr, stdout}: ExecResult,
): Date | null => {
    if (stderr) {
        throw new Error(stderr);
    }
    const result = readline(stdout).next();
    const dateString = result.done ? null : result.value;
    return dateString ? new Date(dateString) : null;
};

const getFirstCommitterDate = async (
    relativePath: string,
    options?: childProcess.ExecOptions,
) => {
    const command = `git log --reverse --format="%aI" ${relativePath}`;
    return parseCommandOutput(await exec(command, options));
};

const getLastCommitterDate = async (
    relativePath: string,
    options?: childProcess.ExecOptions,
) => {
    const command = `git log -1 --format="%aI" ${relativePath}`;
    return parseCommandOutput(await exec(command, options));
};
