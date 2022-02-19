export const getExtension = (filePath: string): string => {
    const extIndex = filePath.lastIndexOf('.');
    if (0 < extIndex) {
        const extension = filePath.slice(extIndex);
        if (extension !== '.') {
            return extension.toLowerCase();
        }
    }
    return '';
};
