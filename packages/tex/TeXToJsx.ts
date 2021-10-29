import katex from 'katex';
import {Parser as HTMLParser} from 'htmlparser2';
import {ParseHTMLContext} from '../html/ParseHTMLContext';

export const serializeTeXToJsx = function* (
    source: string,
    options?: katex.KatexOptions,
): Generator<string> {
    if (!source) {
        return;
    }
    const ctx = new ParseHTMLContext();
    const parser = new HTMLParser(ctx);
    parser.write(
        katex.renderToString(
            `\\displaystyle ${source}`,
            {
                output: 'html',
                ...options,
            },
        )
        .replace(/[\r\n]/g, '')
        .replace(/^<span[^>]*katex-display[^>]*>(.*)<\/span>$/, '$1'),
    );
    parser.end();
    yield* ctx.serialize({jsx: true});
};
