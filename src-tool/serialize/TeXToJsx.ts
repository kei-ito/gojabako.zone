import katex from 'katex';
import {Parser as HTMLParser} from 'htmlparser2';
import {ParseHTMLContext} from '../util/ParseHTMLContext';

export const serializeTeXToJsx = function* (source: string): Generator<string> {
    const ctx = new ParseHTMLContext();
    const parser = new HTMLParser(ctx);
    parser.write(katex.renderToString(`\\displaystyle ${source}`).replace(/[\r\n]/g, ''));
    parser.end();
    yield* ctx.serialize({jsx: true});
};
