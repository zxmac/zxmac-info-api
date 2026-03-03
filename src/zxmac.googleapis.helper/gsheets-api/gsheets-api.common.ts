/* eslint-disable @typescript-eslint/no-explicit-any */
import { newError } from "../helpers/error-handler";
import { gsheets_config } from "./access-gsheets-api";
import { ObjModel, ValType } from "./gsheets-api.model";

export const DEF_NOVALUE = 'NONE';
export const SHEET_REGEX = /[!:]/;

const isValidVal = (val: any) => `${val}`.length <= gsheets_config.validation.valueLimit;
const isValidCols = (arr: any[]) => arr.length <= gsheets_config.validation.columnLimit;
const isValid = (arr: any[]) => !arr.some(x => !isValidVal(x));

export function validateArr(arg: any) {
  if (!(arg as any[]).length) throw newError('Invalid values!');
  if ((arg as any[]).some(x => Array.isArray(x))) {
    const values = arg as any[][];
    if (values.length >= gsheets_config.validation.rowLimit) throw newError('Exceed row limit!');
    if (values.some(v => !isValidCols(v))) throw newError('Exceed column limit!');
    if (values.some(v => !isValid(v))) throw newError('Exceed column value limit!');
  } else {
    const values = arg as any[];
    if (!isValidCols(values)) throw newError('Exceed column limit!');
    if (!isValid(values)) throw newError('Exceed column value limit!');
  }
}
export function validateNum(arg: any) {
  const rowIndex = arg as number;
  if (rowIndex >= gsheets_config.validation.rowLimit) throw newError('Exceed row index limit!');
  if (rowIndex === -1) throw newError('Invalid row index!');
}
export function validateStr(arg: any) {
  const value = arg as string;
  if (!value) throw newError('Invalid value!');
  if (!isValidVal(value)) throw newError('Exceed value limit!');
}
export function validate(...args: any[]): boolean {
  for (const arg in args) {
    if (Array.isArray(arg)) {
      validateArr(arg);      
    } else if (typeof arg === 'number') {
      validateNum(arg);
    } else if (typeof arg === 'string') {
      validateStr(arg);
    } else if (!args) {
      throw newError('Invalid parameter!');
    }
  }
  return true;
}

export function typeToKeys<T>(type: { new (): T }) {
  return Object.keys((new type() as any));
}

export function mapToValues<T>(type: { new (): T }, obj: T) {
  const keys = typeToKeys(type);
  const values = keys.map(key => {
    const val = (obj as any)[key];
    return (val ? val !== DEF_NOVALUE ? val : DEF_NOVALUE : DEF_NOVALUE) as ValType;
  });
  if (keys.length !== values.length) throw new Error('Invalid data!');
  return values;
}

export function mapToKeys(sheetValues: any[][]) {
  return sheetValues[0] || [];
}

export function mapToObjects<T>(sheetValues: any[][]) {
	const keys = mapToKeys(sheetValues);
  const values = sheetValues.slice(1).map(vals => {
		const obj = keys.reduce((accu, key, index) => {
			let v = vals[index];
			if (v === 'FALSE') v = new Date(0);
			if (v === 'TRUE') v = true;
			accu[key] = v;
			return accu;
		}, {} as ObjModel);
    return obj as T;
	});
  return values;
}