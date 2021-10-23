import * as fs from 'fs';
import {URL} from '../es/global';

export const listFiles = async function* (directoryUrl: URL): AsyncGenerator<URL> {
    for await (const name of await fs.promises.readdir(directoryUrl as unknown as string)) {
        const fileUrl = new URL(name, directoryUrl);
        const stats = await fs.promises.stat(fileUrl);
        if (stats.isDirectory()) {
            yield* listFiles(new URL(`${name}/`, directoryUrl));
        } else if (stats.isFile()) {
            yield fileUrl;
        }
    }
};
