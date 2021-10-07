import {Date} from '../../src/global';
import {getFileData} from './getFileData';
import {projectRootUrl} from './url';

describe(getFileData.name, () => {
    it('package.json', async () => {
        const fileUrl = new URL('package.json', projectRootUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        expect(firstCommitAt).toBeInstanceOf(Date);
        expect(lastCommitAt).toBeInstanceOf(Date);
    });
    it('.git', async () => {
        const fileUrl = new URL('.git', projectRootUrl);
        const {firstCommitAt, lastCommitAt} = await getFileData(fileUrl);
        expect(firstCommitAt).toBe(null);
        expect(lastCommitAt).toBe(null);
    });
});
