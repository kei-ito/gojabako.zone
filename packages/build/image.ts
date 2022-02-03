import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import sharp from 'sharp';
import {Array, console, Error, JSON, Map, Promise} from '../es/global';
import {isPositiveInteger} from '../es/isInteger';
import {isObjectLike} from '../es/isObjectLike';
import {isString} from '../es/isString';
import {serializeNs} from '../es/serializeNs';
import {rootDirectoryPath} from '../fs/constants';
import {rmrf} from '../fs/rmrf';
import {getHash} from '../node/getHash';
import {runScript} from '../node/runScript';

const ProcessorVersion = '2022-02-03';
const ResultFileName = 'results.json';
const widthList = [300, 400, 500, 600, 800, 1000, 1200, 1500, 1800];

interface OutputResult {
    name: string,
    format: string,
    size: number,
    width: number,
    height: number,
}

interface ProcessResult {
    hash: string,
    version: string,
    relativePath: string,
    format: string,
    results: Array<OutputResult>,
}

runScript(async () => {
    if (process.argv.length !== 4) {
        throw new Error(`InvalidArgs: ${process.argv.slice(2).join(' ')}`);
    }
    const [,, sourceFileAbsolutePath, outputDirectoryAbsolutePath] = process.argv;
    const relativePath = path.relative(rootDirectoryPath, sourceFileAbsolutePath);
    const [source, cached] = await Promise.all([
        loadSource(sourceFileAbsolutePath),
        loadCache(path.join(outputDirectoryAbsolutePath, ResultFileName)),
    ]);
    const result = await processImage({sourceFileAbsolutePath, outputDirectoryAbsolutePath, source, cached});
    const code = [...serializeSrcSetScript(result)].join('\n');
    await fs.promises.writeFile(`${sourceFileAbsolutePath}.component.tsx`, code);
    console.info(`${relativePath}: done`);
});

const listPatterns = async function* (image: sharp.Sharp): AsyncGenerator<[sharp.Sharp, string]> {
    const {width: originalWidth, format} = await image.metadata();
    if (!originalWidth) {
        throw new Error(`Unknown width: ${originalWidth}`);
    }
    for (const width of widthList) {
        if (width <= originalWidth) {
            const resized = image.clone().resize(width, null);
            const basename = `${width}w`;
            yield [resized.clone().webp({reductionEffort: 6}), `${basename}.webp`];
            yield [resized.clone().avif({speed: 0}), `${basename}.avif`];
            switch (format) {
            case 'png':
                yield [resized.clone().png({compressionLevel: 9}), `${basename}.png`];
                break;
            case 'jpeg':
            case 'jpg':
            default:
                yield [resized.clone().jpeg({progressive: true}), `${basename}.jpg`];
            }
        }
    }
};

const isOutputResult = (input: unknown): input is OutputResult => {
    if (isObjectLike(input)) {
        const {name, format, size, width, height} = input;
        return isString(name) && isString(format) && isPositiveInteger(size) && isPositiveInteger(width) && isPositiveInteger(height);
    }
    return false;
};

const loadSource = async (sourceFileAbsolutePath: string) => {
    const buffer = await fs.promises.readFile(sourceFileAbsolutePath);
    const hash = getHash(buffer, widthList.join('-')).toString('base64url');
    return {buffer, hash};
};

const loadCache = async (resultFilePath: string): Promise<ProcessResult | null> => {
    const json = await fs.promises.readFile(resultFilePath, 'utf8').catch((error) => {
        if (isObjectLike(error) && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    });
    if (!json) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(json);
        if (!isObjectLike(parsed)) {
            return null;
        }
        const {hash, version, relativePath, format, results} = parsed;
        if (!(isString(hash) && isString(version) && isString(relativePath) && isString(format) && Array.isArray(results))) {
            return null;
        }
        if (!results.every((item) => isOutputResult(item))) {
            return null;
        }
        return {hash, version, relativePath, format, results};

    } catch {
        // do nothing
    }
    return null;
};

const processImage = async (
    {source, cached, sourceFileAbsolutePath, outputDirectoryAbsolutePath}: {
        source: {buffer: Buffer, hash: string},
        cached: ProcessResult | null,
        sourceFileAbsolutePath: string,
        outputDirectoryAbsolutePath: string,
    },
) => {
    const relativePath = path.relative(path.join(rootDirectoryPath, 'src'), sourceFileAbsolutePath);
    if (cached && cached.hash === source.hash && cached.version === ProcessorVersion) {
        return cached;
    }
    const image = sharp(source.buffer);
    const metadata = await image.metadata();
    if (metadata.format === 'heif') {
        await image.clone().jpeg({progressive: true}).toFile(sourceFileAbsolutePath);
    }
    if (metadata.exif) {
        console.info(`${relativePath}: deleting EXIF`);
        await image.toFile(sourceFileAbsolutePath);
    }
    await rmrf(outputDirectoryAbsolutePath);
    await fs.promises.mkdir(outputDirectoryAbsolutePath, {recursive: true});
    const results: Array<sharp.OutputInfo & {name: string}> = [];
    for await (const [resized, name] of listPatterns(image)) {
        const startedAt = process.hrtime.bigint();
        const info = await resized.toFile(path.join(outputDirectoryAbsolutePath, name));
        const elapsed = process.hrtime.bigint() - startedAt;
        console.info(`${relativePath}: ${name} (${serializeNs(elapsed)})`);
        results.push({...info, name});
    }
    const processResult: ProcessResult = {
        hash: source.hash,
        version: ProcessorVersion,
        relativePath,
        format: metadata.format as string,
        results,
    };
    await fs.promises.writeFile(
        path.join(outputDirectoryAbsolutePath, ResultFileName),
        JSON.stringify(processResult, null, 4),
    );
    return processResult;
};

const serializeSrcSetScript = function* (processResult: ProcessResult) {
    const resultMap = new Map<string, Array<OutputResult>>();
    const getList = (format: string) => {
        const list = resultMap.get(format) || [];
        resultMap.set(format, list);
        return list;
    };
    for (const result of processResult.results) {
        getList(result.format).push(result);
    }
    const normalized = `/images/${processResult.relativePath.split(path.sep).join('/')}`;
    yield '/* eslint-disable @next/next/no-img-element */';
    yield 'import type {DetailedHTMLProps, ImgHTMLAttributes} from \'react\';';
    yield 'const Image = (';
    yield '    props: Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, \'src\' | \'srcset\'>,';
    yield ') => <picture>';
    for (const [format, results] of resultMap) {
        const srcset = results.map(({name, width}) => `${normalized}/${name} ${width}w`).join(', ');
        if (processResult.format === format) {
            yield `    <img alt="" {...props} srcSet="${srcset}" />`;
        } else {
            yield `    <source srcSet="${srcset}" type="${getType(format)}" />`;
        }
    }
    yield '</picture>;';
    yield 'export default Image;';
    yield '';
};

const getType = (format: string): string | null => {
    switch (format) {
    case 'webp':
        return 'image/webp';
    case 'avif':
        return 'image/avif';
    case 'heif':
    case 'jpg':
    case 'jpeg':
        return 'image/jpeg';
    case 'png':
        return 'image/png';
    case 'svg':
        return 'image/svg+xml';
    default:
        throw new Error(`UnsupportedFormat: ${format}`);
    }
};
