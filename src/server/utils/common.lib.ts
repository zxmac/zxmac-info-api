import { randomBytes } from 'crypto';

export function generateUUID(prefix: string = ''): string {
  return prefix + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isLocalIp(clientIp: string) {
  if (clientIp === '127.0.0.1' || clientIp === '::1') {
    return true;
  }
  return false;
}

export function cssToObj(css: string) {
  return css.split(';').filter(x => x)  
    .map(x => {
      const v = x.split(':');
      const key = v[0].trim().split('-').map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join('');
      return { key, value: v[1].trim() };
    })
    .reduce((o, v) => {
      const parsedValue = Number(v.value);
      o[v.key] = isNaN(parsedValue) ? v.value : parsedValue;
      return o;
    }, {} as any);
}

export function removeAllSpecChar(s: string, replace: string = '') {
  return s.replace(/[^a-zA-Z0-9]/g, replace)
}

export function concatId(...id: string[]) {
  return `${id.map(x => removeAllSpecChar(x)).join('_')}`.toUpperCase();
}

export function convertToChar(num: number) {
  // Assumes num is between 1 and 26
  return String.fromCharCode(64 + num);
}

export function convertToNum(char: string) {
  const upperChar = char.toUpperCase();
  // 'A' has an ASCII code of 65. Subtract 64 to get A=1, B=2, etc.
  const asciiOffset = 64; 
  return upperChar.charCodeAt(0) - asciiOffset;
}

export function generateHexId() {
  const randomId = randomBytes(4).toString('hex');
  return randomId;
}

export function combineIds(ids: string[]) {
  return ids.sort((a, b) => a.localeCompare(b)).join('_');
}

export function getUtcDate() {
  const now = new Date();
  const isoStringUTC = now.toISOString();
  return isoStringUTC;
}