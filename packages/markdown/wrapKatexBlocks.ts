export const wrapKatexBlocks = (sourceMarkdown: string) => sourceMarkdown
.replace(
    /** \u2028 and \u2029 are not supported */
    /\\begin\{(\w+)\}(.*)[\r\n]([\s\S]+?)[\r\n]\\end\{\1\}/gu,
    (_match: string, block: string, caption: string, body: string) => [
        `\`\`\`math${caption ? ` ${caption.trim()}` : ''}`,
        `\\begin{${block}}`,
        body,
        `\\end{${block}}`,
        '```',
    ].join('\n'),
);
