import { createMapTree } from "./mapTree.ts";

export const memoize = <T, Args extends Array<unknown>>(
	fn: (...args: Args) => T,
): ((...args: Args) => T) & { clearCache: () => void } => {
	const mapTree = createMapTree();
	let cache = new WeakMap<object, { value: T }>();
	const clearCache = () => {
		cache = new WeakMap();
	};
	return Object.assign(
		(...args: Args): T => {
			const key = mapTree.get(...args, fn);
			let cached = cache.get(key);
			if (!cached) {
				cached = { value: fn(...args) };
				cache.set(key, cached);
			}
			return cached.value;
		},
		{ clearCache },
	);
};
