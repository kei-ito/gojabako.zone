import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import sharp from 'sharp';
import {Array, console, Error, JSON, Map} from '../es/global';
import {isPositiveInteger} from '../es/isInteger';
import {isObjectLike} from '../es/isObjectLike';
import {isString} from '../es/isString';
import {serializeNs} from '../es/serializeNs';
import {rootDirectoryPath} from '../fs/constants';
import {statsOrNull, statsOrNullSync} from '../fs/statsOrNull';
import {getHash} from '../node/getHash';
import {runScript} from '../node/runScript';

type ImageFormat = keyof sharp.FormatEnum;

const ProcessorVersion = 'v1';
const ResultFileName = 'results.json';
const widthList = [300, 400, 500, 600, 800, 1000, 1200, 1500, 1800];

interface OutputResult {
    name: string,
    format: ImageFormat,
    width: number,
}

const isOutputResult = (input: unknown): input is OutputResult => {
    if (isObjectLike(input)) {
        const {name, format, size, width, height} = input;
        return isString(name) && isString(format) && isPositiveInteger(size) && isPositiveInteger(width) && isPositiveInteger(height);
    }
    return false;
};

interface ProcessResult {
    hash: string,
    version: string,
    relativePath: string,
    format: string,
    width: number,
    height: number,
    results: Array<OutputResult>,
}

const isProcessResult = (input: unknown): input is ProcessResult => isObjectLike(input)
&& isString(input.hash)
&& isString(input.version)
&& isString(input.relativePath)
&& isString(input.format)
&& isPositiveInteger(input.width)
&& isPositiveInteger(input.height)
&& Array.isArray(input.results)
&& input.results.every((item) => isOutputResult(item));

runScript(async () => {
    if (process.argv.length !== 3) {
        throw new Error(`InvalidArgs: ${process.argv.slice(2).join(' ')}`);
    }
    const sourceFileAbsolutePath = process.argv[2];
    const relativePath = path.relative(rootDirectoryPath, sourceFileAbsolutePath);
    const source = await loadSource(sourceFileAbsolutePath);
    const outputDirectoryAbsolutePath = path.join(rootDirectoryPath, 'public', ...listOutputImagePathFragments(source.hash));
    const cached = await loadCache(path.join(outputDirectoryAbsolutePath, ResultFileName));
    const result = await processImage({sourceFileAbsolutePath, source, cached});
    const code = [...serializeSrcSetScript(result)].join('\n');
    await fs.promises.writeFile(`${sourceFileAbsolutePath}.component.tsx`, code);
    console.info(`${relativePath}: done`);
});

const listOutputImagePathFragments = function* (hash: string) {
    yield 'images';
    yield ProcessorVersion;
    yield hash.slice(0, 8);
};

const listWidthPatterns = function* (originalWidth: number) {
    let widthPatternCount = 0;
    for (const width of widthList) {
        if (width <= originalWidth) {
            widthPatternCount++;
            yield width;
        }
    }
    if (widthPatternCount === 0) {
        yield originalWidth;
    }
};

const listPatterns = function* (
    {image, metadata: {width: originalWidth, format}}: {
        image: sharp.Sharp,
        metadata: {
            width: number,
            format: ImageFormat,
        },
    },
): Generator<[sharp.Sharp, number, ImageFormat]> {
    for (const width of listWidthPatterns(originalWidth)) {
        const resized = image.clone().resize(width, null);
        yield [resized.clone().webp({reductionEffort: 6}), width, 'webp'];
        yield [resized.clone().avif({speed: 0}), width, 'avif'];
        switch (format) {
        case 'png':
            yield [resized.clone().png({compressionLevel: 9}), width, 'png'];
            break;
        case 'jpeg':
        case 'jpg':
        default:
            yield [resized.clone().jpeg({progressive: true}), width, 'jpeg'];
        }
    }
};

const loadSource = async (sourceFileAbsolutePath: string) => {
    const buffer = await fs.promises.readFile(sourceFileAbsolutePath);
    const hash = getHash(buffer).toString('base64url');
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
        return isProcessResult(parsed) ? parsed : null;
    } catch {
        // do nothing
    }
    return null;
};

