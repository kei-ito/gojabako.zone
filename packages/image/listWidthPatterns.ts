const widthList = [600, 800, 1000, 1200, 1500, 1800];

export const listWidthPatterns = function* (originalWidth: number) {
    let widthPatternCount = 0;
    for (const width of widthList) {
        if (width <= originalWidth) {
            widthPatternCount++;
            yield width;
        }
    }
    if (widthPatternCount === 0) {
        yield originalWidth;
    }
};
