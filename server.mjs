import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as console from 'console';
import next from 'next';

const getServer = async () => {
    const directoryUrl = new URL('certificates/localhost.gojabako.zone/', import.meta.url);
    let certificates = null;
    try {
        const [key, cert] = await Promise.all([
            fs.promises.readFile(new URL('privkey.pem', directoryUrl)),
            fs.promises.readFile(new URL('cert.pem', directoryUrl)),
        ]);
        certificates = {key, cert};
    } catch (error) {
        console.error(error);
    }
    if (certificates) {
        return {
            rootUrl: new URL('https://localhost.gojabako.zone:3000'),
            server: https.createServer(certificates),
        };
    }
    return {
        rootUrl: new URL('https://0.0.0.0:3000'),
        server: http.createServer(),
    };
};
const {rootUrl, server} = await getServer();
const app = next({dev: process.env.NODE_ENV !== 'production'});
await app.prepare();
server.once('error', (error) => {
    console.error(error);
});
server.on('request', (req, res) => {
    const url = new URL(req.url, rootUrl);
    app.render(req, res, url.pathname, url.search);
});
server.on('listening', () => {
    console.info(`> Ready on ${rootUrl.href}`);
});
server.listen(Number(rootUrl.port), rootUrl.hostname);
