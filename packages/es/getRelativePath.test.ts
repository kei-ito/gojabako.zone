import {getRelativePath} from './getRelativePath';

describe(getRelativePath.name, () => {
    it('empty', () => {
        expect(getRelativePath('', '')).toBe('');
    });
    it('non empty', () => {
        expect(getRelativePath('foo', 'foo')).toBe('');
    });
    it('different', () => {
        expect(getRelativePath('foo', 'bar')).toBe('../bar');
    });
    it('without leading slash without trailing slash', () => {
        expect(getRelativePath('foo/file1', 'foo/file2')).toBe('../file2');
    });
    it('with leading slash without trailing slash', () => {
        expect(getRelativePath('/foo/file1', '/foo/file2')).toBe('../file2');
    });
    it('without leading slash with trailing slash', () => {
        expect(getRelativePath('foo/file1/', 'foo/file2/')).toBe('../file2');
    });
    it('with leading slash with trailing slash', () => {
        expect(getRelativePath('/foo/file1/', '/foo/file2/')).toBe('../file2');
    });
    it('forward1', () => {
        expect(getRelativePath('/foo/bar', '/foo/bar/baz/file')).toBe('./baz/file');
    });
    it('forward2', () => {
        expect(getRelativePath('/foo/bar/', '/foo/bar/baz/file')).toBe('./baz/file');
    });
    it('backward1', () => {
        expect(getRelativePath('/foo/bar/baz/file', '/foo/bar')).toBe('../..');
    });
    it('backward2', () => {
        expect(getRelativePath('/foo/bar/baz/file', '/foo/bar/')).toBe('../..');
    });
});
