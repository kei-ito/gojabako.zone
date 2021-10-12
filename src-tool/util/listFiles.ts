import * as fs from 'fs';

export const listFiles = async function* (
    directoryUrl: URL,
): AsyncGenerator<URL> {
    for await (const dirEnt of await fs.promises.opendir(directoryUrl as unknown as string)) {
        if (dirEnt.isDirectory()) {
            yield* listFiles(new URL(`${dirEnt.name}/`, directoryUrl));
        } else if (dirEnt.isFile()) {
            yield new URL(dirEnt.name, directoryUrl);
        }
    }
};
