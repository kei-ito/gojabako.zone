import type {
  Directive,
  ModuleDeclaration,
  ObjectExpression,
  Property,
  Statement,
} from "estree";
import type { Root, RootContent } from "hast";
import type { MdxjsEsm } from "mdast-util-mdxjs-esm";
import { createProperty } from "../estree.mts";
import { getSingle } from "../getSingle.mts";
import type { PageData } from "../type.mts";

interface RootLike extends Omit<Root, "children"> {
  children: Array<MdxjsEsm | RootContent>;
}

export const setOpenGraphMetadata = (root: RootLike, page: PageData) => {
  const metadataExport = getMetadataExport(root);
  if (!metadataExport) {
    return null;
  }
  const { properties } = getOpenGraphPropertyValue(metadataExport[1]);
  const propertyMap = new Map<string, Property["value"]>();
  for (const { key, value } of properties) {
    const id = key.type === "Identifier" && key.name;
    if (id) {
      propertyMap.set(id, value);
    }
  }
  if (!propertyMap.has("title")) {
    properties.push(createProperty("title", page.title.join("")));
  }
  if (!propertyMap.has("images")) {
    const property = createProperty("images", {
      url: `/cover${page.path}`,
      width: 1200,
      height: 630,
    });
    properties.push(property);
  }
  return metadataExport[0];
};

const getMetadataExport = (
  root: RootLike,
): [MdxjsEsm, ObjectExpression] | null => {
  for (const child of root.children) {
    if (child.type === "mdxjsEsm") {
      for (const node of child.data?.estree?.body ?? []) {
        const expression = getMetadataExpression(node);
        if (expression) {
          return [child, expression];
        }
      }
    }
  }
  return null;
};

const getMetadataExpression = (
  node: Directive | ModuleDeclaration | Statement,
): ObjectExpression | null => {
  if (
    node.type === "ExportNamedDeclaration" &&
    node.declaration?.type === "VariableDeclaration"
  ) {
    const declaration = getSingle(node.declaration.declarations);
    if (declaration) {
      const { id, init } = declaration;
      if (
        id.type === "Identifier" &&
        id.name === "metadata" &&
        init?.type === "ObjectExpression"
      ) {
        return init;
      }
    }
  }
  return null;
};

interface OpenGraphPropertyValue extends ObjectExpression {
  properties: Array<Property>;
}

interface OpenGraphProperty extends Property {
  value: OpenGraphPropertyValue;
}

const getOpenGraphPropertyValue = ({
  properties,
}: ObjectExpression): OpenGraphPropertyValue => {
  let openGraphProperty: OpenGraphProperty | null = null;
  for (const property of properties) {
    if (
      property.type === "Property" &&
      property.key.type === "Identifier" &&
      property.key.name === "openGraph"
    ) {
      const { value } = property;
      if (value.type === "ObjectExpression") {
        if (value.properties.every((p) => p.type === "Property")) {
          openGraphProperty = property as OpenGraphProperty;
        } else {
          throw new Error("openGraph property has unexpected SpreadElement");
        }
      } else {
        throw new Error("openGraph property is not ObjectExpression");
      }
    }
  }
  if (!openGraphProperty) {
    openGraphProperty = {
      type: "Property",
      key: { name: "openGraph", type: "Identifier" },
      value: { type: "ObjectExpression", properties: [] },
      kind: "init",
      method: false,
      shorthand: false,
      computed: false,
    };
    properties.push(openGraphProperty);
  }
  return openGraphProperty.value;
};
