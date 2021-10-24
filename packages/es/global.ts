// eslint-disable-next-line @nlib/no-globals, no-undef
const g = globalThis;
export {g as globalThis};
export const {
    Boolean,
    Number,
    Object,
    Array,
    Date,
    Math,
    Map,
    Set,
    URL,
    JSON,
    Promise,
    Error,
    console,
    WeakMap,
    WeakSet,
} = g;
