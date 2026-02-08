import { SocketUser } from '@models';
import { CommonLib, env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

const spreadsheetId = env.GSHEETS_API_CRUD_ID;
const sheet = 'SOCKET_USERS';

const validate = (values: any[]) => {
  if (!spreadsheetId || !sheet || values.length >= 10) return false;
  return true;
}

async function fetch() {
  const list = await gsheets_api.read.getValues(spreadsheetId, sheet, 'A1', 'G1000');
  return list.filter(x => x.deleted !== true) as SocketUser[];
}

async function getByUserId(userId: string) {
  const list = await fetch();
  return list.find(x => x.userId === userId) as SocketUser;
}

async function create(data: SocketUser) {
  data.createdDate = CommonLib.getUtcDate();
  data.updatedDate = data.createdDate;
  const values: any[] = Object.values(data);
  const result = await gsheets_api.write.insertSheetRow(spreadsheetId, sheet, values, true, false);
  return result;
}

async function update(data: SocketUser, rowIndex: number = -1) {
  if (rowIndex === -1) {
    const socketUsers = await fetch();
    rowIndex = socketUsers.findIndex(x => x.userId === data.userId);
  }

  rowIndex += 2;
  data.updatedDate = CommonLib.getUtcDate();
  const values = Object.values(data).map(v => v || 'NONE');
  if (!validate(values) || rowIndex > gsheets_api.config.validation.rowLimit!) return false;
  
  const result = await gsheets_api.write.updateSheetRow(spreadsheetId, sheet, values, rowIndex);
  return result;
}

async function upsert(data: SocketUser) {
  const socketUsers = await fetch();
  const rowIndex = socketUsers.findIndex(x => x.userId === data.userId);

  if (rowIndex === -1) {
    return await create(data);
  } else {
    const existData = socketUsers[rowIndex];
    existData.ipAddress = data.ipAddress;
    existData.origin = data.origin;
    return await update(existData, rowIndex);
  }
}

async function deleteByUserId(userId: string) {
  const todos = await fetch();
  const rowIndex = todos.findIndex(x => x.userId === userId);
  const data = todos[rowIndex];
  if (!data) {
    throw new Error('Delete item not found! ' + userId);
  }
  console.log(`Hard deleting socket user at row: ${rowIndex + 2} | ${userId}`);
  await hardDeleteByIndex(rowIndex + 2);
}

async function hardDeleteByIndex(rowIndex: number) {
  const sheets = await gsheets_api.read.getSheets(spreadsheetId);
  const sheetId = sheets?.find(x => x?.properties?.title === sheet)?.properties?.sheetId || 0;
  if (!sheetId) {
    throw new Error('Sheet not found! ' + sheet);
  }
  const result = await gsheets_api.write.deleteSheetRow(spreadsheetId, sheetId, rowIndex);
  return result;
}

export const SocketUserService = {
  fetch,
  getByUserId,
  create,
  update,
  upsert,
  deleteByUserId,
  hardDeleteByIndex
};