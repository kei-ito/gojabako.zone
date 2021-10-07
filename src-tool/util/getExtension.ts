export const getExtension = (
    filePath: string,
): string | null => {
    const extIndex = filePath.lastIndexOf('.');
    if (extIndex < 0) {
        return null;
    }
    return filePath.slice(extIndex);
};
