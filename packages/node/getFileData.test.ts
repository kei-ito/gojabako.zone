import {rootDirectoryUrl} from '../fs/constants';
import {getFileData} from './getFileData';

const DateRegExp = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(.\d\d\d)?(Z|[+-]\d\d:\d\d)$/;

describe(getFileData.name, () => {
    it('package.json', async () => {
        const fileUrl = new URL('package.json', rootDirectoryUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        expect(firstCommitAt).toMatch(DateRegExp);
        expect(lastCommitAt).toMatch(DateRegExp);
    });
    it('.git', async () => {
        const fileUrl = new URL('.git', rootDirectoryUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        const now = Date.now();
        expect(new Date(firstCommitAt).getTime()).toBeCloseTo(now);
        expect(new Date(lastCommitAt).getTime()).toBeCloseTo(now);
    });
});
