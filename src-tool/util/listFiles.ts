import * as fs from 'fs';

export const listFiles = async function* (
    directoryUrl: URL,
): AsyncGenerator<URL> {
    const directory = directoryUrl.href.replace(/([^/]$)/, '$1/');
    for (const name of await fs.promises.readdir(directoryUrl)) {
        const fileUrl = new URL(`./${name}`, directory);
        const stats = await fs.promises.stat(fileUrl);
        if (stats.isDirectory()) {
            yield* listFiles(fileUrl);
        } else if (stats.isFile()) {
            yield fileUrl;
        }
    }
};
