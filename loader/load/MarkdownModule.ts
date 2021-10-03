import type {LoaderThis} from '../util/LoaderContext';
import {transpileMarkdown} from '../util/transpileMarkdown';

export const loadMarkdownModule = async (
    _loaderThis: LoaderThis,
    source: string,
) => {
    const {imports, jsx} = await transpileMarkdown(source);
    return [
        imports,
        `export default function Document() {return ${jsx}}`,
    ].join('\n');
};
