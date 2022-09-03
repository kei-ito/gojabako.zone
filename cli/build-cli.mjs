import * as console from 'console';
import * as fs from 'fs';
import {builtinModules} from 'module';
import * as nodepath from 'path';
import * as esbuild from 'esbuild';
import {rootDirectory} from '../paths.mjs';

/** @param {boolean} includeDev */
export const markDependenciesAsExternal = (includeDev) => {
    const packageJson = JSON.parse(fs.readFileSync(nodepath.join(rootDirectory, 'package.json'), 'utf8'));
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

const buildDirectoryPath = nodepath.join(rootDirectory, 'packages/build');
for (const name of await fs.promises.readdir(buildDirectoryPath)) {
    if (name.endsWith('.ts')) {
        await esbuild.build({
            entryPoints: [nodepath.join(buildDirectoryPath, name)],
            outfile: nodepath.join(rootDirectory, `.output/build/${name.slice(0, -3)}.mjs`),
            plugins: [markDependenciesAsExternal({includeDev: true})],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
        console.info(`BuildCLI: ${name}`);
    }
}
