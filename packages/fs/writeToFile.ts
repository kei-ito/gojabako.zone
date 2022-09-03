import * as fs from 'fs';

export const writeToFile = async (
    dest: URL | string,
    serializer: () => AsyncIterable<string> | Iterable<string>,
) => {
    const writer = fs.createWriteStream(dest);
    for await (const line of serializer()) {
        writer.write(`${line}\n`);
    }
    writer.end();

};
