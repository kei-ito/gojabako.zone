import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {serializeMarkdownToJsx} from './MarkdownToJsx';

describe(serializeMarkdownToJsx.name, () => {
    it('heading', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '# Title{1}',
            '## Title{2}',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<h1>Title&#123;1&#125;</h1>',
            '<h2>',
            '<div className="anchor" id="title&#123;2&#125;"/>',
            'Title&#123;2&#125;',
            '&nbsp;',
            '<a className="link" href="#title&#123;2&#125;" title="#title&#123;2&#125;">#link</a>',
            '</h2>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
});
