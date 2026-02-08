import { generateHexId } from './common.lib';

describe('common lib', () => {
  test('generate hex id', () => {
    const hexId = generateHexId();
    console.log('hexId', hexId);
    expect(hexId).toHaveLength(8);
  });
});
