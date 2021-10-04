import {createUnsupportedTypeError} from './createUnsupportedTypeError';

describe(createUnsupportedTypeError.name, () => {
    it('create an error', () => {
        expect(createUnsupportedTypeError({})).toHaveProperty('message');
    });
});
