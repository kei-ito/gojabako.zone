import * as console from "node:console";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { watch } from "chokidar";
import { rootDir, srcDir } from "../util/node/directories.mts";
import { generateCssModuleType } from "../util/node/generateCssModuleType.mts";
import { ignoreENOENT } from "../util/node/ignoreENOENT.mts";
import { walkFiles } from "../util/node/walkFiles.mts";

const scssSuffix = ".module.scss";
const rootPath = fileURLToPath(rootDir);

const generate = async (scssFilePath: string) => {
  const dest = await generateCssModuleType(scssFilePath);
  console.info(`Generated ${dest.slice(rootPath.length)}`);
  return dest;
};

const cleanup = async (dtsFilePath: string) => {
  await unlink(dtsFilePath);
  console.info(`Removed ${dtsFilePath.slice(rootPath.length)}`);
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
}
