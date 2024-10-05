import { type PathToFileUrlOptions, pathToFileURL } from "node:url";

export const filePathToFileUrl = pathToFileURL as (
	filePath: string,
	options?: PathToFileUrlOptions,
) => URL;
