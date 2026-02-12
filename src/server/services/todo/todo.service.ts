import { gsheets_api } from "zxmac.googleapis.helper";

const validate = (spreadsheetId: string, sheet: string, values: any[]) => {
  if (!spreadsheetId || !sheet || values.length >= 10) return false;
  return true;
}

async function fetch(spreadsheetId: string, sheet: string) {
  const list = await gsheets_api.read.getValues({ spreadsheetId, sheet });
  return list.filter(x => x.deleted !== true);
}

async function get(spreadsheetId: string, sheet: string, id: number) {
  const list = await gsheets_api.read.getValues({ spreadsheetId, sheet });
  return list.find(x => x.id === id);
}

async function create(spreadsheetId: string, sheet: string, data: any) {
  const values: any[] = Object.values(data).filter(x => x != null);
  if (!validate(spreadsheetId, sheet, values)) return false;  
  return await gsheets_api.write.insertSheetRow(spreadsheetId, sheet, values);
}

async function update(spreadsheetId: string, sheet: string, data: any, rowIndex: number) {
  const values: any[] = Object.values(data).filter(x => x != null);
  if (!validate(spreadsheetId, sheet, values) 
    || rowIndex > gsheets_api.config.validation.rowLimit) return false;
  return await gsheets_api.write.updateSheetRow(spreadsheetId, sheet, values, rowIndex);
}

async function deleteByIndex(spreadsheetId: string, sheet: string, rowIndex: number) {
  const todos = await fetch(spreadsheetId, sheet);
  const data = todos.find(x => x.id == rowIndex);
  if (!data) {
    throw new Error('Delete item not found! ' + rowIndex);
  }
  data.deleted = true;
  const values: any[][] = [Object.values(data)];
  return await gsheets_api.write.updateSheetRow(spreadsheetId, sheet, values, rowIndex);
}

export const TodoService = { fetch, get, create, update, deleteByIndex };