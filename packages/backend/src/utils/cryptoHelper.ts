import { encodeStr } from './crypto';

export default (function cryptoUtil() {
  console.log(encodeStr(process.env.password || ''));
})();
