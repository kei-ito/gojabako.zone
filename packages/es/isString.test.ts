import {isDateString, isString, isUrlString} from './isString';

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

describe(isDateString.name, () => {
    it('test date string', () => {
        expect(isDateString('a')).toBe(false);
        expect(isDateString(null)).toBe(false);
        expect(isDateString(undefined)).toBe(false);
        expect(isDateString(0)).toBe(false);
        expect(isDateString(NaN)).toBe(false);
        expect(isDateString(Infinity)).toBe(false);
        expect(isDateString(false)).toBe(false);
        expect(isDateString(() => null)).toBe(false);
        expect(isDateString({})).toBe(false);
        expect(isDateString([])).toBe(false);
    });
    for (const ms of ['', '.123']) {
        for (const timeZone of ['Z', '+09:00', '-09:00']) {
            const input = `2020-01-01T00:00:00${ms}${timeZone}`;
            it(`${input} → true`, () => {
                expect(isDateString(input)).toBe(true);
            });
        }
    }
});

describe(isUrlString.name, () => {
    it('test url string', () => {
        expect(isUrlString('a')).toBe(false);
        expect(isUrlString(null)).toBe(false);
        expect(isUrlString(undefined)).toBe(false);
        expect(isUrlString(0)).toBe(false);
        expect(isUrlString(NaN)).toBe(false);
        expect(isUrlString(Infinity)).toBe(false);
        expect(isUrlString(false)).toBe(false);
        expect(isUrlString(() => null)).toBe(false);
        expect(isUrlString({})).toBe(false);
        expect(isUrlString([])).toBe(false);
    });
    for (const protocol of ['http://', 'https://']) {
        for (const domain of ['example.com', 'e.x.a.m.example.com']) {
            for (const pathname of ['', '/', '/foo']) {
                const url = `${protocol}${domain}${pathname}`;
                it(`${url} → true`, () => {
                    expect(isUrlString(url)).toBe(true);
                });
            }
        }
    }
});
