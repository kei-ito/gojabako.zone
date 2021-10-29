import {serializeTeXToJsx} from './serializeTeXToJsx';

describe(serializeTeXToJsx.name, () => {
    it('should parse TeX', () => {
        const jsx = [...serializeTeXToJsx('x^{2}')].join('');
        const expected = '<span className="katex"><span className="katex-html"';
        expect(jsx.startsWith(expected)).toBe(true);
    });
});
