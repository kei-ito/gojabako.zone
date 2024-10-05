type Tuple = [...items: Array<number>];

export const vAdd = <T extends Tuple>(...args: Array<T>): T =>
	args.reduce((a, b) => a.map((v, i) => v + b[i]) as T);
