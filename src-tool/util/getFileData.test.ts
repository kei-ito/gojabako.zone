import {getFileData} from './getFileData';
import {projectRootUrl} from './url';

const DateRegExp = /\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/;

describe(getFileData.name, () => {
    it('package.json', async () => {
        const fileUrl = new URL('package.json', projectRootUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        expect(firstCommitAt).toMatch(DateRegExp);
        expect(lastCommitAt).toMatch(DateRegExp);
    });
    it('.git', async () => {
        const fileUrl = new URL('.git', projectRootUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        expect(firstCommitAt).toBe(null);
        expect(lastCommitAt).toBe(null);
    });
});
