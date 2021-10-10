import {Parser as HTMLParser} from 'htmlparser2';
import type {HTMLASTNode} from '../serialize/HTMLASTNode';
import {serializeHTMLASTNode} from '../serialize/HTMLASTNode';
import type {SerializeMarkdownOption} from './serializeMarkdownOption';

export interface Embedding {
    type: string,
    jsx: string,
}

export const supportedEmbeddingType = new Set([
    'twitter',
    'youtube',
]);

const getUrl = (urlLike?: string) => new URL(`${urlLike}`, 'https://example.com');

class ParseContext {

    private readonly score = new Map<string, number>();

    private readonly stack: Array<HTMLASTNode> = [];

    private readonly root: Array<HTMLASTNode> = [];

    private get currentElement() {
        return this.stack[0] as HTMLASTNode | undefined;
    }

    private *serialize(option: SerializeMarkdownOption): Generator<string> {
        for (const node of this.root) {
            yield* serializeHTMLASTNode(node, option);
        }
    }

    private get jsx() {
        return [...this.serialize({jsx: true})].join('');
    }

    private get type() {
        const types = [...this.score]
        .filter(([, score]) => 5 <= score)
        .sort(([, a], [, b]) => a < b ? 1 : -1);
        const type = types[0] as [string, number] | undefined;
        return type ? type[0] : null;
    }

    private enter(element: HTMLASTNode) {
        if (element.tag !== 'script') {
            const {currentElement} = this;
            if (currentElement) {
                currentElement.children.push(element);
            } else {
                this.root.push(element);
            }
        }
        this.stack.unshift(element);
    }

    private addScore(type: string, diff: number) {
        this.score.set(type, (this.score.get(type) || 0) + diff);
    }

    public onopentag(tag: string, attributes: Record<string, string>) {
        this.enter({tag, attributes, children: []});
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

    public ontext(text: string) {
        const {currentElement} = this;
        if (currentElement) {
            currentElement.children.push(text);
        } else if (text.trim()) {
            throw new Error(`NoElementToAppend: ${JSON.stringify(text)}`);
        }
    }

    public onclosetag(tag: string) {
        const element = this.stack.shift();
        if (!element) {
            throw new Error(`UnexpectedClosing: ${tag}`);
        }
        if (tag !== element.tag) {
            throw new Error(`UnmatchedTag: closing ${tag} but the context is ${element.tag}`);
        }
    }

    public end(): Embedding | null {
        const {type} = this;
        if (!type) {
            return null;
        }
        const {jsx} = this;
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
