export interface MapTree {
	get: (arg: unknown) => MapTree;
	set: (arg: unknown, value: MapTree) => void;
	clear: () => void;
}

export const createMapTree = () => {
	const mapTree: MapTree = new Map();
	const clear = () => mapTree.clear();
	const get = (...args: Array<unknown>): MapTree =>
		args.reduce((branch: MapTree, arg) => {
			let nextBranch = branch.get(arg);
			if (!nextBranch) {
				nextBranch = new Map();
				branch.set(arg, nextBranch);
			}
			return nextBranch;
		}, mapTree);
	return { get, clear };
};
