import { pathToFileURL, PathToFileUrlOptions } from "node:url";

export const filePathToFileUrl = pathToFileURL as (filePath: string, options?: PathToFileUrlOptions) => URL;
