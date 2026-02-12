
import { SocketUser } from '@models';
import { CommonLib } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

describe('common lib', () => {
  test('generate hex id', () => {
    const hexId = CommonLib.generateHexId();
    console.log('hexId', hexId);
    expect(hexId).toHaveLength(8);
  });
  test('type to keys', () => {
    const keys = gsheets_api.util.typeToKeys(SocketUser);
    const objKeys = Object.keys(new SocketUser());
    expect(keys.some((key, index) => objKeys[index] !== key)).toBe(false);
  });
});
