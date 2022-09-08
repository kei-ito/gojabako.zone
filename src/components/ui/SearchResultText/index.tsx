const parse = function* (
    body: string,
    highlightTag: string,
) {
    let count = 0;
    for (const word of body.split(highlightTag)) {
        if (count++ % 2) {
            yield <em key={count}>{word}</em>;
        } else {
            yield word;
        }
    }
};

interface SearchResultTextProps {
    text: string,
    highlightTag: string,
}

export const SearchResultText = ({text, highlightTag}: SearchResultTextProps) => {
    return <>{[...parse(text, highlightTag)]}</>;
};
