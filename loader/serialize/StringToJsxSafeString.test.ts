import {serializeStringToJsxSafeString} from './StringToJsxSafeString';

describe(serializeStringToJsxSafeString.name, () => {
    it('sanitize {}, <> and \\', () => {
        const input = '<☺️ foo={bar}>"\\""';
        const expected = '&#60;☺️ foo=&#123;bar&#125;&#62;"&#92;""';
        expect([...serializeStringToJsxSafeString(input)].join('')).toBe(expected);
    });
});
