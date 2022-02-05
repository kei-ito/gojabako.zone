import * as crypto from 'crypto';

export const getHash = (...sourceList: Array<Buffer | string>) => {
    const hash = crypto.createHash('sha256');
    for (const source of sourceList) {
        hash.update(source);
    }
    return hash.digest();
};
