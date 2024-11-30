import type {
	AtomAdapter,
	Snapshot,
	UseStateCallbackParams,
} from "jotai-recoil-adapter";

export interface RecoilSelectorOpts {
	set: <T>(recoilVal: AtomAdapter<T>, newVal: T | ((currVal: T) => T)) => void;
	get: <T>(recoilVal: AtomAdapter<T>) => T;
	reset: <T>(recoilVal: AtomAdapter<T>) => void;
}

export const getLoadableValue = <T>(
	snapshot: Snapshot,
	atom: AtomAdapter<T>,
): T => {
	const loadable = snapshot.getLoadable(atom);
	if (loadable.state === "hasValue") {
		return loadable.contents;
	}
	throw new Error(
		`The loadable state is not 'hasValue' but '${loadable.state}'`,
	);
};

export const toRecoilSelectorOpts = ({
	set,
	reset,
	snapshot,
}: UseStateCallbackParams): RecoilSelectorOpts => {
	const get = <T>(atom: AtomAdapter<T>) => getLoadableValue(snapshot, atom);
	return { set, reset, get };
};
