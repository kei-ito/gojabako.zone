import * as fs from 'fs';
import * as console from 'console';
import {publicUrl} from '../util/url';
import {serializeSitemap} from '../serialize/Sitemap';

const buildSitemap = async () => {
    const writer = fs.createWriteStream(
        new URL('sitemap.xml', publicUrl),
    );
    for await (const line of serializeSitemap()) {
        writer.write(`${line}\n`);
    }
    writer.end();
};

buildSitemap().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
