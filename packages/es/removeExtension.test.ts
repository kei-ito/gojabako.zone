import {removeExtension} from './removeExtension';

describe(removeExtension.name, () => {
    it('should remove extension', () => {
        expect(removeExtension('a.txt')).toBe('a');
        expect(removeExtension('a.txt.log')).toBe('a.txt');
    });
});
