import * as fs from 'fs';
import {projectRootUrl} from './url';

interface PackageJson {
    siteName: string,
    authorName: string,
    homepage: string,
}

let promise: Promise<PackageJson> | null = null;

export const loadPackageJson = async (): Promise<PackageJson> => {
    if (!promise) {
        promise = load();
    }
    return await promise;
};

const load = async (): Promise<PackageJson> => {
    const packageJsonPath = new URL('package.json', projectRootUrl);
    const jsonString = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson: unknown = JSON.parse(jsonString);
    if (!isPackageJson(packageJson)) {
        throw new Error(`InvalidPackageJson: ${jsonString}`);
    }
    return packageJson;
};

const isPackageJson = (input: unknown): input is PackageJson => {
    if (!isRecordLike(input)) {
        return false;
    }
    if (!isString(input.siteName)) {
        return false;
    }
    if (!isString(input.authorName)) {
        return false;
    }
    if (!isString(input.homepage)) {
        return false;
    }
    return true;
};

const isRecordLike = (input: unknown): input is Record<string, unknown> => {
    switch (typeof input) {
    case 'object':
    case 'function':
        return Boolean(input);
    default:
        return false;
    }
};

const isString = (input: unknown): input is string => typeof input === 'string';
