import type {Commit} from './listCommits';
import {listCommits} from './listCommits';

describe(listCommits.name, () => {
    it('should list commits related to a file', async () => {
        const commits: Array<Commit> = [];
        for await (const commit of listCommits('package.json')) {
            commits.push(commit);
        }
        expect(commits.length).toBeGreaterThan(0);
    });
});
