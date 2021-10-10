import {serializeAttributes} from './Attributes';

describe(serializeAttributes.name, () => {
    it('serialize attributes', () => {
        const input = {class: '<value>', bool: true, empty: ''};
        const expected = ' class="&#60;value&#62;" bool="" empty=""';
        expect([...serializeAttributes(input, {jsx: false})].join('')).toBe(expected);
    });
    it('serialize attributes for jsx', () => {
        const input = {class: '<value>', bool: true, empty: ''};
        const expected = ' className="&#60;value&#62;" bool="" empty=""';
        expect([...serializeAttributes(input, {jsx: true})].join('')).toBe(expected);
    });
});
