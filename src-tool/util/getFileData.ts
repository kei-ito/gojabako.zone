import type {Commit} from '../../packages/git/listCommits';
import {getAllCommits} from '../../packages/git/listCommits';
import {projectRootUrl} from './url';

export interface FileData {
    firstCommitAt: string,
    lastCommitAt: string,
    commitCount: number,
    /** Use to create a link to history on GitHub */
    filePath: string,
}

export const getFileData = async (
    fileUrl: URL,
): Promise<FileData> => {
    const filePath = fileUrl.pathname.slice(projectRootUrl.pathname.length);
    const commitList = await getAllCommits(filePath);
    const now = new Date().toISOString();
    const firstCommit = commitList[commitList.length - 1] as Commit | null;
    const lastCommit = commitList[0] as Commit | null;
    return {
        firstCommitAt: firstCommit ? firstCommit.authorDate : now,
        lastCommitAt: lastCommit ? lastCommit.authorDate : now,
        commitCount: commitList.length,
        filePath,
    };
};
