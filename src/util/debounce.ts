import { noop } from "./noop.ts";

export const debounce = <A extends Array<unknown>>(
	fn: (...args: A) => void,
	debounceMs: number,
) => {
	let timerId = setTimeout(noop);
	let aborted = false;
	const cancel = () => clearTimeout(timerId);
	const debouncedFn = (...args: A) => {
		if (!aborted) {
			cancel();
			timerId = setTimeout(() => fn(...args), debounceMs);
		}
	};
	return Object.assign(debouncedFn, {
		abort: () => {
			cancel();
			aborted = true;
		},
	});
};
