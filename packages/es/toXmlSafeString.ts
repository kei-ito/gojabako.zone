export const toXmlSafeString = (
    input: string,
) => input.replace(/[<>{}\\'"&]/g, (c) => `&#${c.codePointAt(0)};`);
