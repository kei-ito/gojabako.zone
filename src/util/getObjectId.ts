import type { Nominal } from "@nlib/typing";

type ObjectId = Nominal<string, "ObjectId">;

const cache = new WeakMap<object, ObjectId>();
let counter = 0;

export const getObjectId = (value: object): ObjectId => {
	let cached = cache.get(value);
	if (!cached) {
		cached = (++counter).toString(36) as ObjectId;
		cache.set(value, cached);
	}
	return cached;
};
