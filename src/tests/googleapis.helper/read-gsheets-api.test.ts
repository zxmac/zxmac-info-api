import { test, describe, before } from "node:test";
import * as assert from "node:assert/strict";
import gsheets_api from "../../server/core/gsheets-api";

before(() => {
  gsheets_api.access_config();
});

describe('read gsheets api', () => {
  test('match sheet id', async () => {
    const sheetId = '1OXrDw';
    const spreadshitId = await gsheets_api.read.getMatchSheetId(sheetId);
    const matchedSheetId = spreadshitId.substring(0, 3) + sheetId.substring(3, spreadshitId.length);
    assert.equal(matchedSheetId, sheetId);
  });
  test('default range param', () => {
    /* sample expected range from env: Sheet1!A1:F1000 */
    assert.equal(gsheets_api.options.range, 'Sheet1!A1:F1000');
    assert.equal(gsheets_api.read.rangeParam(), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1'), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A'), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A', 'F'), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1'), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'F'), gsheets_api.options.range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'F1000'), gsheets_api.options.range);
  });
  test('dyanmic range param', () => {
    const range = 'Sheet1!A1:Z1000';
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z'), range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z1000'), range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z1001'), range);
    assert.equal(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z123'), 'Sheet1!A1:Z123');
  });
});