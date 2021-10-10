import * as crypto from 'crypto';
import * as fs from 'fs';
import * as console from 'console';
import {listFiles} from './util/listFiles';
import {spawn} from './util/spawn';

const directoryUrl = new URL(`file://${__dirname}/`);
const hashFileUrl = new URL('../.tool/hash.txt', directoryUrl);

export const setupIfRequired = async () => {
    const [current, previous] = await Promise.all([
        calculateCurrentHash(),
        loadPreviousHash(),
    ]);
    if (current === previous) {
        console.info('setup is not required.');
    } else {
        await spawn('npm run setup');
    }
    await fs.promises.writeFile(hashFileUrl, current);
};

const calculateCurrentHash = async (): Promise<string> => {
    const hash = crypto.createHash('sha256');
    for await (const fileUrl of listFiles(directoryUrl)) {
        hash.update(await fs.promises.readFile(fileUrl));
    }
    return hash.digest('base64');
};

const loadPreviousHash = async (): Promise<string> => {
    try {
        return await fs.promises.readFile(hashFileUrl, 'utf8');
    } catch (error: unknown) {
        if ((error as {code: string}).code === 'ENOENT') {
            return '';
        }
        throw error;
    }
};

if (require.main === module) {
    setupIfRequired().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}
