import { fileURLToPath } from "node:url";
import type { IpadicFeatures, Tokenizer } from "kuromoji";
import kuromoji from "kuromoji";
import { rootDir } from "./directories.mts";

const cache = new Map<string, Promise<Tokenizer<IpadicFeatures>>>();

export const getTokenizer = async (
  dicPath = fileURLToPath(new URL("node_modules/kuromoji/dict", rootDir)),
): Promise<Tokenizer<IpadicFeatures>> => {
  let cached = cache.get(dicPath);
  if (!cached) {
    cached = new Promise<Tokenizer<IpadicFeatures>>((resolve, reject) => {
      kuromoji.builder({ dicPath }).build((error: Error | null, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    cache.set(dicPath, cached);
  }
  return await cached;
};

export const listPhrases = function* (
  tokenizer: Tokenizer<IpadicFeatures>,
  source: string,
): Generator<string> {
  let buffer = "";
  for (const item of tokenizer.tokenize(source)) {
    const { surface_form: text, pos } = item;
    if (pos === "助詞" || pos === "助動詞") {
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
      //   case '名詞':
      //     break;
      //   default:
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
  if (/^[\w.]{2}$/.test(joint)) {
    return true;
  }
  if (/^[$¥/\d'"([{<（「『【［｛〔〈《〝‘“]\S$/.test(joint)) {
    return true;
  }
  if (/^\S[,、。'")\]}>）」』】］｝〕〉》〟’”]$/.test(joint)) {
    return true;
  }
  return false;
};
