import { matchSheetId } from './sheet.lib';

describe('sheet lib', () => {
  test('match sheet id with length of 8 & 6', () => {
    const sheetId = '1OXIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxNrDw';
    const result1 = matchSheetId(sheetId, '1OXINrDw');
    const result2 = matchSheetId(sheetId, '1OXrDw');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});
