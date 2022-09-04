// @ts-check
import * as console from 'console';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as process from 'process';
import * as url from 'url';
import next from 'next';

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
const parseUrl = (requestPath = '/') => {
    const parsedUrl = url.parse(new URL(requestPath, rootUrl).href, true);
    return {
        ...parsedUrl,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        query: parsedUrl.query || {},
        pathname: parsedUrl.pathname || '',
    };
};
const app = next({
    dev: process.env.NODE_ENV !== 'production',
    hostname: config.hostname,
    port: config.port,
});
await app.prepare();
const handleRequest = app.getRequestHandler();
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const onRequest = (req, res) => {
    const parsedUrl = parseUrl(req.url);
    if (!parsedUrl.pathname.startsWith('/_')) {
        console.info(`${req.method} ${req.url}`);
    }
    handleRequest(req, res, parsedUrl).catch((error) => {
        console.error(error);
    });
};
server.once('error', (error) => {
    console.error(error);
    process.exit(1);
});
server.once('listening', () => console.info(`> Ready on ${rootUrl.href}`));
server.on('request', onRequest);
server.listen(config.port);
