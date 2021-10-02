import {createUnsupportedTypeError} from './createUnsupportedTypeError';

describe(createUnsupportedTypeError.name, () => {
    it('create an error', () => {
        expect(createUnsupportedTypeError({})).toBeInstanceOf(Error);
    });
});
