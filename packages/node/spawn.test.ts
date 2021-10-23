import * as process from 'process';
import {spawn} from './spawn';

describe(spawn.name, () => {
    it('node -v', async () => {
        expect(await spawn('node -v')).toMatchObject({
            stderr: '',
            stdout: process.version,
        });
    });
});
