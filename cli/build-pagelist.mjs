import * as path from 'path';
import {URL, fileURLToPath} from 'url';
import {generatePageList} from '@gjbkz/gojabako.zone-build-pagelist';

// eslint-disable-next-line @nlib/no-globals
const rootDirectory = fileURLToPath(new URL('..', import.meta.url));
const pagesDirectory = path.join(rootDirectory, 'pages');
const dest = path.join(rootDirectory, 'packages/site/pageList.ts');

await generatePageList({rootDirectory, pagesDirectory, dest});
