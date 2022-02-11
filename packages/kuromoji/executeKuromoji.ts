import * as path from 'path';
import kuromoji from 'kuromoji';
import {nullaryCache} from '../es/cache';
import {Promise} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';

const dicPath = path.join(rootDirectoryPath, 'node_modules', 'kuromoji', 'dict');
const getTokenizer = nullaryCache(async () => {
    return await new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
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
