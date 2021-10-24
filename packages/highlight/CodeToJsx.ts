// https://github.com/syntax-tree/mdast
import {lowlight} from 'lowlight';
import latex from 'highlight.js/lib/languages/latex';
import {serializeLowlightToJsx} from './LowlightToJsx';

lowlight.registerLanguage('latex', latex);

export const serializeCodeToJsx = function* (language: string | null | undefined, source: string) {
    if (language) {
        yield* serializeLowlightToJsx(lowlight.highlight(language, source));
    } else {
        yield* serializeLowlightToJsx(lowlight.highlightAuto(source));
    }
};
