export const sanitize = (
    input: string,
) => input.replace(/[<>\\]/g, (c) => `&#${c.codePointAt(0)};`);
