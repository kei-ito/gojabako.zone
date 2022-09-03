import * as path from 'path';
import kuromoji from 'kuromoji';
import {nullaryCache} from '../es/cache';
import {Promise} from '../es/global';
import {rootDirectory} from '../../paths.mjs';

const dicPath = path.join(rootDirectory, 'node_modules', 'kuromoji', 'dict');
const getTokenizer = nullaryCache(async () => {
    return await new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
        // eslint-disable-next-line import/no-named-as-default-member
        kuromoji.builder({dicPath}).build((error: unknown, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
});

export const executeKuromoji = async (source: string) => {
    const tokenizer = await getTokenizer();
    return tokenizer.tokenize(source);
};
