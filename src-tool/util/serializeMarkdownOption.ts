export interface SerializeMarkdownOption {
    jsx: boolean,
}

export const filterAttribute = (
    attributeName: string,
    {jsx}: SerializeMarkdownOption,
) => {
    if (!jsx) {
        return attributeName;
    }
    switch (attributeName) {
    case 'class':
        return 'className';
    case 'charset':
        return 'charSet';
    case 'frameborder':
        return 'frameBorder';
    case 'allowfullscreen':
        return 'allowFullScreen';
    default:
        return attributeName;
    }
};
