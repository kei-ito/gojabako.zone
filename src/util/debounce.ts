import { noop } from "./noop.ts";

export const debounce = <A extends Array<unknown>>(
	fn: (...args: A) => void,
	debounceMs: number,
	abortSignal: AbortSignal,
) => {
	let timerId = setTimeout(noop);
	const cancel = () => clearTimeout(timerId);
	abortSignal.addEventListener("abort", cancel);
	return (...args: A) => {
		if (!abortSignal.aborted) {
			cancel();
			timerId = setTimeout(() => {
				fn(...args);
				abortSignal.removeEventListener("abort", cancel);
			}, debounceMs);
		}
	};
};
