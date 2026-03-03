export interface GSheetsApiValidation {
  minIdLen: number,
  codeLen: number,
  rowLimit: number,
  columnLimit: number,
  valueLimit: number,
}

export interface GSheetsApiMaster {
  id: string
}

export interface GSheetsApiKey {
  gsheets_api_email: string,
  gsheets_api_key: string,
  gsheets_api_scopes: string,
  gsheets_api_sheet_range: string,
}

export interface GSheetsApiConfig {
  validation: GSheetsApiValidation,
  master: GSheetsApiMaster,
  key: GSheetsApiKey
}

export interface GSheetsApiOptions {
  sheetName: string,
  range: string,
  rowStart: string, 
  rowEnd: string,
  minRows: number,
  maxRows: number,
  maxColumns: number
}

export type ValType = string | number | boolean;
export interface ObjModel {
  [key: string]: ValType 
}

export interface GSheetsWriteParams<T> {
  spreadsheetId: string, 
  sheet: string, 
  data: T,
  type: { new (): T }
}

export interface GSheetsGetValuesParams {
  spreadsheetId: string,
  sheet?: string,
  rowStart?: string, 
  rowEnd?: string
}

export interface GSheetsInsertRowParams<T> extends GSheetsWriteParams<T> {
  rowIndex?: number
}

export interface GSheetsUpdateRowParams<T> extends GSheetsWriteParams<T> {
  rowIndex: number
}