import {serializeMarkdownToJsx} from '../serialize/MarkdownToJsx';
import {serializeSerializeContext} from '../serialize/SerializeContext';
import {createSerializeMarkdownContext} from './createSerializeMarkdownContext';

export const getJsxCode = async (source: string) => {
    const context = await createSerializeMarkdownContext();
    const jsx = [...serializeMarkdownToJsx(context, source)].join('');
    const preamble = [...serializeSerializeContext(context)].join('');
    return {jsx, preamble};
};
