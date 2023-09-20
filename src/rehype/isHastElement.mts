/* eslint-disable func-style */
import type {
  Element,
  ElementContent,
  Root,
  RootContent,
  Parent,
  Properties,
} from 'hast';
import { hasClass } from './hasClass.mts';

interface ElementWithClassName<T extends string> extends Element {
  tagName: T;
  properties: Properties & { className: Array<string> };
}

type Input = ElementContent | Parent | Root | RootContent | null | undefined;

export function isHastElement<T extends string>(
  element: Input,
  tagName: T,
): element is Element;
export function isHastElement<T extends string>(
  element: Input,
  tagName: T,
  ...classNames: Array<string>
): element is ElementWithClassName<T>;
export function isHastElement<T extends string>(
  element: Input,
  tagName: T,
  ...classNames: Array<string>
) {
  if (!element || !('tagName' in element) || element.tagName !== tagName) {
    return false;
  }
  return classNames.length === 0 || hasClass(element, ...classNames);
}
