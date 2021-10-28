import {Buffer} from 'buffer';
import {Terminator} from './Terminator';

describe(Terminator.name, () => {
    it('should keep chunks and return a concatenated buffer', () => {
        const terminator = new Terminator();
        terminator.write(' foo');
        terminator.write('bar ');
        expect(terminator.flush()).toEqual(Buffer.from(' foobar '));
    });
    it('should keep chunks and return a concatenated string', () => {
        const terminator = new Terminator();
        terminator.write(' foo');
        terminator.write('bar ');
        expect(terminator.flushAsString()).toBe('foobar');
    });
});
