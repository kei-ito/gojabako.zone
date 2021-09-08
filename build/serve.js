import * as http from 'http';
import * as path from 'path';
import * as console from 'console';
import * as process from 'process';
import connect from 'connect';
import * as livereload from 'middleware-static-livereload';

const documentRoot = path.join(path.dirname(import.meta.url.slice(7)), '../src');
const app = connect();
app.use(livereload.middleware({documentRoot}));
const server = http.createServer(app)
.once('error', (error) => {
    console.error(error);
    process.exit(1);
})
.once('listening', () => {
    console.info(server.address());
})
.listen(3000);
