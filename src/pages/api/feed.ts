import type {NextApiHandler} from 'next';
import packgeJson from '../../../package.json';
import {Date} from '../../global';
import {pageList} from '../../util/pageList.generated';
import {sanitize} from '../../util/sanitize';

const handler: NextApiHandler = async (_req, res) => {
    res.writeHead(200, {
        'content-type': 'application/atom+xml; charset=utf-8',
    });
    for await (const line of serialize()) {
        res.write(`${line}\n`);
    }
    res.end();
};

const serialize = async function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
    yield `  <title>${packgeJson.siteName}</title>`;
    yield `  <link href="${packgeJson.homepage}"/>`;
    const now = new Date().toISOString();
    yield `  <updated>${pageList[0].lastCommitAt || now}</updated>`;
    yield `  <id>${packgeJson.homepage}</id>`;
    for await (const page of pageList.slice(0, 20)) {
        yield '  <entry>';
        yield `    <id>${page.url}</id>`;
        yield `    <title>${sanitize(page.title)}</title>`;
        yield `    <link href="${page.url}"/>`;
        yield `    <updated>${page.lastCommitAt || now}</updated>`;
        yield `    <published>${page.firstCommitAt || now}</published>`;
        yield '  </entry>';
    }
    yield '</feed>';
};

export default handler;
