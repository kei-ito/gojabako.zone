export const hasProcess = typeof process === "object";
export const hasWindow = typeof window === "object";
export const hasLocation = typeof location === "object";
export const isNode = hasProcess && Boolean(process.version);
