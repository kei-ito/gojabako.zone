// eslint-disable-next-line @nlib/no-globals, no-undef, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-invalid-this
const g = globalThis || global || this;
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
    Response,
} = g;
