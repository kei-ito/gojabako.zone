//@ts-check
import * as console from 'node:console';
import * as fs from 'node:fs/promises';
import * as http from 'node:http';
import * as https from 'node:https';
import * as process from 'node:process';
import * as url from 'node:url';
import next from 'next';

const config = {
  noHttps: process.argv.includes('--http'),
  hostname: 'localhost.gojabako.zone',
  port: 3000,
};
const app = next({
  dev: process.env.NODE_ENV !== 'production',
  hostname: config.hostname,
  port: config.port,
});
await app.prepare();
const handleRequest = app.getRequestHandler();
const certsDir = new URL(`./certificates/${config.hostname}/`, import.meta.url);
const { rootUrl, server } = config.noHttps
  ? {
      rootUrl: new URL(`http://${config.hostname}:${config.port}`),
      server: http.createServer(),
    }
  : {
      rootUrl: new URL(`https://${config.hostname}:${config.port}`),
      server: https.createServer({
        key: await fs.readFile(new URL('privkey.pem', certsDir)),
        cert: await fs.readFile(new URL('fullchain.pem', certsDir)),
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
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const onRequest = (req, res) => {
  const parsedUrl = parseUrl(req.url);
  if (!parsedUrl.pathname.startsWith('/_')) {
    console.info(`${req.method} ${req.url}`);
  }
  handleRequest(req, res, parsedUrl).catch(console.error);
};
server.once('error', (error) => {
  console.error(error);
  process.exit(1);
});
server.once('listening', () => console.info(`> Ready on ${rootUrl.href}`));
server.on('request', onRequest);
server.listen(config.port);
