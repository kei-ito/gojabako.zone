import * as esbuild from 'esbuild';
import * as path from 'path';
import {console} from '../es/global';
import {markDependenciesAsExternal} from '../esbuild/markDependenciesAsExternal';
import {rootDirectoryPath} from '../fs/constants';
import {runScript} from '../node/runScript';

const loaderList = [
    'module.md',
    'page.md',
];

runScript(async () => {
    for (const loadernName of loaderList) {
        await esbuild.build({
            entryPoints: [path.join(rootDirectoryPath, `packages/loader/${loadernName}.ts`)],
            outfile: path.join(rootDirectoryPath, `.output/loader/${loadernName}.mjs`),
            plugins: [markDependenciesAsExternal()],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
        console.info(`BuildLoader: ${loadernName} done.`);
    }
});
