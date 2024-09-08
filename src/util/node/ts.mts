import ts from 'typescript';

export const objectLiteralToValue = (literal: ts.ObjectLiteralExpression) => {
  const result: Record<string, unknown> = {};
  for (const property of literal.properties) {
    if (ts.isPropertyAssignment(property)) {
      const name = serializePropertyName(property.name);
      const value = name && literalToValue(property.initializer);
      if (name && value) {
        result[name] = value;
      }
    }
  }
  return result;
};

const serializePropertyName = (node: ts.PropertyName) => {
  if (ts.isIdentifier(node)) {
    return node.text;
  }
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
};

export const arrayLiteralToValue = (literal: ts.ArrayLiteralExpression) => {
  const value: Array<unknown> = [];
  for (const item of literal.elements) {
    if (ts.isPropertyAssignment(item)) {
      const { name, initializer } = item;
      if (ts.isIdentifier(name) && ts.isLiteralExpression(initializer)) {
        value.push(literalToValue(initializer));
      }
    }
  }
  return value;
};

export const literalToValue = (literal: ts.Expression) => {
  if (ts.isStringLiteral(literal)) {
    return literal.text;
  }
  if (ts.isNumericLiteral(literal)) {
    return Number(literal.text);
  }
  if (ts.isObjectLiteralExpression(literal)) {
    return objectLiteralToValue(literal);
  }
  if (ts.isArrayLiteralExpression(literal)) {
    return arrayLiteralToValue(literal);
  }
  return null;
};

export const logTsNode = (node: ts.Node) => {
  console.info({ ...node, kind: lookupTsKind(node), parent: null });
};

export const lookupTsKind = ({ kind }: { kind: ts.SyntaxKind }) => {
  for (const [k, v] of Object.entries(ts.SyntaxKind)) {
    if (v === kind) {
      return k;
    }
  }
  return null;
};
