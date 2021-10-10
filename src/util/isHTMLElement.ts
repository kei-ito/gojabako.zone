import {Boolean} from '../global';

export const isHTMLElement = (
    node: Element | Node | null,
): node is HTMLElement => Boolean(node && node.nodeType === node.ELEMENT_NODE);
