import { SheetLib } from '@utils';

describe('sheet lib', () => {
  test('match sheet id with length of 8 & 6', () => {
    const sheetId = '1OXIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxNrDw';
    expect(SheetLib.matchSheetId(sheetId, '1OXINrDw')).toBe(true);
    expect(SheetLib.matchSheetId(sheetId, '1OXrDw')).toBe(true);
  });
});
