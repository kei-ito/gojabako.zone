import {serializeTeXToJsx} from './TeXToJsx';

describe(serializeTeXToJsx.name, () => {
    it('should parse TeX', () => {
        const jsx = [...serializeTeXToJsx('x^{2}')].join('');
        expect(jsx.startsWith('<span className="katex"><span className="katex-mathml">')).toBe(true);
    });
});
