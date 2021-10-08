import * as fs from 'fs';
import * as console from 'console';
import {publicUrl} from '../util/url';
import {serializeAtom} from '../serialize/Atom';

const buildAtom = async () => {
    const writer = fs.createWriteStream(
        new URL('feed.atom', publicUrl),
    );
    for await (const line of serializeAtom()) {
        writer.write(`${line}\n`);
    }
    writer.end();
};

buildAtom().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
