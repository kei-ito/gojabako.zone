import { fileURLToPath } from "node:url";
import type { RequiredOptions } from "prettier";
import { format, resolveConfig } from "prettier";
import { rootDir } from "./directories.mts";

export const formatCode = async (
  code: string,
  options?: RequiredOptions,
): Promise<string> => {
  const configFile = new URL(".prettierrc.json", rootDir);
  return await format(code, {
    parser: "typescript",
    ...(await resolveConfig(fileURLToPath(configFile))),
    ...options,
  });
};
