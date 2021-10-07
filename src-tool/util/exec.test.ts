import * as process from 'process';
import {exec} from './exec';

describe(exec.name, () => {
    it('node -v', async () => {
        expect(await exec('node -v')).toMatchObject({
            stderr: '',
            stdout: process.version,
        });
    });
});
