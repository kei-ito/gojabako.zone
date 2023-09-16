/* eslint-disable import/no-named-as-default-member */
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { rootDir } from './directories.mjs';

export const getPageTitleFromScript = async (
  file: URL,
): Promise<string | null> => {
  const src = ts.createSourceFile(
    file.pathname.slice(rootDir.pathname.length),
    await readFile(file, 'utf8'),
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
  for (const statement of src.statements) {
    const expression = getMetadataVariable(statement);
    if (expression && ts.isObjectLiteralExpression(expression)) {
      for (const [name, value] of listProperties(expression)) {
        switch (name) {
          case 'title':
            return value;
          default:
        }
      }
      break;
    }
  }
  return null;
};

const getMetadataVariable = (input: ts.Statement) => {
  if (isExportedVariableStatement(input)) {
    const { name, initializer } = input.declarationList.declarations[0];
    if (initializer && ts.isIdentifier(name)) {
      if (name.text === 'metadata') {
        return initializer;
      }
    }
  }
  return null;
};

const isExportedVariableStatement = (
  input: ts.Statement,
): input is ts.VariableStatement => {
  if (ts.isVariableStatement(input)) {
    for (const modifier of input.modifiers ?? []) {
      if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
        return true;
      }
    }
  }
  return false;
};

const listProperties = function* (
  input: ts.ObjectLiteralExpression,
): Generator<[string, string]> {
  for (const property of input.properties) {
    if (ts.isPropertyAssignment(property)) {
      const { name, initializer } = property;
      if (ts.isIdentifier(name)) {
        if (ts.isStringLiteral(initializer)) {
          yield [name.text, initializer.text];
        }
      }
    }
  }
};

// const logNode = (node: ts.Node) => {
//   console.info({ ...node, kind: lookupKind(node), parent: null });
// };

// const lookupKind = ({ kind }: { kind: ts.SyntaxKind }) => {
//   for (const [k, v] of Object.entries(ts.SyntaxKind)) {
//     if (v === kind) {
//       return k;
//     }
//   }
//   return null;
// };
