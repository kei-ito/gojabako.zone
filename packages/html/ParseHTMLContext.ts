import {Error, JSON} from '../es/global';
import type {SerializeAttributeOptions} from './Attributes';
import type {HTMLASTNode} from './HTMLASTNode';
import {serializeHTMLASTNode} from './HTMLASTNode';

export class ParseHTMLContext {

    protected readonly stack: Array<HTMLASTNode> = [];

    protected readonly root: Array<HTMLASTNode> = [];

    protected get currentElement() {
        return this.stack[0] as HTMLASTNode | undefined;
    }

    public *serialize(option: SerializeAttributeOptions): Generator<string> {
        for (const node of this.root) {
            yield* serializeHTMLASTNode(node, option);
        }
    }

    protected enter(element: HTMLASTNode) {
        const {currentElement} = this;
        if (currentElement) {
            currentElement.children.push(element);
        } else {
            this.root.push(element);
        }
        this.stack.unshift(element);
    }

    public onopentag(tag: string, attributes: Record<string, string>) {
        this.enter({tag, attributes, children: []});
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

}
