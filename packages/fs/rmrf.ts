import * as fs from 'fs';
import * as path from 'path';
import {isObject} from '@nlib/typing';
import {Error} from '../es/global';

export const rmrf = async (filePath: string) => {
    const stats = await fs.promises.stat(filePath).catch((error) => {
        if (isObject(error) && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    });
    if (!stats) {
        return;
    }
    if (stats.isFile()) {
        await fs.promises.unlink(filePath);
    } else if (stats.isDirectory()) {
        for (const name of await fs.promises.readdir(filePath)) {
            await rmrf(path.join(filePath, name));
        }
        await fs.promises.rmdir(filePath);
    } else {
        throw new Error(`UnsupportedFile: ${filePath}`);
    }
};
