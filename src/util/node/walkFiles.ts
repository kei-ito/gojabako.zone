import * as fs from "node:fs/promises";

export const walkFiles = async function* (file: URL): AsyncGenerator<URL> {
	const stats = await fs.stat(file);
	if (stats.isFile()) {
		yield file;
		return;
	}
	if (stats.isDirectory()) {
		file.pathname = file.pathname.replace(/\/*$/, "/");
		for (const name of await fs.readdir(file)) {
			yield* walkFiles(new URL(name, file));
		}
	}
};
