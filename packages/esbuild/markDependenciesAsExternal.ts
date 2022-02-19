import type * as esbuild from 'esbuild';
import {builtinModules} from 'module';
import {Error, JSON, Object, Set} from '../es/global';
import {packageJson} from '../fs/constants';

export const markDependenciesAsExternal = (
    {includeDev}: {includeDev?: boolean} = {includeDev: false},
): esbuild.Plugin => {
    const externalModuleNames = new Set([
        ...builtinModules,
        ...Object.keys(packageJson.dependencies),
        ...(includeDev ? Object.keys(packageJson.devDependencies) : []),
    ]);
    return {
        name: 'markDependenciesAsExternal',
        setup: (build) => {
            build.onResolve({filter: /^[^.]/}, ({path, importer}) => {
                if (!importer) {
                    return null;
                }
                if (externalModuleNames.has(path)) {
                    return {path, external: true};
                }
                let slashIndex = path.indexOf('/');
                if (slashIndex < 0) {
                    slashIndex = path.length;
                }
                const moduleName = path.slice(0, slashIndex);
                if (externalModuleNames.has(moduleName)) {
                    return {path, external: true};
                }
                throw new Error(`${importer} imports ${path} (${moduleName}) but dependencies doesn't have it: ${JSON.stringify([...externalModuleNames], null, 2)}`);
            });
        },
    };
};
