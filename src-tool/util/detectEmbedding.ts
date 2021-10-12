import {Parser as HTMLParser} from 'htmlparser2';
import type {HTMLASTNode} from '../serialize/HTMLASTNode';
import {ParseHTMLContext} from './ParseHTMLContext';

export interface Embedding {
    type: string,
    jsx: string,
}

export const supportedEmbeddingType = new Set([
    'twitter',
    'youtube',
]);

const getUrl = (urlLike?: string) => new URL(`${urlLike}`, 'https://example.com');

class ParseContext extends ParseHTMLContext {

    protected readonly score = new Map<string, number>();

    protected get type() {
        const types = [...this.score]
        .filter(([, score]) => 5 <= score)
        .sort(([, a], [, b]) => a < b ? 1 : -1);
        const type = types[0] as [string, number] | undefined;
        return type ? type[0] : null;
    }

    protected enter(element: HTMLASTNode) {
        if (element.tag === 'script') {
            this.stack.unshift(element);
        } else {
            super.enter(element);
        }
    }

    protected addScore(type: string, diff: number) {
        this.score.set(type, (this.score.get(type) || 0) + diff);
    }

    public onopentag(tag: string, attributes: Record<string, string>) {
        super.onopentag(tag, attributes);
        switch (tag) {
        case 'blockquote':
            if (attributes.class.includes('twitter-tweet')) {
                this.addScore('twitter', 1);
            }
            break;
        case 'a': {
            const url = getUrl(attributes.href);
            switch (url.host) {
            case 'twitter.com':
                if ((/^\/\S{4,}\/status\/\d+/).test(url.pathname)) {
                    this.addScore('twitter', 1);
                }
                break;
            default:
            }
            break;
        }
        case 'iframe': {
            const url = getUrl(attributes.src);
            if (url.host.endsWith('youtube.com')) {
                this.addScore('youtube', 5);
            }
            break;
        }
        case 'script': {
            const url = getUrl(attributes.src);
            switch (url.host) {
            case 'platform.twitter.com':
                this.addScore('twitter', 3);
                break;
            default:
            }
            break;
        }
        default:
        }
    }

    public end(): Embedding | null {
        const {type} = this;
        if (!type) {
            return null;
        }
        const jsx = [...this.serialize({jsx: true})].join('');
        return {type, jsx};
    }

}

export const detectEmbedding = (source: string): Embedding | null => {
    const ctx = new ParseContext();
    const parser = new HTMLParser(ctx);
    parser.write(source.trim());
    parser.end();
    return ctx.end();
};
