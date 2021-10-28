import * as console from 'console';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import next from 'next';
import * as process from 'process';
import * as url from 'url';
import {URL} from './packages/es/global';
import {onError} from './packages/es/onError';

const config = {
    noHttps: process.argv.includes('--http'),
    hostname: 'localhost.gojabako.zone',
    port: 3000,
};
const {rootUrl, server} = config.noHttps ? {
    rootUrl: new URL(`http://${config.hostname}:${config.port}`),
    server: http.createServer(),
} : {
    rootUrl: new URL(`https://${config.hostname}:${config.port}`),
    server: https.createServer({
        key: fs.readFileSync(`certificates/${config.hostname}/privkey.pem`),
        cert: fs.readFileSync(`certificates/${config.hostname}/fullchain.pem`),
    }),
};
const parseUrl = (requestPath = '/'): url.UrlWithParsedQuery & {pathname: string} => {
    const parsedUrl = url.parse(new URL(requestPath, rootUrl).href, true);
    return {
        ...parsedUrl,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        query: parsedUrl.query || {},
        pathname: parsedUrl.pathname || '/',
    };
};
const app = next({dev: process.env.NODE_ENV !== 'production'});
app.prepare().then(() => {
    const handleRequest = app.getRequestHandler();
    const onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
        const parsedUrl = parseUrl(req.url);
        if (!parsedUrl.pathname.startsWith('/_')) {
            console.info(`${req.method} ${req.url}`);
        }
        handleRequest(req, res, parsedUrl).catch(onError);
    };
    server.once('error', onError);
    server.once('listening', () => console.info(`> Ready on ${rootUrl.href}`));
    server.on('request', onRequest);
    server.listen(config.port);
}).catch((error: unknown) => {
    onError(error);
    process.exit(1);
});
