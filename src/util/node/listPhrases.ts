import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { IpadicFeatures, Tokenizer } from "kuromoji";
import kuromoji from "kuromoji";
import { rootDir } from "./directories.ts";

const cache = new Map<string, Promise<Tokenizer<IpadicFeatures>>>();
const nounSet = new Set<string>();
{
	const listFileUrl = new URL("listPhrases.noun.txt", import.meta.url);
	const list = fs.readFileSync(listFileUrl, "utf-8");
	for (const line of list.split("\n")) {
		const word = line.trim();
		if (word) {
			nounSet.add(word);
		}
	}
}

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
	let buffer: Array<IpadicFeatures> = [];
	for (const item of tokenizer.tokenize(source)) {
		const text = item.surface_form;
		if (isTrailing(item, buffer[buffer.length - 1])) {
			buffer.push(item);
		} else {
			const buffered = buffer.map((item) => item.surface_form).join("");
			const joint = `${[...buffered].pop()}${text[0]}`;
			if (isNonBreakingJoint(joint) || nounSet.has(`${buffered}${text}`)) {
				buffer.push(item);
			} else {
				if (buffered) {
					yield buffered;
				}
				buffer = [item];
			}
		}
	}
	if (0 < buffer.length) {
		yield buffer.map((item) => item.surface_form).join("");
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

const isTrailing = (
	item: IpadicFeatures,
	previous?: IpadicFeatures,
): boolean => {
	switch (item.pos) {
		case "助詞":
		case "助動詞":
			return true;
		case "動詞":
			switch (item.surface_form) {
				case "する":
					return true;
				default:
			}
			switch (item.pos_detail_1) {
				case "非自立":
				case "接尾":
					return true;
				default:
			}
			switch (item.conjugated_form) {
				case "連用形":
					return previous?.pos === "名詞";
				default:
			}
			break;
		case "名詞":
			switch (item.pos_detail_1) {
				case "非自立":
				case "接尾":
					return true;
				default:
			}
			break;
		default:
	}
	return false;
};
