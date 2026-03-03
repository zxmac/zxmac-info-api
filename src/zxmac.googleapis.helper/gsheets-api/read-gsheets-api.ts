import { newExc } from "../helpers/error-handler";
import { gsheets_config, gsheets_options } from "./access-gsheets-api";
import * as gsheets_api from "./client-gsheets-api";
import { mapToObjects, SHEET_REGEX } from "./gsheets-api.common";
import { GSheetsGetValuesParams, ObjModel } from "./gsheets-api.model";

export const rangeParam = (sheetName?: string, rowStart?: string, rowEnd?: string) => {
  if (sheetName && sheetName.split(SHEET_REGEX).length === 3) {
    return sheetName;
  } else {
    sheetName ||= gsheets_options.sheetName;
  }
  if (rowStart) {
    let n = rowStart.length === 1 ? gsheets_options.minRows : +rowStart.substring(1);
    if (n > gsheets_options.maxRows) n = gsheets_options.maxRows;
    rowStart = `${rowStart[0]}${n}`;
  } else {
    rowStart = gsheets_options.rowStart;
  }
  if (rowEnd) {
    let n = rowEnd.length === 1 ? gsheets_options.maxRows : +rowEnd.substring(1);
    if (n > gsheets_options.maxRows) n = gsheets_options.maxRows;
    rowEnd = `${rowEnd[0]}${n}`;
  } else {
    rowEnd = gsheets_options.rowEnd;
  }
  return `${sheetName}!${rowStart}:${rowEnd}`;
};

export async function getRawValues({ spreadsheetId, sheet, rowStart, rowEnd }: GSheetsGetValuesParams) {
  let range = '';
  try {
    range = rangeParam(sheet, rowStart, rowEnd);
    const response = await gsheets_api.range.get({
      spreadsheetId,
      range // ex: Sheet1!A1:Z1000
    });
    if (!response?.data?.values?.length) return [];    
    return response.data.values;
  } catch (e) {
    throw newExc(`[GSHEETS_API] getRawValues error [${range}]:`, e);
  }
}
export async function getValues<T>({ spreadsheetId, sheet, rowStart, rowEnd }: GSheetsGetValuesParams) {
  let range = '';
  try {
    range = rangeParam(sheet, rowStart, rowEnd);
    const response = await gsheets_api.range.get({
      spreadsheetId,
      range
    });
    if (!response?.data?.values?.length) return [];
    return mapToObjects<T>(response.data.values);
  } catch (e) {
    throw newExc(`[GSHEETS_API] getValues error [${range}]:`, e);
  }
}

export async function getSheets(spreadsheetId: string) {
  try {
    const response = await gsheets_api.field.get({
      spreadsheetId,
    });
    return response.data.sheets;
  } catch (e) {
    throw newExc('[GSHEETS_API] getSheets error', e);
  }
}

export async function getSheetNames(spreadsheetId: string) {
  try {
    const response = await gsheets_api.field.get({
      spreadsheetId: spreadsheetId,
      fields: 'sheets.properties.title', // Request only the sheet titles
    });
    if (!response?.data?.sheets) return;

    // Extract the sheet names from the response
    const sheetNames = response.data.sheets.map(sheet => sheet?.properties?.title);    
    return sheetNames;
  } catch (e) {
    throw newExc('[GSHEETS_API] getSheetNames error', e);
  }
}

export async function sheetRowCount(sheetId: string, sheetName?: string) {
  const spreadsheetId = sheetId;
  const range = `${sheetName}!A:A`;
  
  try {
    const response = await gsheets_api.range.get({
      spreadsheetId,
      range,
    });
    if (!response?.data?.values) return -1;
    
    return response.data.values.length;
  } catch (e) {
    throw newExc('[GSHEETS_API] sheetRowCount error', e);
  }
}

export async function getMatchSheetId(sheetId: string) {
  const len = sheetId?.length;
  if (len > gsheets_config.validation.minIdLen) return sheetId;
  if (!(len >= gsheets_config.validation.codeLen 
    && len <= gsheets_config.validation.minIdLen 
    && len % 2 === 0)) throw new Error(`Invalid sheetId: [${sheetId}]`);
    
  const list = await getValues<ObjModel>({ spreadsheetId: gsheets_config.master.id });
  const hlfLen = len / 2;
  const id1 = sheetId.substring(0, hlfLen);
  const id2 = sheetId.substring(hlfLen, len);
  const data = list.find(x => {
    if (len === gsheets_config.validation.codeLen) 
      return x.code && x.code === sheetId;
    
    const id = x.id as string;
    return id.indexOf(id1) === 0 && id.indexOf(id2) === id.length - hlfLen;
  });
  if (!data) throw new Error(`Unregistered sheetId: [${sheetId}]`);
  return data.id as string;
}