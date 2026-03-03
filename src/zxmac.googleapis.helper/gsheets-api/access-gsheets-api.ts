import { google, sheets_v4 } from "googleapis";
import { GSheetsApiConfig, GSheetsApiOptions, GSheetsApiMaster, GSheetsApiKey } from "./gsheets-api.model";
import { SHEET_REGEX } from "./gsheets-api.common";
import { convertToNum, stow } from "../helpers/utils";
import { newExc } from "../helpers/error-handler";

let gsheetsv4: sheets_v4.Sheets | null = null;

export const gsheets_config: GSheetsApiConfig;
export const gsheets_options: GSheetsApiOptions;

export async function gsheetsApi(force = false) {
  if (!gsheetsv4 || force) {
    gsheetsv4 = await sheets_v4();
  }
  return gsheetsv4;
}

export async function initialize(options?: GSheetsApiOptions) {
  if (!gsheetsv4) {
    gsheetsv4 = await sheets_v4();
  }
  if (options) {
    stow(gsheets_options, {
      ...options,
      range: options.range || `${options.sheetName}!${options.rowStart}:${options.rowEnd}`
    });
  }
  return gsheetsv4;
}

/**
 * Configures gsheet API config & options.
 * 
 * @param master.id Master spreadsheetId.
 * @param key Keys to be used for env[key].
 * @param key.gsheets_api_sheet_range The expected value format from env: {sheetName}!{column}{startIndex}:{column}{endIndex} ex. Sheet1!A1:Z1000
 * @param validation.minIdLen Minimum id length to match spreadsheetId.
 * @returns void.
 */
export function config({ master, key, validation }: {
  master: GSheetsApiMaster,
  key: GSheetsApiKey,
  validation?: { 
    minIdLen?: number, 
    codeLen?: number,
    rowLimit?: number,
    columnLimit?: number,
    valueLimit?: number
  }
}) {
  const arr = (process.env[key.gsheets_api_sheet_range] || '').split(SHEET_REGEX);
  // const arr = (process.env[key.gsheets_api_sheet_range] || '')
  //   .split('!').flatMap(x => x.split(':'));
  if (arr.length !== 3) throw new Error('Invalid google sheet range!');
  const options = {
    sheetName: arr[0],
    rowStart: arr[1],
    rowEnd: arr[2],
    minRows: +arr[1].substring(1),
    maxRows: +arr[2].substring(1),
    maxColumns: convertToNum(arr[2][0])
  };
  stow(gsheets_config, {
    master, key,
    validation: {
      minIdLen: validation?.minIdLen || 8,
      codeLen: validation?.codeLen || 4,
      columnLimit: validation?.columnLimit || convertToNum('Z'),
      rowLimit: validation?.rowLimit || options.maxRows,
      valueLimit: validation?.valueLimit || options.maxRows
    }
  });
  stow(gsheets_options, {
    ...options,
    range: `${options.sheetName}!${options.rowStart}:${options.rowEnd}`
  });
}

export function configOpt(options: GSheetsApiOptions) {
  stow(gsheets_options, {
    ...options,
    range: gsheets_options.range || `${gsheets_options.sheetName}!${gsheets_options.rowStart}:${gsheets_options.rowEnd}`
  });
}

export function dispose() {
  gsheetsv4 = null;
}