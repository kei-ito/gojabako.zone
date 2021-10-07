export const createUnsupportedTypeError = (data: unknown) => new Error(
    `UnsupportedType: ${JSON.stringify(data, null, 2)}`,
);
