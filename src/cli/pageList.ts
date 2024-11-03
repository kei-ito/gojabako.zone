import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { appDir, rootDir, srcDir } from "../util/node/directories.ts";
import { formatCode } from "../util/node/formatCode.ts";
import { getPageData } from "../util/node/getPageData.ts";
import { walkFiles } from "../util/node/walkFiles.ts";
import type { PageData } from "../util/type.ts";

const cliName = import.meta.url.slice(rootDir.href.length);

if (process.env.CI) {
	console.info(`${cliName}: skipped`);
	process.exit();
}

const listPageFiles = async function* (): AsyncGenerator<URL> {
	let count = 0;
	for await (const fileUrl of walkFiles(appDir)) {
		if (/\/page\.\w+$/.test(fileUrl.pathname)) {
			count += 1;
			yield fileUrl;
		}
	}
	console.info(`${cliName}: ${count} pages`);
};

const generateCode = async function* () {
	const tasks: Array<Promise<PageData>> = [];
	for await (const fileUrl of listPageFiles()) {
		tasks.push(getPageData(fileUrl));
	}
	const pageList = await Promise.all(tasks);
	pageList.sort((a, b) => {
		return (
			b.group.localeCompare(a.group) ||
			b.publishedAt.localeCompare(a.publishedAt)
		);
	});
	yield "import type { PageData } from './type.ts';\n";
	yield "export const pageList: Array<PageData> = ";
	yield* JSON.stringify(pageList);
	yield ";";
};

let code = "";
for await (const chunk of generateCode()) {
	code += chunk;
}
const dest = new URL("util/pageList.ts", srcDir);
await writeFile(
	dest,
	await formatCode(code, { filePath: fileURLToPath(dest) }),
);
console.info(`${cliName}: done`);
