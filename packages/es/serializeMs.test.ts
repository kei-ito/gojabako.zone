import {serializeMs} from './serializeMs';

describe(serializeMs.name, () => {
    it('serialize nano seconds', () => {
        expect(serializeMs(0)).toBe('0ms');
        expect(serializeMs(999)).toBe('999ms');
        expect(serializeMs(1000)).toBe('1.0s');
        expect(serializeMs(59900)).toBe('59.9s');
        expect(serializeMs(60000)).toBe('1m00s');
        expect(serializeMs(3599999)).toBe('59m59s');
        expect(serializeMs(3600000)).toBe('1h00m');
        expect(serializeMs(3600000 * 24 - 1)).toBe('23h59m');
        expect(serializeMs(3600000 * 24)).toBe('1d00h00m');
    });
});
