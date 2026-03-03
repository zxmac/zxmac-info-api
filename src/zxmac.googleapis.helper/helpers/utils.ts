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

export function stow<T>(target: T, source: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.keys((source as any)).map(key => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (target as any)[key] = (source as any)[key];
  });
}