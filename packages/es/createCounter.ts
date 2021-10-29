export const createCounter = () => {
    let count = 0;
    return () => ++count;
};
