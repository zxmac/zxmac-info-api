const isMatchedKeys = (key1: string, key2: string) => {
  return key1.replace(/\s/g, '').toLowerCase() === key2.toLowerCase()
};

function convertToJson(dataStr: string, keys: string[]) {
  const dataStrList = dataStr.split(/\r?\n|\r|\n/g);
  const allRes = keys.map(key => {
    const res = dataStrList
      .map(str => {
        const _key = key.toLowerCase();
        const _str = str.toLowerCase();
        const list = [];
        let kIndex = 0;
        
        for (let i = 0; i < _key.length; i++) {
          for (let j = i; j < _str.length; j++) {
            if (_key[kIndex] === _str[j] || _str[j] === ' ') {
              list.push(str[j]);
              if (_str[j] !== ' ') {
                kIndex++;
              }
              if (isMatchedKeys(list.join(''), key)) {
                break;
              }
            } else {
              break;
            }
          }
        }
        
        const matchedKey = list.join('');
        const matchedData = str.substring(matchedKey.trim().length).trim();

        return { key, str, matchedKey, matchedData, isMatched: isMatchedKeys(matchedKey, key) };
      })
      .filter(x => x.matchedKey && x.matchedData && x.isMatched);

    return res[0] || {};
  });


  const jsonObj = allRes.reduce((obj, val) => {
    obj[val.key] = val.matchedData;
    return obj;
  }, {} as any);

  return jsonObj;
}

export const FormToolService = { convertToJson };