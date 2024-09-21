import { copyFile, mkdir } from "node:fs/promises";
import { rootDir } from "../util/node/directories.mts";
import { walkFiles } from "../util/node/walkFiles.mts";

const fontDir = new URL("node_modules/@fontsource/noto-sans-jp/", rootDir);

const fontFilesDir = new URL("files/", fontDir);
const destDir = new URL("public/fonts/noto-sans-jp/", rootDir);
await mkdir(destDir, { recursive: true });
for await (const src of walkFiles(fontFilesDir)) {
  if (!/files\/noto-sans-jp-\d+-\d+-\w+|\.woff2$/.test(src.pathname)) {
    const filePath = src.pathname.slice(fontFilesDir.pathname.length).slice(13);
    const dest = new URL(filePath, destDir);
    await copyFile(src, dest);
  }
}
