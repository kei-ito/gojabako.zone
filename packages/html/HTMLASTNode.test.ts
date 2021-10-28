import type {HTMLASTNode} from './HTMLASTNode';
import {serializeHTMLASTNode} from './HTMLASTNode';

describe(serializeHTMLASTNode.name, () => {
    it('serialize', () => {
        const input: HTMLASTNode = {
            tag: 'p',
            attributes: {class: '123'},
            children: [
                {tag: 'span', attributes: {}, children: ['hello']},
                {tag: 'br', attributes: {}, children: []},
                'text',
            ],
        };
        const expected = '<p className="123"><span>hello</span><br/>text</p>';
        expect([...serializeHTMLASTNode(input, {jsx: true})].join('')).toBe(expected);
    });
    it('boolean attributes', () => {
        const input: HTMLASTNode = {
            tag: 'iframe',
            attributes: {
                src: 'https://example.com',
                allowfullscreen: '',
            },
            children: [],
        };
        const expected = '<iframe src="https://example.com" allowFullScreen=""/>';
        expect([...serializeHTMLASTNode(input, {jsx: true})].join('')).toBe(expected);
    });
});
