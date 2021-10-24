import {serializeStyle} from './Style';

describe(serializeStyle.name, () => {
    it('should parse CSS', () => {
        expect(
            [...serializeStyle('margin-block-start:1rem')].join(''),
        ).toBe('{marginBlockStart:\'1rem\'}');
    });
});
