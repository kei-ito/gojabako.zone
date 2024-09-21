import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import ts from "typescript";
import { rootDir } from "./directories.mts";
import { objectLiteralToValue } from "./ts.mts";

export const getMetadataFromScript = async (
  file: URL,
  code?: string,
): Promise<Metadata | null> => {
  const src = ts.createSourceFile(
    file.pathname.slice(rootDir.pathname.length),
    code ?? (await readFile(file, "utf8")),
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
  for (const statement of src.statements) {
    if (isExportedVariableStatement(statement)) {
      const { name, initializer } = statement.declarationList.declarations[0];
      if (
        ts.isIdentifier(name) &&
        name.text === "metadata" &&
        initializer &&
        ts.isObjectLiteralExpression(initializer)
      ) {
        return objectLiteralToValue(initializer);
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
