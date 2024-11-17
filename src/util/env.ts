export const isServer = typeof window === "undefined";
export const isNode =
	typeof process !== "undefined" && Boolean(process.version);
export const isClient = !isServer;
