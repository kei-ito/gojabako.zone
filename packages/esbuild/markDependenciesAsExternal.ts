import type * as esbuild from 'esbuild';
import {builtinModules} from 'module';
import {Error} from '../es/global';
import {packageJson} from '../fs/constants';

export const markDependenciesAsExternal = (
    {includeDev}: {includeDev?: boolean} = {},
): esbuild.Plugin => ({
    name: 'markDependenciesAsExternal',
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
            if (builtinModules.includes(moduleName)) {
                return {path, external: true};
            }
            if (includeDev && (moduleName in packageJson.devDependencies)) {
                return {path, external: true};
            }
            if (moduleName in packageJson.dependencies) {
                return {path, external: true};
            }
            throw new Error(`${importer} imports ${path} (${moduleName}) but dependencies doesn't have it.`);
        });
    },
});
