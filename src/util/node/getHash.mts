import * as crypto from 'node:crypto';

export const getHash = (...data: Array<Buffer | string>) => {
  const hash = crypto.createHash('sha256');
  for (const d of data) {
    hash.update(d);
  }
  return hash.digest('base64url');
};
