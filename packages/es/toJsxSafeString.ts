export const toJsxSafeString = (
    input: string,
) => input.replace(/[<>{}\\'"&]/g, (c) => `&#${c.codePointAt(0)};`);
