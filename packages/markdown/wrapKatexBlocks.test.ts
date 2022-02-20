import {wrapKatexBlocks} from './wrapKatexBlocks';

describe(wrapKatexBlocks.name, () => {
    it('wraps KaTeX blocks', () => {
        const source = [
            'line1',
            '\\begin{align}',
            'a=1',
            '\\end{align}',
            'line2',
            '\\begin{align} foo',
            'b=2',
            '\\end{align}',
            'line3',
        ].join('\n');
        const expected = [
            'line1',
            '```math',
            '\\begin{align}',
            'a=1',
            '\\end{align}',
            '```',
            'line2',
            '```math foo',
            '\\begin{align}',
            'b=2',
            '\\end{align}',
            '```',
            'line3',
        ].join('\n');
        expect(wrapKatexBlocks(source)).toBe(expected);
    });
});
