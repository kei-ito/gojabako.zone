import {executeRegExp} from './executeRegExp';

describe(executeRegExp.name, () => {
    it('yield fragments', () => {
        const generator = executeRegExp('foo123bar456', /\d+/g);
        expect(generator.next()).toMatchObject({done: false, value: 'foo'});
        expect(generator.next()).toMatchObject({done: false, value: {0: '123', index: 3}});
        expect(generator.next()).toMatchObject({done: false, value: 'bar'});
        expect(generator.next()).toMatchObject({done: false, value: {0: '456', index: 9}});
        expect(generator.next()).toMatchObject({done: false, value: ''});
        expect(generator.next()).toMatchObject({done: true, value: undefined});
    });
});
