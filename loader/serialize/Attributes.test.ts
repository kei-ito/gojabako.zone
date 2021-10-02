import {serializeAttributes} from './Attributes';

describe(serializeAttributes.name, () => {
    it('serialize attributes', () => {
        const input = {key: '<value>', bool: true};
        const expected = ' key="&#60;value&#62;" bool=""';
        expect([...serializeAttributes(input)].join('')).toBe(expected);
    });
});