const processImage = async (
    {source, cached, sourceFileAbsolutePath}: {
        source: {buffer: Buffer, hash: string},
        cached: ProcessResult | null,
        sourceFileAbsolutePath: string,
    },
) => {
    const outputDirectoryAbsolutePath = path.join(rootDirectoryPath, 'public', ...listOutputImagePathFragments(source.hash));
    const relativePath = path.relative(path.join(rootDirectoryPath, 'src'), sourceFileAbsolutePath);
    if (testCache(source, cached, outputDirectoryAbsolutePath)) {
        return cached;
    }
    const loaded = await loadImage(source.buffer, sourceFileAbsolutePath);
    await fs.promises.mkdir(outputDirectoryAbsolutePath, {recursive: true});
    const results: Array<OutputResult> = [];
    for (const [resized, width, format] of listPatterns(loaded)) {
        const name = `${width}w${getExtension(format)}`;
        const dest = path.join(outputDirectoryAbsolutePath, name);
        const stats = await statsOrNull(dest);
        if (!stats || !stats.isFile()) {
            const startedAtNs = process.hrtime.bigint();
            await resized.toFile(dest);
            const elapsedNs = process.hrtime.bigint() - startedAtNs;
            console.info(`${relativePath}: ${name} (${serializeNs(elapsedNs)})`);
        }
        results.push({format, width, name});
    }
    const processResult: ProcessResult = {
        hash: source.hash,
        version: ProcessorVersion,
        relativePath,
        format: loaded.metadata.format,
        width: loaded.metadata.width,
        height: loaded.metadata.height,
        results,
    };
    await fs.promises.writeFile(
        path.join(outputDirectoryAbsolutePath, ResultFileName),
        JSON.stringify(processResult, null, 4),
    );
    return processResult;
};

const testCache = (
    {hash}: {hash: string},
    cached: ProcessResult | null,
    outputDirectoryAbsolutePath: string,
): cached is ProcessResult => {
    if (!cached) {
        return false;
    }
    if (cached.hash !== hash) {
        return false;
    }
    if (cached.version !== ProcessorVersion) {
        return false;
    }
    for (const {name} of cached.results) {
        const stats = statsOrNullSync(path.join(outputDirectoryAbsolutePath, name));
        if (!stats) {
            return false;
        }
    }
    return true;
};

const loadImage = async (
    buffer: Buffer,
    sourceFileAbsolutePath: string,
) => {
    const image = sharp(buffer);
    const metadata = await loadImageMetadata(image);
    if (metadata.format === 'heif') {
        console.info(`${sourceFileAbsolutePath}: convert heif to jpg`);
        await image.clone().jpeg({progressive: true}).toFile(sourceFileAbsolutePath);
    }
    if (metadata.exif) {
        console.info(`${sourceFileAbsolutePath}: deleting EXIF`);
        await image.toFile(sourceFileAbsolutePath);
    }
    return {image, metadata};
};

const loadImageMetadata = async (image: sharp.Sharp) => {
    const {format, width, height, ...props} = await image.metadata();
    if (!format || !(format in sharp.format)) {
        throw new Error(`UnkonwnFormat: ${format}`);
    }
    if (!isPositiveInteger(width)) {
        throw new Error(`InvalidWidth: ${width}`);
    }
    if (!isPositiveInteger(height)) {
        throw new Error(`InvalidHeight: ${height}`);
    }
    return {...props, format, width, height};
};

const serializeSrcSetScript = function* (processResult: ProcessResult) {
    const resultMap = new Map<ImageFormat, Array<OutputResult>>();
    const getList = (format: ImageFormat) => {
        const list = resultMap.get(format) || [];
        resultMap.set(format, list);
        return list;
    };
    for (const result of processResult.results) {
        getList(result.format).push(result);
    }
    const directoryPath = ['', ...listOutputImagePathFragments(processResult.hash)].join('/');
    yield '/* eslint-disable @next/next/no-img-element */';
    yield 'import type {DetailedHTMLProps, ImgHTMLAttributes} from \'react\';';
    yield 'const Image = (';
    yield '    props: Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, \'height\' | \'src\' | \'srcset\' | \'width\'>,';
    const aspectRatioStyle = `style={{aspectRatio: '${processResult.width}/${processResult.height}'}}`;
    yield `) => <picture ${aspectRatioStyle}>`;
    for (const [format, results] of resultMap) {
        const srcset = results.map(({name, width}) => `${directoryPath}/${name} ${width}w`).join(', ');
        if (processResult.format === format) {
            yield `    <img alt="" {...props} srcSet="${srcset}" ${aspectRatioStyle} />`;
        } else {
            yield `    <source srcSet="${srcset}" type="${getType(format)}" />`;
        }
    }
    yield '</picture>;';
    yield 'export default Image;';
    yield '';
};

const getType = (format: ImageFormat): string => {
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

const getExtension = (format: ImageFormat): string => {
    switch (format) {
    case 'webp':
        return '.webp';
    case 'avif':
        return '.avif';
    case 'heif':
    case 'jpg':
    case 'jpeg':
        return '.jpg';
    case 'png':
        return '.png';
    case 'svg':
        return '.svg';
    default:
        throw new Error(`UnsupportedFormat: ${format}`);
    }
};
