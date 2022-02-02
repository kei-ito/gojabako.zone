import {isInteger, isPositiveInteger} from './isInteger';

describe(isInteger.name, () => {
    it('test values', () => {
        expect(isInteger('a')).toBe(false);
        expect(isInteger(null)).toBe(false);
        expect(isInteger(undefined)).toBe(false);
        expect(isInteger(NaN)).toBe(false);
        expect(isInteger(Infinity)).toBe(false);
        expect(isInteger(false)).toBe(false);
        expect(isInteger(() => null)).toBe(false);
        expect(isInteger({})).toBe(false);
        expect(isInteger([])).toBe(false);
        expect(isInteger(0)).toBe(true);
        expect(isInteger(1)).toBe(true);
        expect(isInteger(-2)).toBe(true);
        expect(isInteger(1.4)).toBe(false);
    });
});

describe(isPositiveInteger.name, () => {
    it('test values', () => {
        expect(isInteger('a')).toBe(false);
        expect(isInteger(null)).toBe(false);
        expect(isInteger(undefined)).toBe(false);
        expect(isInteger(NaN)).toBe(false);
        expect(isInteger(Infinity)).toBe(false);
        expect(isInteger(false)).toBe(false);
        expect(isInteger(() => null)).toBe(false);
        expect(isInteger({})).toBe(false);
        expect(isInteger([])).toBe(false);
        expect(isInteger(0)).toBe(false);
        expect(isInteger(1)).toBe(true);
        expect(isInteger(-2)).toBe(false);
        expect(isInteger(1.4)).toBe(false);
    });
});
