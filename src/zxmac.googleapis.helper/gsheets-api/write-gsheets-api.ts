/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRawValues, sheetRowCount } from "./read-gsheets-api";
import { gsheets_options } from "./access-gsheets-api";
import * as gsheets_api from "./client-gsheets-api";
import { validate, mapToValues } from "./gsheets-api.common";
import { GSheetsInsertRowParams, GSheetsUpdateRowParams } from "./gsheets-api.model";
import { convertToChar } from "../helpers/utils";
import { newExc } from "../helpers/error-handler";

export async function insertSheetRow(
  spreadsheetId: string, sheet: string, 
  values: any[], rowIndex = -1) {
  try {
    validate(values);
    
    if (rowIndex === -1) {
      const count = await sheetRowCount(spreadsheetId, sheet);
      rowIndex = count > 0 ? count + 1 : 1;
    }
    validate(rowIndex);
    
    const range = `${sheet}!A${rowIndex}`;
    
    const response = await gsheets_api.range.append({
      spreadsheetId: spreadsheetId,
      range: range, // Start from A1 to append to the next available row
      valueInputOption: 'RAW', // How the input data should be interpreted
      requestBody: {
        values: [values], // The data to append as an array of arrays
      },
    });    
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] insertSheetRow error', e);
  }
}

export async function insertRow<T>(params: GSheetsInsertRowParams<T>) {
  const values = mapToValues<T>(params.type, params.data);
  return await insertSheetRow(params.spreadsheetId, params.sheet, values, params.rowIndex);
}

export async function updateSheetRow(spreadsheetId: string, sheet: string, values: any[], rowIndex: number) {
  let resource;
  try {
    validate(values, rowIndex);

    // 3. Insert rows into the sheet
    resource = {
      values: [values],
    };
    // Specify the range where to insert data (e.g., A1 for the top-left)
    const range = `${sheet}!A${rowIndex}`;
    const response = await gsheets_api.range.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW', // How the input data should be interpreted
      requestBody: resource,
    });    
    return response.data;
  } catch (e: any) {
    throw newExc('[GSHEETS_API] updateSheetRow error123', { resource, msg: e.message });
  }
}

export async function updateRow<T>(params: GSheetsUpdateRowParams<T>) {
  const values = mapToValues<T>(params.type, params.data);
  return await updateSheetRow(params.spreadsheetId, params.sheet, values, params.rowIndex);
}

export async function insertSheetCell(spreadsheetId: string, sheet: string, field: string, value: string) {
  try {
    validate(value);

    const sheetValues = await getRawValues({
      spreadsheetId, sheet, 
      rowStart: gsheets_options.rowStart, 
      rowEnd: gsheets_options.rowEnd
    });

    const sheetFields = sheetValues.length ? sheetValues[0] : [];
    let columnIndex = sheetFields.findIndex((cell: string) => cell === field);
    const values: any[][] = [];
    let rowIndex = 0;

    validate(columnIndex);
    
    if (columnIndex === -1) {
      values.push([field]);
      columnIndex = sheetFields.length + 1;
      rowIndex = 1;
    } else {
      rowIndex = sheetValues.filter((cells) => !!cells[columnIndex]).length;
      columnIndex += 1;
      rowIndex += 1;
    }
    validate(rowIndex);
    values.push([value]);
    
    const column = convertToChar(columnIndex);
    const range = `${sheet}!${column}${rowIndex}`;
    
    const response = await gsheets_api.range.append({
      spreadsheetId: spreadsheetId,
      range: range, // Start from A1 to append to the next available row
      valueInputOption: 'RAW', // How the input data should be interpreted
      requestBody: {
        values: values, // The data to append as an array of arrays
      },
    });    
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] insertSheetCell error', e);
  }
}

export async function deleteSheetRow(spreadsheetId: string, sheetId: number, rowNumber: number) {
  try {
    // The API uses 0-based indexing for rows.
    // The 'endIndex' is exclusive, so startIndex: 1 and endIndex: 2 deletes only row 2.
    const startIndex = rowNumber - 1;
    const endIndex = rowNumber;

    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: startIndex,
                endIndex: endIndex,
              },
            },
          },
        ],
      },
    };
    const response = await gsheets_api.resource.deleteDimension(request);
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] deleteSheetRow error', e);
  }
}

export async function appendBulkSheet(spreadsheetId: string, sheet: string, values: any[][], checkCount: boolean) {
  try {
    validate(values);

    const row = 1;
    if (checkCount) {
      const count = await sheetRowCount(spreadsheetId, sheet);
      if (count > 0) {        
        values = values.slice(1);
      }
    }
    
    const range = `${sheet}!A${row}`;    
    const response = await gsheets_api.range.append({
      spreadsheetId: spreadsheetId,
      range: range, // Start from A1 to append to the next available row
      valueInputOption: 'RAW', // How the input data should be interpreted
      requestBody: {
          values: values, // The data to append as an array of arrays
      },
    });
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] appendBulkSheet error', e);
  }
}

export async function updateBulkSheet(spreadsheetId: string, sheet: string, values: any[][], checkCount: boolean) {
  try {
    validate(values);

    let row = 1;
    if (checkCount) {
      const count = await sheetRowCount(spreadsheetId, sheet);
      if (count > 0) {        
        row = count + 1;
        values = values.slice(1);
      }
    }
    validate(row);

    // 3. Insert rows into the sheet
    const resource = {
      values,
    };
    // const range = 'Sheet1!A1"; // Specify the range where to insert data (e.g., A1 for the top-left)
    const range = `${sheet}!A${row}`;

    const response = await gsheets_api.range.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW', // How the input data should be interpreted
      requestBody: resource,
    });
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] updateBulkSheet error', e);
  }
}

export async function createSheetRows(spreadsheetId: string, sheet: string, values: any[][]) {
  return await appendBulkSheet(spreadsheetId, sheet, values, false);
}
export async function insertSheetRows(spreadsheetId: string, sheet: string, values: any[][]) {
  return await updateBulkSheet(spreadsheetId, sheet, values, true);
}