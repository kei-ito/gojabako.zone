import * as fs from 'fs';
import {publicUrl} from '../util/url';
import {serializeSitemap} from '../serialize/Sitemap';

const writer = fs.createWriteStream(
    new URL('sitemap.xml', publicUrl),
);
for await (const line of serializeSitemap()) {
    writer.write(`${line}\n`);
}
writer.end();
