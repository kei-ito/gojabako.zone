import {getExtension} from '../es/getExtension';

export const isImageFileName = (
    filePath: string,
    ignoredDirectories: Array<string> = [],
) => {
    switch (getExtension(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.svg':
    case '.heic':
        return !ignoredDirectories.some((d) => filePath.startsWith(d));
    default:
        return false;
    }
};
