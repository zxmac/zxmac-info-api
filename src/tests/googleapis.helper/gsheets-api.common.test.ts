import { test, describe, before } from "node:test";
import * as assert from "node:assert/strict";
import { SocketUser } from "../../server/models";
import gsheets_api from "../../server/core/gsheets-api";

function mockValues() {
  return [
    [
      "userId",
      "sessionId",
      "origin",
      "ipAddress",
      "socketIds",
      "createdDate",
      "updatedDate",
      "deleted"
    ],
    [
      "92ef6f12",
      "92ef6f12",
      "https://info-1jvw.onrender.com",
      "10.18.92.175",
      "",
      "2026-01-15T00:52:50.233Z",
      "2026-01-15T00:52:50.233Z"
    ],
  ];
}

before(() => {
  gsheets_api.access_config();
});

describe('gsheets-api helper', () => {
  test('values to list obj', () => {
    const values = mockValues();
    const keys = values[0];
    const listObj = gsheets_api.util.mapToObjects<SocketUser>(values);
    const obj = listObj[0];
    const objKeys = Object.keys(obj);
    const objValues = Object.values(obj);
    assert.equal(keys.length, objKeys.length);
    assert.ok(keys.every((key, index) => objKeys[index] === key));
    assert.ok(values[1].every((val, index) => val === objValues[index]));
  });
  test('format sheets', () => {
    const values = mockValues();
    const keys = values[0];
    const listObj = gsheets_api.util.mapToObjects<SocketUser>(values);
    const obj = listObj[0];
    const objKeys = Object.keys(obj);
    const objValues = Object.values(obj);

    assert.equal(keys.some((key, index) => objKeys[index] !== key), false);
    assert.equal(values[1].some((val, index) => val !== objValues[index]), false);
  });
  test('type to keys', () => {
    const keys = gsheets_api.util.typeToKeys(SocketUser);
    const objKeys = Object.keys(new SocketUser());
    assert.equal(keys.some((key, index) => objKeys[index] !== key), false);
  });
});