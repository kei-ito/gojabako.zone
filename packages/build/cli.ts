import * as console from 'console';
import * as fs from 'fs';
import * as path from 'path';
import * as esbuild from 'esbuild';
import {rootDirectory} from '../../paths.mjs';
import {markDependenciesAsExternal} from '../esbuild/markDependenciesAsExternal';

const buildDirectoryPath = path.join(rootDirectory, 'packages/build');
for (const name of await fs.promises.readdir(buildDirectoryPath)) {
    if (name !== 'cli.ts' && name.endsWith('.ts')) {
        await esbuild.build({
            entryPoints: [path.join(buildDirectoryPath, name)],
            outfile: path.join(rootDirectory, `.output/build/${name.slice(0, -3)}.mjs`),
            plugins: [markDependenciesAsExternal({includeDev: true})],
            bundle: true,
            target: 'esnext',
            format: 'esm',
        });
        console.info(`BuildCLI: ${name}`);
    }
}
