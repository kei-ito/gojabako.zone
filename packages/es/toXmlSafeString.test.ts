import {toXmlSafeString} from './toXmlSafeString';

describe(toXmlSafeString.name, () => {
    it('should convert some characters', () => {
        const input = '<p>{\'text\'}</p>';
        const expected = '&#60;p&#62;&#123;&#39;text&#39;&#125;&#60;/p&#62;';
        expect(toXmlSafeString(input)).toBe(expected);
    });
});
