import { test, describe } from "node:test";
import * as assert from "node:assert/strict"; 
import { AuthFailureError } from "../../server/helpers/api-error"; 
 
describe('api error', () => {
  test('AuthFailureError', () => {
    try {
      throw new AuthFailureError("Unauthorized!!!");      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      assert.equal(err.type, "AuthFailureError");
      assert.equal(err.message, "Unauthorized!!!");
    }
  });
});