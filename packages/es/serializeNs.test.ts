import {serializeNs} from './serializeNs';

describe(serializeNs.name, () => {
    it('serialize nano seconds', () => {
        expect(serializeNs(0)).toBe('0ns');
        expect(serializeNs(999)).toBe('999ns');
        expect(serializeNs(1000)).toBe('1.0us');
        expect(serializeNs(999900)).toBe('999.9us');
        expect(serializeNs(1000000)).toBe('1.0ms');
        expect(serializeNs(999900000)).toBe('999.9ms');
        expect(serializeNs(1000000000)).toBe('1.0s');
        expect(serializeNs(1000000n * 3600000n * 24n)).toBe('1d00h00m');
    });
});
