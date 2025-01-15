import crypto, { BinaryToTextEncoding } from 'crypto';

export const encodeStr = (
  str: string,
  encoding: BinaryToTextEncoding = 'base64',
) => {
  return crypto.createHash('md5').update(str).digest(encoding);
};
