import {listPhrases} from './listPhrases';

describe(listPhrases.name, () => {
    it('should tokenize mixed string', async () => {
        const results: Array<string> = [];
        for await (const result of listPhrases('今日の8時からNext.jsの話をします')) {
            results.push(result);
        }
        expect(results).toEqual(['今日の', '8時から', 'Next.jsの', '話を', 'します']);
    });
    it('should tokenize mixed string with spaces', async () => {
        const results: Array<string> = [];
        for await (const result of listPhrases('今日はABC 123でNext.js,React(TypeScript)の話を（少しだけ）します')) {
            results.push(result);
        }
        expect(results).toEqual(['今日は', 'ABC', ' ', '123で', 'Next.js,', 'React', '(TypeScript)の', '話を', '（少しだけ）', 'します']);
    });
});
