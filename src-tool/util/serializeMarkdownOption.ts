export interface SerializeMarkdownOption {
    jsx: boolean,
}

const mapping = new Map<string, string>();
mapping.set('class', 'className');
mapping.set('charset', 'charSet');
mapping.set('frameborder', 'frameBorder');
mapping.set('allowfullscreen', 'allowFullScreen');
mapping.set('preserveaspectratio', 'preserveAspectRatio');
mapping.set('viewbox', 'viewBox');
mapping.set('xmlns', '');

export const filterAttribute = (
    attributeName: string,
    {jsx}: SerializeMarkdownOption,
) => {
    if (!jsx) {
        return attributeName;
    }
    const filtered = mapping.get(attributeName);
    return typeof filtered === 'undefined' ? attributeName : filtered;
};
