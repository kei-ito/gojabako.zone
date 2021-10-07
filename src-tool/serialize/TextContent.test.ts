import {serializeTextContent} from './TextContent';

describe(serializeTextContent.name, () => {
    it('serialize text contents', () => {
        const input = {
            type: 'root',
            data: {language: 'typescript', relevance: 3},
            children: [
                {
                    type: 'element',
                    tagName: 'span',
                    children: [{type: 'text', value: 'const'}],
                },
                {type: 'text', value: ' foo = '},
                {
                    type: 'element',
                    tagName: 'span',
                    children: [{type: 'text', value: '"aaa"'}],
                },
                {type: 'text', value: ';\n'},
                {
                    type: 'element',
                    tagName: 'span',
                    children: [{type: 'text', value: 'const'}],
                },
                {type: 'text', value: ' bar = '},
                {
                    type: 'element',
                    tagName: 'span',
                    children: [{type: 'text', value: '123'}],
                },
                {type: 'text', value: ';'},
            ],
        };
        const expected = 'const foo = "aaa";\nconst bar = 123;';
        expect([...serializeTextContent(input)].join('')).toBe(expected);
    });
});
