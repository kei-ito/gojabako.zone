import {serializeSize} from './serializeSize';

const tests: Array<[bigint | number, string]> = [
    [0, '0B'],
    [1, '1B'],
    [1023, '1023B'],
    [1024, '1.0KiB'],
    [1048576, '1.0MiB'],
    [1073741824, '1.0GiB'],
    [1099511627776, '1.0TiB'],
];

describe(serializeSize.name, () => {
    for (const [input, expected] of tests) {
        it(`${input} → ${expected}`, () => {
            expect(serializeSize(input)).toBe(expected);
        });
    }
});
