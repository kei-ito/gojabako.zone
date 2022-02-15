import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import sharp from 'sharp';
import {console, Error, JSON, Map} from '../es/global';
import {isPositiveInteger} from '../es/isInteger';
import {serializeNs} from '../es/serializeNs';
import {rootDirectoryPath} from '../fs/constants';
import {statOrNull, statOrNullSync} from '../fs/statOrNull';
import type {ImageFormat} from '../image/constants';
import {ImageProcessorHashEncoding, ImageProcessorResultFileName, ImageProcessorVersion, ImageProcessorWidthList} from '../image/constants';
import type {ImageOutputResult} from '../image/isImageOutputResult';
import type {ImageProcessorResult} from '../image/isImageProcessorResult';
import {loadImageProcessorResult} from '../image/loadImageProcessorResult';
import {getHash} from '../node/getHash';
import {runScript} from '../node/runScript';

runScript(async () => {
    if (process.argv.length !== 3) {
        throw new Error(`InvalidArgs: ${process.argv.slice(2).join(' ')}`);
    }
    const sourceFileAbsolutePath = process.argv[2];
    const relativePath = path.relative(rootDirectoryPath, sourceFileAbsolutePath);
    const source = await loadSource(sourceFileAbsolutePath);
    const outputDirectoryAbsolutePath = path.join(rootDirectoryPath, 'public', ...listOutputImagePathFragments(source.hash));
    const cached = await loadImageProcessorResult(path.join(outputDirectoryAbsolutePath, ImageProcessorResultFileName));
    const result = await processImage({sourceFileAbsolutePath, source, cached});
    const code = [...serializeSrcSetScript(result)].join('\n');
    await fs.promises.writeFile(`${sourceFileAbsolutePath}.component.tsx`, code);
    console.info(`${relativePath}: done`);
});

const listOutputImagePathFragments = function* (hash: string) {
    yield 'images';
    yield ImageProcessorVersion;
    yield hash.slice(0, 8);
};

const listWidthPatterns = function* (originalWidth: number) {
    let widthPatternCount = 0;
    for (const width of ImageProcessorWidthList) {
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
    let buffer = await fs.promises.readFile(sourceFileAbsolutePath);
    let image = sharp(buffer);
    const metadata = await loadImageMetadata(image);
    let requireUpdate = false;
    if (metadata.format === 'heif') {
        console.info(`${sourceFileAbsolutePath}: convert heif to jpg`);
        await image.clone().jpeg({progressive: true}).toFile(sourceFileAbsolutePath);
        requireUpdate = true;
    } else if (metadata.exif) {
        console.info(`${sourceFileAbsolutePath}: deleting EXIF`);
        await image.toFile(sourceFileAbsolutePath);
        requireUpdate = true;
    }
    if (requireUpdate) {
        buffer = await fs.promises.readFile(sourceFileAbsolutePath);
        image = sharp(buffer);
    }
    const hash = getHash(buffer).toString(ImageProcessorHashEncoding);
    return {image, hash, metadata};
};

const processImage = async (
    {source, cached, sourceFileAbsolutePath}: {
        source: {
            image: sharp.Sharp,
            hash: string,
            metadata: {
                format: ImageFormat,
                width: number,
                height: number,
            },
        },
        cached: ImageProcessorResult | null,
        sourceFileAbsolutePath: string,
    },
) => {
    const outputDirectoryAbsolutePath = path.join(rootDirectoryPath, 'public', ...listOutputImagePathFragments(source.hash));
    const relativePath = path.relative(path.join(rootDirectoryPath, 'src'), sourceFileAbsolutePath);
    if (testCache(source, cached, outputDirectoryAbsolutePath)) {
        return cached;
    }
    await fs.promises.mkdir(outputDirectoryAbsolutePath, {recursive: true});
    const results: Array<ImageOutputResult> = [];
    for (const [resized, width, format] of listPatterns(source)) {
        const name = `${width}w${getExtension(format)}`;
        const dest = path.join(outputDirectoryAbsolutePath, name);
        const stats = await statOrNull(dest);
        if (!stats || !stats.isFile()) {
            const startedAtNs = process.hrtime.bigint();
            await resized.toFile(dest);
            const elapsedNs = process.hrtime.bigint() - startedAtNs;
            console.info(`${relativePath}: ${name} (${serializeNs(elapsedNs)})`);
        }
        results.push({format, width, name});
    }
    const processResult: ImageProcessorResult = {
        hash: source.hash,
        version: ImageProcessorVersion,
        relativePath,
        format: source.metadata.format,
        width: source.metadata.width,
        height: source.metadata.height,
        results,
    };
    await fs.promises.writeFile(
        path.join(outputDirectoryAbsolutePath, ImageProcessorResultFileName),
        JSON.stringify(processResult, null, 4),
    );
    return processResult;
};

const testCache = (
    {hash}: {hash: string},
    cached: ImageProcessorResult | null,
    outputDirectoryAbsolutePath: string,
): cached is ImageProcessorResult => {
    if (!cached) {
        return false;
    }
    if (cached.hash !== hash) {
        return false;
    }
    if (cached.version !== ImageProcessorVersion) {
        return false;
    }
    for (const {name} of cached.results) {
        const stats = statOrNullSync(path.join(outputDirectoryAbsolutePath, name));
        if (!stats) {
            return false;
        }
    }
    return true;
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

const serializeSrcSetScript = function* (processResult: ImageProcessorResult) {
    const resultMap = new Map<ImageFormat, Array<ImageOutputResult>>();
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
