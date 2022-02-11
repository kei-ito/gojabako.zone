import {executeKuromoji} from './executeKuromoji';

export const listPhrases = async function* (source: string): AsyncGenerator<string> {
    let buffer = '';
    for (const item of await executeKuromoji(source)) {
        const {surface_form: text, pos} = item;
        if (pos === '助詞' || pos === '助動詞') {
            buffer += text;
        } else {
            const joint = `${buffer[buffer.length - 1]}${text[0]}`;
            if (isNonBreakingJoint(joint)) {
                buffer += text;
            } else {
                if (buffer) {
                    yield buffer;
                }
                buffer = text;
            }
            // switch (pos) {
            // case '名詞':
            //     break;
            // default:
            //     console.info(item);
            // }
        }
    }
    if (buffer) {
        yield buffer;
    }
};

const isNonBreakingJoint = (joint: string) => {
    if (joint.length < 2) {
        return false;
    }
    if ((/^[\w.]{2}$/).test(joint)) {
        return true;
    }
    if ((/^[\d'"([{<（「『【［｛〔〈《〝‘“]\S$/).test(joint)) {
        return true;
    }
    if ((/^\S[,'")\]}>）」』】］｝〕〉》〟’”]$/).test(joint)) {
        return true;
    }
    return false;
};
