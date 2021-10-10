import {detectEmbedding} from './detectEmbedding';

describe(detectEmbedding.name, () => {
    it('null', () => {
        const source = '';
        expect(detectEmbedding(source)).toBe(null);
    });
    it('youtube', () => {
        const source = '<iframe width="560" height="315" src="https://www.youtube.com/embed/5LI1PysAlkU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        expect(detectEmbedding(source)).toEqual({
            type: 'youtube',
            jsx: '<iframe width="560" height="315" src="https://www.youtube.com/embed/5LI1PysAlkU" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen=""/>',
        });
    });
    it('twitter', () => {
        const source = '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr"><a href="https://t.co/l8969kKyb8">https://t.co/l8969kKyb8</a><br>天保十五甲辰新暦には「九時」がある。「くじ」って読んだのかな？<br>橋本万平著「日本の時刻制度 増補版」によるとこの「時」はいまの「時」とは違うけど、「時」一文字を単位に使う例としては今のところ最古 <a href="https://t.co/jGeg003vm8">pic.twitter.com/jGeg003vm8</a></p>— Kei Ito (@gjbkz) <a href="https://twitter.com/gjbkz/status/1330431107540471808?ref_src=twsrc%5Etfw">November 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
        expect(detectEmbedding(source)).toEqual({
            type: 'twitter',
            jsx: '<blockquote className="twitter-tweet"><p lang="ja" dir="ltr"><a href="https://t.co/l8969kKyb8">https://t.co/l8969kKyb8</a><br/>天保十五甲辰新暦には「九時」がある。「くじ」って読んだのかな？<br/>橋本万平著「日本の時刻制度 増補版」によるとこの「時」はいまの「時」とは違うけど、「時」一文字を単位に使う例としては今のところ最古 <a href="https://t.co/jGeg003vm8">pic.twitter.com/jGeg003vm8</a></p>— Kei Ito (@gjbkz) <a href="https://twitter.com/gjbkz/status/1330431107540471808?ref_src=twsrc%5Etfw">November 22, 2020</a></blockquote><script async="" src="https://platform.twitter.com/widgets.js" charSet="utf-8"/>',
        });
    });
    it('mixed', () => {
        const source = '<blockquote class="twitter-tweet"><iframe src="https://www.youtube.com/embed/5LI1PysAlkU"/></blockquote>';
        expect(detectEmbedding(source)).toEqual({
            type: 'youtube',
            jsx: '<blockquote className="twitter-tweet"><iframe src="https://www.youtube.com/embed/5LI1PysAlkU"/></blockquote>',
        });
    });
});
