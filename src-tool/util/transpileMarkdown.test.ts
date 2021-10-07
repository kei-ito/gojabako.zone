import {transpileMarkdown} from './transpileMarkdown';

describe(transpileMarkdown.name, () => {
    it('convert markdown without image', () => {
        const markdown = [
            '# Title',
            '',
            'Hello',
        ].join('\n');
        expect(transpileMarkdown(markdown)).toMatchObject({
            imports: '',
            jsx: '<><h1>Title</h1><p>Hello</p></>',
        });
    });
    it('convert markdown includes image', () => {
        const markdown = [
            '# Title',
            '',
            '![Image](./path/to/image)',
        ].join('\n');
        expect(transpileMarkdown(markdown)).toMatchObject({
            imports: [
                'import Image from \'next/image\';',
                'import image0 from \'./path/to/image\';',
            ].join('\n'),
            jsx: [
                '<>',
                '<h1>Title</h1>',
                '<figure>',
                '<figcaption>Image</figcaption>',
                '<Image src={image0} alt="Image" placeholder="blur"/>',
                '</figure>',
                '</>',
            ].join(''),
        });
    });
});
