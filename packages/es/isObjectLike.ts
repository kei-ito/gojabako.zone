export const isObjectLike = (
    input: unknown,
): input is Record<string, unknown> => {
    if (input) {
        switch (typeof input) {
        case 'object':
        case 'function':
            return true;
        default:
        }
    }
    return false;
};
