import * as fs from 'fs';
import * as path from 'path';

export const listFiles = async function* (
    directoryPath: string,
    test?: (absolutePath: string) => boolean,
): AsyncGenerator<string> {
    for await (const name of await fs.promises.readdir(directoryPath)) {
        const fileAbsolutePath = path.join(directoryPath, name);
        const stats = await fs.promises.stat(fileAbsolutePath);
        if (stats.isDirectory()) {
            yield* listFiles(path.join(directoryPath, name), test);
        } else if (stats.isFile() && (!test || test(fileAbsolutePath))) {
            yield fileAbsolutePath;
        }
    }
};
