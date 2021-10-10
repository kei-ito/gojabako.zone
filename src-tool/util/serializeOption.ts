export interface SerializeOption {
    jsx: boolean,
}

export const filterAttribute = (
    attributeName: string,
    {jsx}: SerializeOption,
) => {
    if (!jsx) {
        return attributeName;
    }
    switch (attributeName) {
    case 'class':
        return 'className';
    case 'frameborder':
        return 'frameBorder';
    case 'allowfullscreen':
        return 'allowFullScreen';
    default:
        return attributeName;
    }
};
