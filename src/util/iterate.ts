export const iterate = function* <T>(
	...iterables: Array<Iterable<T>>
): Generator<T> {
	for (const iterable of iterables) {
		for (const item of iterable) {
			yield item;
		}
	}
};
