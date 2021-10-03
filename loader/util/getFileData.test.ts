import {Date} from '../../src/global';
import {getFileData} from './getFileData';

describe(getFileData.name, () => {
    it('package.json', async () => {
        const filePath = 'package.json';
        const {firstCommitAt, lastCommitAt} = await getFileData(filePath);
        expect(firstCommitAt).toBeInstanceOf(Date);
        expect(lastCommitAt).toBeInstanceOf(Date);
    });
    it('.git', async () => {
        const filePath = '.git';
        const {firstCommitAt, lastCommitAt} = await getFileData(filePath);
        expect(firstCommitAt).toBe(null);
        expect(lastCommitAt).toBe(null);
    });
});
