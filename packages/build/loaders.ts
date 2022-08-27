import * as path from 'path';
import * as esbuild from 'esbuild';
import {console} from '../es/global';
import {markDependenciesAsExternal} from '../esbuild/markDependenciesAsExternal';
import {rootDirectoryPath} from '../fs/constants';
import {runScript} from '../node/runScript';

const loaderList = [
    'module.md',
    'page.md',
];

runScript(async () => {
    for (const loaderName of loaderList) {
        await esbuild.build({
            entryPoints: [path.join(rootDirectoryPath, `packages/loader/${loaderName}.ts`)],
            outfile: path.join(rootDirectoryPath, `.output/loader/${loaderName}.mjs`),
            plugins: [markDependenciesAsExternal()],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
        console.info(`BuildLoader: ${loaderName} done.`);
    }
});
