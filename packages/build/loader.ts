import * as esbuild from 'esbuild';
import {builtinModules} from 'module';
import {Boolean, Error, URL} from '../es/global';
import {runScript} from '../node/runScript';
import {packageJson, rootDirectoryUrl} from '../fs/constants';

const loaderList = [
    'module.md',
    'page.md',
];

const externalChecker: esbuild.Plugin = {
    name: 'externalChecker',
    setup: (build) => {
        build.onResolve({filter: /^[^.]/}, ({path, importer}) => {
            if (!importer) {
                return null;
            }
            let slashIndex = path.indexOf('/');
            if (slashIndex < 0) {
                slashIndex = path.length;
            }
            const moduleName = path.slice(0, slashIndex);
            if (builtinModules.includes(moduleName) || moduleName in packageJson.dependencies) {
                return {path, external: Boolean(importer)};
            }
            throw new Error(`${importer} imports ${path} (${moduleName}) but dependencies doesn't have it.`);
        });
    },
};

runScript(async () => {
    for (const loadernName of loaderList) {
        await esbuild.build({
            entryPoints: [new URL(`packages/loader/${loadernName}.ts`, rootDirectoryUrl).pathname],
            outfile: new URL(`.next/loader/${loadernName}.mjs`, rootDirectoryUrl).pathname,
            plugins: [externalChecker],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
    }
});
