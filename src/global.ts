/* eslint-disable @nlib/no-globals, no-undef */
const g = globalThis;
export {g as globalThis};
export const {
    Boolean,
    Number,
    Object,
    Array,
    Date,
    URL,
    JSON,
    Promise,
    requestAnimationFrame,
    cancelAnimationFrame,
    MutationObserver,
    console,
} = g;
