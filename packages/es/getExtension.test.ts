import {getExtension} from './getExtension';

describe(getExtension.name, () => {
    it('should return extension', () => {
        expect(getExtension('file.txt')).toBe('.txt');
    });
    it('should return "" if the name has no extension', () => {
        expect(getExtension('file-txt')).toBe('');
        expect(getExtension('.file-txt')).toBe('');
        expect(getExtension('file-txt.')).toBe('');
    });
});
