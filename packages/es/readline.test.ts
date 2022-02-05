import {readline} from './readline';

describe(readline.name, () => {
    it('yield line by line', () => {
        const generator = readline('foo\n123\rbar\r\n456\n');
        expect(generator.next()).toMatchObject({done: false, value: 'foo'});
        expect(generator.next()).toMatchObject({done: false, value: '123'});
        expect(generator.next()).toMatchObject({done: false, value: 'bar'});
        expect(generator.next()).toMatchObject({done: false, value: '456'});
        expect(generator.next()).toMatchObject({done: false, value: ''});
        expect(generator.next()).toMatchObject({done: true, value: undefined});
    });
    it('multiple breaks', () => {
        const generator0 = readline('');
        expect(generator0.next()).toMatchObject({done: false, value: ''});
        expect(generator0.next()).toMatchObject({done: true, value: undefined});
        const generator1 = readline('\n');
        expect(generator1.next()).toMatchObject({done: false, value: ''});
        expect(generator1.next()).toMatchObject({done: false, value: ''});
        expect(generator1.next()).toMatchObject({done: true, value: undefined});
        const generator2 = readline('\n\n');
        expect(generator2.next()).toMatchObject({done: false, value: ''});
        expect(generator2.next()).toMatchObject({done: false, value: ''});
        expect(generator2.next()).toMatchObject({done: false, value: ''});
        expect(generator2.next()).toMatchObject({done: true, value: undefined});
    });
});
