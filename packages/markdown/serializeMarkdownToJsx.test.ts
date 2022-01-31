import {createSerializeMarkdownContext} from './createSerializeContext';
import {serializeMarkdownToJsx, serializeMarkdownRootToJsx, serializeFootnotes} from './serializeMarkdownToJsx';

describe(serializeMarkdownToJsx.name, () => {
    it('heading', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            '# Title{1}',
            '## Title{2}',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<h1>Title&#123;1&#125;</h1>',
            '<h2>',
            '<span className="anchor" id="title&#123;2&#125;"/>',
            'Title&#123;2&#125;',
            '&nbsp;',
            '<a className="link" href="#title&#123;2&#125;" title="#title&#123;2&#125;">#link</a>',
            '</h2>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('ol', () => {
        const context = createSerializeMarkdownContext();
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
    it('ul', () => {
        const context = createSerializeMarkdownContext();
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
    it('hr', () => {
        const context = createSerializeMarkdownContext();
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
    it('blockquote', () => {
        const context = createSerializeMarkdownContext();
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
    it('table', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            '| Cell11 | Cell12 | Cell13 |',
            '|--------|--------|--------|',
            '| Cell21 | Cell22 | Cell23 |',
            '| Cell31 | Cell32 | Cell33 |',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure id="figure-1">',
            '<table id="table-1">',
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
    it('break', () => {
        const context = createSerializeMarkdownContext();
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
    it('definition', () => {
        const context = createSerializeMarkdownContext();
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
    it('image', () => {
        const context = createSerializeMarkdownContext();
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
            '<figure id="figure-1">',
            '<Image id="image-1" src={image0} alt="image1" placeholder="blur"/>',
            '<figcaption>image1</figcaption>',
            '</figure>',
            '<p>',
            '<a href="./image2">',
            '<Image id="image-2" src={image1} alt="image2" placeholder="blur"/>',
            '</a>',
            '</p>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('footnote', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            'Here is a simple footnote[^1].',
            '',
            '[^1]: My reference.',
        ].join('\n');
        const actual = [
            ...serializeMarkdownToJsx(context, source),
            ...serializeFootnotes(context),
        ].join('');
        const expected = [
            '<>',
            '<p>Here is a simple footnote<sup data-footnote="1">',
            '<span className="anchor" id="footnoteRef-1"/>',
            '<a className="footnoteId" href="#footnote-1">[1]</a>',
            '</sup>',
            '.',
            '</p>',
            '</>',
            '<aside>',
            '<dl className="footnotes">',
            '<dt>',
            '<span className="anchor" id="footnote-1"/>',
            '<a className="footnoteId" href="#footnoteRef-1">',
            '[1]',
            '</a>',
            '</dt>',
            '<dd>',
            '<p>My reference.</p>',
            '</dd>',
            '</dl>',
            '</aside>',
        ].join('');
        expect(actual).toBe(expected);
    });
    it('decoration', () => {
        const context = createSerializeMarkdownContext();
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
    it('code with linked caption', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            '```markdown [sample.md](https://example.com)',
            'hello.',
            '```',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure id="figure-1" data-lang="markdown">',
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
    it('code without lang', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            '```',
            '$ echo 123',
            '```',
        ].join('\n');
        const actual = [...serializeMarkdownToJsx(context, source)].join('');
        const expected = [
            '<>',
            '<figure id="figure-1" data-lang="">',
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

describe(serializeMarkdownRootToJsx.name, () => {
    it('heading', () => {
        const context = createSerializeMarkdownContext();
        const source = [
            '# Title{1}',
            '## Title{2}',
        ].join('\n');
        const root = context.parseMarkdown(source);
        const actual = [...serializeMarkdownRootToJsx(context, root)].join('');
        const expected = [
            '<>',
            '<h1>Title&#123;1&#125;</h1>',
            '<h2>',
            '<span className="anchor" id="title&#123;2&#125;"/>',
            'Title&#123;2&#125;',
            '&nbsp;',
            '<a className="link" href="#title&#123;2&#125;" title="#title&#123;2&#125;">#link</a>',
            '</h2>',
            '</>',
        ].join('');
        expect(actual).toBe(expected);
    });
});
