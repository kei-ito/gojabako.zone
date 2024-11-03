import * as console from "node:console";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { watch } from "chokidar";
import { rootDir, srcDir } from "../util/node/directories.ts";
import { generateCssModuleType } from "../util/node/generateCssModuleType.ts";
import { ignoreENOENT } from "../util/node/ignoreENOENT.ts";
import { walkFiles } from "../util/node/walkFiles.ts";

const cliName = import.meta.url.slice(rootDir.href.length);
const scssSuffix = ".module.scss";
const rootPath = fileURLToPath(rootDir);

const generate = async (scssFilePath: string) => {
	const dest = await generateCssModuleType(scssFilePath);
	console.info(`${cliName}: Generated ${dest.slice(rootPath.length)}`);
	return dest;
};

const cleanup = async (dtsFilePath: string) => {
	await unlink(dtsFilePath);
	console.info(`${cliName}: Removed ${dtsFilePath.slice(rootPath.length)}`);
};

if (process.argv.includes("--watch")) {
	const onChange = (filePath: string) => {
		if (filePath.endsWith(scssSuffix)) {
			generate(filePath).catch(ignoreENOENT({ throw: false }));
		}
	};
	const onUnlink = (filePath: string) => {
		if (filePath.endsWith(scssSuffix)) {
			cleanup(`${filePath}.d.ts`).catch(ignoreENOENT({ throw: false }));
		}
	};
	watch(fileURLToPath(srcDir), { ignoreInitial: true })
		.on("add", onChange)
		.on("change", onChange)
		.on("unlink", onUnlink);
} else {
	const processed = new Set<string>();
	const found = new Set<string>();
	for await (const file of walkFiles(srcDir)) {
		const filePath = fileURLToPath(file);
		if (filePath.endsWith(scssSuffix)) {
			processed.add(await generate(filePath));
		} else if (filePath.endsWith(`${scssSuffix}.d.ts`)) {
			found.add(filePath);
		}
	}
	for (const filePath of found) {
		if (!processed.has(filePath)) {
			await cleanup(filePath).catch(ignoreENOENT());
		}
	}
	console.info(`${cliName}: done`);
}
