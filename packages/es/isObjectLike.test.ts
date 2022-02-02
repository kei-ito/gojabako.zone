import {isObjectLike} from './isObjectLike';

describe(isObjectLike.name, () => {
    it('test values', () => {
        expect(isObjectLike('a')).toBe(false);
        expect(isObjectLike(null)).toBe(false);
        expect(isObjectLike(undefined)).toBe(false);
        expect(isObjectLike(0)).toBe(false);
        expect(isObjectLike(NaN)).toBe(false);
        expect(isObjectLike(Infinity)).toBe(false);
        expect(isObjectLike(false)).toBe(false);
        expect(isObjectLike(() => null)).toBe(true);
        expect(isObjectLike({})).toBe(true);
        expect(isObjectLike([])).toBe(true);
    });
});
