import {isString} from './isString';

describe(isString.name, () => {
    it('test values', () => {
        expect(isString('a')).toBe(true);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString(0)).toBe(false);
        expect(isString(NaN)).toBe(false);
        expect(isString(Infinity)).toBe(false);
        expect(isString(false)).toBe(false);
        expect(isString(() => null)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
    });
});
