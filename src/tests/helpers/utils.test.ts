import { test, describe } from "node:test";
import * as assert from "node:assert/strict"; 
import { generateHexId, isValueInEnum } from "../../server/helpers/utils";
import { ErrorType } from "../../server/helpers/api-error";
 
describe('utils', () => {
  test('generate hex id', () => {
    const hexId = generateHexId();
    console.log('hexId', hexId);
    assert.equal(hexId.length, 8);
  });
  test('isValueInEnum', () => {
    assert.equal(isValueInEnum(ErrorType, 'AuthFailureError'), true);
    assert.equal(isValueInEnum(ErrorType, 'TokenExpiredError'), true);
    assert.equal(isValueInEnum(ErrorType, 'Unknown'), false);
  });
});
