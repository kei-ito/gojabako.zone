import {classnames} from './classnames';

describe(classnames.name, () => {
    it('returns a string for className', () => {
        expect(classnames(
            'c1   c2 ',
            [' c3  c4', null, false, ' c5'],
            undefined,
        )).toBe('c1 c2 c3 c4 c5');
    });
});
