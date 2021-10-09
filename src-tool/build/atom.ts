import * as fs from 'fs';
import {publicUrl} from '../util/url';
import {serializeAtom} from '../serialize/Atom';

const writer = fs.createWriteStream(
    new URL('feed.atom', publicUrl),
);
for await (const line of serializeAtom()) {
    writer.write(`${line}\n`);
}
writer.end();
