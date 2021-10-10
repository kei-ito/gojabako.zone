import {readline} from './readline';
import type {SpawnResult} from './spawn';
import {spawn} from './spawn';
import {projectRootUrl} from './url';

export interface FileData {
    firstCommitAt: string | null,
    lastCommitAt: string | null,
    /** Use to create a link to history on GitHub */
    filePath: string,
}

export const getFileData = async (
    fileUrl: URL,
): Promise<FileData> => {
    const filePath = fileUrl.pathname.slice(projectRootUrl.pathname.length);
    const [firstCommitAt, lastCommitAt] = await Promise.all([
        getFirstCommitterDate(filePath),
        getLastCommitterDate(filePath),
    ]);
    return {firstCommitAt, lastCommitAt, filePath};
};

const parseCommandOutput = (
    {stderr, stdout}: SpawnResult,
): string | null => {
    if (stderr) {
        throw new Error(stderr);
    }
    const result = readline(stdout).next();
    const dateString = result.done ? null : result.value;
    return dateString ? new Date(dateString).toISOString() : null;
};

const getFirstCommitterDate = async (
    relativePath: string,
) => {
    const command = `git log --reverse --format="%aI" -- ${relativePath}`;
    return parseCommandOutput(await spawn(command, {quiet: true}));
};

const getLastCommitterDate = async (
    relativePath: string,
) => {
    const command = `git log -1 --format="%aI" -- ${relativePath}`;
    return parseCommandOutput(await spawn(command, {quiet: true}));
};
