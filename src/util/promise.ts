export const onResolve = <T>(promise: Promise<T>, fn: (value: T) => void) => {
	promise.then(fn).catch(console.error);
};
