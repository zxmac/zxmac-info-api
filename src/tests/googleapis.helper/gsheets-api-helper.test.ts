import { SocketUser } from '@models';
import { env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

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

beforeAll(() => {
  gsheets_api.access.config({
		master: {
			id: env.GSHEETS_API_MASTER_ID
		},
		key: {
			gsheets_api_email: 'GSHEETS_API_EMAIL',
			gsheets_api_key: 'GSHEETS_API_KEY',
			gsheets_api_scopes: 'GSHEETS_API_SCOPES',
			gsheets_api_sheet_range: 'GSHEETS_API_SHEET_RANGE',
		}
	});
});

describe('gsheets-api helper', () => {
	test('values to list obj', () => {
		const values = mockValues();
		const keys = values[0];
		const listObj = gsheets_api.util.valuesToListObj(SocketUser, values);
		const obj = listObj[0];
		const objKeys = Object.keys(obj);
		const objValues = Object.values(obj);
		
		expect(keys.some((key, index) => objKeys[index] !== key)).toBe(false);
		expect(values[1].some((val, index) => val !== objValues[index])).toBe(false);
	});
	test('default range param', () => {
		/* sample expected range from env: Sheet1!A1:F1000 */
		expect(gsheets_api.read.rangeParam()).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1')).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A')).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A', 'F')).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1')).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'F')).toEqual(gsheets_api.options.range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'F1000')).toEqual(gsheets_api.options.range);
	});
	test('dyanmic range param', () => {
		const range = 'Sheet1!A1:Z1000';
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z')).toEqual(range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z1000')).toEqual(range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z1001')).toEqual(range);
		expect(gsheets_api.read.rangeParam('Sheet1', 'A1', 'Z123')).toEqual('Sheet1!A1:Z123');
	});
	test('format sheets', () => {
		const values = mockValues();
		const keys = values[0];
		const listObj = gsheets_api.util.formatSheets(values);
		const obj = listObj[0];
		const objKeys = Object.keys(obj);
		const objValues = Object.values(obj);
		
		expect(keys.some((key, index) => objKeys[index] !== key)).toBe(false);
		expect(values[1].some((val, index) => val !== objValues[index])).toBe(false);
	})
});
