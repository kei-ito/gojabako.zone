/* eslint-disable @typescript-eslint/unbound-method */
import * as console from 'node:console';
import * as fs from 'node:fs/promises';
import type * as http from 'node:http';
import * as https from 'node:https';
import * as process from 'node:process';
import * as url from 'node:url';
import next from 'next';

const hostname = 'localhost.gojabako.zone';
const port = 3000;
const certsDir = new URL(`./certificates/${hostname}/`, import.meta.url);
const rootUrl = new URL(`https://${hostname}:${port}`);
const server = https.createServer({
  key: await fs.readFile(new URL('privkey.pem', certsDir)),
  cert: await fs.readFile(new URL('fullchain.pem', certsDir)),
});
server.once('error', (error) => {
  console.error(error);
  process.exit(1);
});
server.once('listening', () => console.info(`> Ready on ${rootUrl.href}`));

const nextDevServer = next({
  dev: true,
  dir: process.cwd(),
  hostname,
  port,
  httpServer: server,
});
await nextDevServer.prepare();

const parseUrl = (requestPath = '/') => {
  const parsedUrl = url.parse(new URL(requestPath, rootUrl).href, true);
  return {
    ...parsedUrl,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    query: parsedUrl.query || {},
    pathname: parsedUrl.pathname ?? '',
  };
};
const handleRequest = nextDevServer.getRequestHandler();
const onRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = parseUrl(req.url);
  if (parsedUrl.pathname.startsWith('/_')) {
    console.info(`debug: ${req.method} ${req.url}`);
  } else {
    console.info(`${req.method} ${req.url}`);
  }
  handleRequest(req, res, parsedUrl).catch(console.error);
};
server.on('request', onRequest);
const upgradeHandler = nextDevServer.getUpgradeHandler();
server.on('upgrade', (req, socket, head) => {
  upgradeHandler(req, socket, head).catch(console.error);
});
server.listen(port);
