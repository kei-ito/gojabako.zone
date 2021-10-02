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
    it('ol', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '1. foo',
            '2. bar',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<ol>',
            '<li><p>foo</p></li>',
            '<li><p>bar</p></li>',
            '</ol>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('ul', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '- foo',
            '- bar',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<ul>',
            '<li><p>foo</p></li>',
            '<li><p>bar</p></li>',
            '</ul>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('hr', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            'foo',
            '',
            '--------',
            '',
            'bar',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>foo</p>',
            '<hr/>',
            '<p>bar</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('blockquote', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            'foo',
            '',
            '> bar',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>foo</p>',
            '<blockquote>',
            '<p>bar</p>',
            '</blockquote>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('table', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '| Cell11 | Cell12 | Cell13 |',
            '|--------|--------|--------|',
            '| Cell21 | Cell22 | Cell23 |',
            '| Cell31 | Cell32 | Cell33 |',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure>',
            '<table>',
            '<thead>',
            '<tr><th>Cell11</th><th>Cell12</th><th>Cell13</th></tr>',
            '</thead>',
            '<tbody>',
            '<tr><td>Cell21</td><td>Cell22</td><td>Cell23</td></tr>',
            '<tr><td>Cell31</td><td>Cell32</td><td>Cell33</td></tr>',
            '</tbody>',
            '</table>',
            '</figure>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('break', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            'foo\\',
            'bar  ',
            'baz',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>foo<br/>bar<br/>baz</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('definition', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            'foo[bar1]baz[bar**2**][bar2]',
            '',
            '[bar1]: https://example.com/1',
            '[bar2]: https://example.com/2',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>',
            'foo<a href="https://example.com/1">bar1</a>baz',
            '<a href="https://example.com/2">bar<b>2</b></a>',
            '</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('image', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '![image1](./image1)',
            '',
            '[![image2]][image2]',
            '',
            '[image2]: ./image2',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure>',
            '<figcaption>image1</figcaption>',
            '<Image src={image0} alt="image1" placeholder="blur"/>',
            '</figure>',
            '<p>',
            '<a href="./image2">',
            '<Image src={image1} alt="image2" placeholder="blur"/>',
            '</a>',
            '</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('footnote', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            'Here is a simple footnote[^1].',
            '',
            '[^1]: My reference.',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>Here is a simple footnote<sup data-footnote="1">1</sup>.</p>',
            '<aside>',
            '<dl class="footnotes">',
            '<dt>1</dt>',
            '<dd>',
            '<p>My reference.</p>',
            '</dd>',
            '</dl>',
            '</aside>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('decoration', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '*emphasis* **strong** ~~delete~~ `inline code`',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<p>',
            '<i>emphasis</i> <b>strong</b> <s>delete</s> <code>inline code</code>',
            '</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('code with linked caption', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '```markdown [sample.md](https://example.com)',
            'hello.',
            '```',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure>',
            '<figcaption>',
            '<a href="https://example.com">sample.md</a>',
            '</figcaption>',
            '<ol data-lang="markdown">',
            '<li>',
            '<code>hello.</code>',
            '</li>',
            '</ol>',
            '</figure>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('code without lang', async () => {
        const context = await createSerializeMarkdownContext();
        const source = [
            '```',
            '$ echo 123',
            '```',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure>',
            '<ol data-lang="shell">',
            '<li>',
            '<code>',
            '<span className="hljs-meta">$ </span><span className="bash"><span className="hljs-built_in">echo</span> 123</span>',
            '</code>',
            '</li>',
            '</ol>',
            '</figure>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
});
