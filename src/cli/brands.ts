import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { brandIconDir, rootDir, srcDir } from "../util/node/directories.ts";
import { formatCode } from "../util/node/formatCode.ts";

const cliName = import.meta.url.slice(rootDir.href.length);

if (process.env.CI) {
	console.info(`${cliName}: skipped`);
	process.exit();
}

const listBrandIconNames = async function* (): AsyncGenerator<string> {
	let count = 0;
	for (const name of await readdir(brandIconDir)) {
		const matched = /(.*)\.svg/.exec(name);
		if (matched) {
			yield matched[1];
			count += 1;
		}
	}
	console.info(`${cliName}: ${count} icons`);
};

const generateCode = async function* () {
	yield 'import type { Nominal } from "@nlib/typing";';
	yield "export type BrandName = Nominal<string, 'BrandName'>;";
	for await (const iconName of listBrandIconNames()) {
		const key = iconName.replace(/(?:^|\W+)(\w)/g, (_, c) => c.toUpperCase());
		yield `export const Brand${key} = "${iconName}" as BrandName;`;
	}
};

let code = "";
for await (const chunk of generateCode()) {
	code += chunk;
}
const dest = new URL("util/brands.ts", srcDir);
await writeFile(
	dest,
	await formatCode(code, { filePath: fileURLToPath(dest) }),
);
console.info(`${cliName}: done`);
