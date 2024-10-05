import type {
	ArrayExpression,
	Expression,
	ObjectExpression,
	Property,
	SimpleLiteral,
} from "estree";

export const createProperty = <T>(name: string, value: T): Property => ({
	type: "Property",
	key: { type: "Identifier", name },
	value: createPropertyValue(value),
	kind: "init",
	method: false,
	shorthand: false,
	computed: false,
});

export const createPropertyValue = (value: unknown): Expression => {
	if (Array.isArray(value)) {
		return createArrayLiteral(value);
	}
	switch (typeof value) {
		case "object":
			if (value) {
				return createObjectLiteral(value);
			}
			break;
		case "boolean":
		case "number":
		case "string":
			return createSimpleLiteral(value);
		default:
	}
	throw new Error(`Unsupported value: ${value}`);
};

export const createArrayLiteral = <T>(value: Array<T>): ArrayExpression => ({
	type: "ArrayExpression",
	elements: value.map((v) => createPropertyValue(v)),
});

export const createObjectLiteral = <T extends object>(
	value: T,
): ObjectExpression => {
	return {
		type: "ObjectExpression",
		properties: Object.entries(value).map(([n, v]) => createProperty(n, v)),
	};
};

export const createSimpleLiteral = (
	value: SimpleLiteral["value"],
): SimpleLiteral => {
	return { type: "Literal", value };
};
