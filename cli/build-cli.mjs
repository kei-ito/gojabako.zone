import * as console from 'console';
import * as fs from 'fs';
import {builtinModules} from 'module';
import * as path from 'path';
import * as esbuild from 'esbuild';
import {rootDirectory} from '../paths.mjs';

/** @param {{outfile: string, includeDev?: boolean}} props */
export const markDependenciesAsExternal = ({outfile, includeDev}) => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'package.json'), 'utf8'));
    const externalModuleNames = new Set([
        ...builtinModules,
        ...Object.keys(packageJson.dependencies),
        ...(includeDev ? Object.keys(packageJson.devDependencies) : []),
    ]);
    const pathToPaths = path.relative(path.dirname(outfile), path.join(rootDirectory, 'paths.mjs'));
    return {
        name: 'markDependenciesAsExternal',
        setup: (build) => {
            build.onResolve({filter: /^\./}, ({path: importee}) => {
                if (importee.endsWith('/paths.mjs')) {
                    return {path: pathToPaths, external: true};
                }
                return null;
            });
            build.onResolve({filter: /^[^.]/}, ({path: importee, importer}) => {
                if (!importer) {
                    return null;
                }
                if (externalModuleNames.has(importee)) {
                    return {path: importee, external: true};
                }
                let slashIndex = importee.indexOf('/');
                if (slashIndex < 0) {
                    slashIndex = importee.length;
                }
                const moduleName = importee.slice(0, slashIndex);
                if (externalModuleNames.has(moduleName)) {
                    return {path: importee, external: true};
                }
                throw new Error(`${importer} imports ${importee} (${moduleName}) but dependencies doesn't have it: ${JSON.stringify([...externalModuleNames], null, 2)}`);
            });
        },
    };
};

const buildDirectoryPath = path.join(rootDirectory, 'packages/build');
for (const name of await fs.promises.readdir(buildDirectoryPath)) {
    if (name.endsWith('.ts')) {
        const outfile = path.join(rootDirectory, `.output/build/${name.slice(0, -3)}.mjs`);
        await esbuild.build({
            entryPoints: [path.join(buildDirectoryPath, name)],
            outfile,
            plugins: [markDependenciesAsExternal({outfile, includeDev: true})],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
        console.info(`BuildCLI: ${name}`);
    }
}
