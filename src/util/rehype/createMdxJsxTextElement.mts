import { entries, isString } from '@nlib/typing';
import { parse } from 'acorn';
import type { Program } from 'estree';
import type {
  MdxJsxTextElement,
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
} from 'mdast-util-mdx-jsx';

export const createMdxJsxTextElement = (
  component: string,
  attributes: Record<string, string | [string]>,
  ...children: MdxJsxTextElement['children']
): MdxJsxTextElement => ({
  type: 'mdxJsxTextElement',
  name: component,
  attributes: entries(attributes).map<MdxJsxAttribute>(([name, value]) => ({
    type: 'mdxJsxAttribute',
    name,
    value: isString(value) ? value : parseExpression(value[0]),
  })),
  children,
});

const parseExpression = (expr: string): MdxJsxAttributeValueExpression => {
  const node = parse(expr, { ecmaVersion: 'latest', sourceType: 'module' });
  return {
    type: 'mdxJsxAttributeValueExpression',
    value: expr,
    data: { estree: node as unknown as Program },
  };
};
