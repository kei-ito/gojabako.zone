import {readline} from './readline';
import {spawn} from './spawn';

/**
 * https://git-scm.com/docs/pretty-formats
 */
const NewLine = '%x0A';
const CommitHash = '%H';
const AbbreviatedCommitHash = '%h';
const AuthorDate = '%aI';
const CommitterDate = '%aI';
const delimiter = '--------';
const format = [
    delimiter,
    CommitHash,
    AbbreviatedCommitHash,
    AuthorDate,
    CommitterDate,
]
.join(NewLine);

export interface Commit {
    commitHash: string,
    abbreviatedCommitHash: string,
    authorDate: string,
    committerDate: string,
}

const parseCommitOutput = (entry: string): Commit => {
    const [
        commitHash,
        abbreviatedCommitHash,
        authorDate,
        committerDate,
    ] = [...readline(entry)];
    if (!(/^[0-9a-f]{40}$/).test(commitHash)) {
        throw new Error(`InvalidCommitHash: ${commitHash}`);
    }
    if (!(/^[0-9a-f]+$/).test(abbreviatedCommitHash)) {
        throw new Error(`InvalidAbbreviatedCommitHash: ${abbreviatedCommitHash}`);
    }
    const dateRegExp = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/;
    if (!dateRegExp.test(authorDate)) {
        throw new Error(`InvalidAuthorDate: ${authorDate}`);
    }
    if (!dateRegExp.test(committerDate)) {
        throw new Error(`InvalidCommitterDate: ${committerDate}`);
    }
    return {
        commitHash,
        abbreviatedCommitHash,
        authorDate,
        committerDate,
    };
};

export const listCommits = async function* (
    relativePath: string,
    startCommitish = 'HEAD',
) {
    let before = startCommitish;
    while (true) {
        const command = `git log --follow --before=${before} --format="${format}" -- ${relativePath}`;
        const {stdout, stderr} = await spawn(command, {quiet: true});
        if (!stdout || stderr) {
            break;
        }
        for (const entry of stdout.split(delimiter)) {
            const trimmed = entry.trim();
            if (trimmed) {
                const commit = parseCommitOutput(trimmed);
                yield commit;
                before = commit.commitHash;
            }
        }
    }
};

export const getAllCommits = async (
    relativePath: string,
    startCommitish = 'HEAD',
): Promise<Array<Commit>> => {
    const commitList: Array<Commit> = [];
    for await (const commit of listCommits(relativePath, startCommitish)) {
        commitList.push(commit);
    }
    return commitList;
};
