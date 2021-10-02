import {transpileMarkdown} from './transpileMarkdown';

describe(transpileMarkdown.name, () => {
    it('convert markdown without image', async () => {
        const markdown = [
            '# Title',
            '',
            'Hello',
        ].join('\n');
        expect(await transpileMarkdown(markdown)).toEqual({
            imports: '',
            jsx: '<><h1>Title</h1><p>Hello</p></>',
        });
    });
    it('convert markdown includes image', async () => {
        const markdown = [
            '# Title',
            '',
            '![Image](./path/to/image)',
        ].join('\n');
        expect(await transpileMarkdown(markdown)).toEqual({
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
