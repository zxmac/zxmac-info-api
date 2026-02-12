import { SocketUser } from '@models';
import { CommonLib, env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

const _params = {
  spreadsheetId: env.GSHEETS_API_CRUD_ID,
  sheet: 'SOCKET_USERS',
};
const params = {
  ..._params,
  rowStart: 'A',
  rowEnd: 'H'
};

async function fetch() {
  const list: SocketUser[] = await gsheets_api.read.getValues(params);
  return list.filter(x => x.deleted !== true);
}

async function getByUserId(userId: string) {
  const list = await fetch();
  return list.find(x => x.userId === userId) as SocketUser;
}

async function create(data: SocketUser) {
  data.createdDate = CommonLib.getUtcDate();
  data.updatedDate = data.createdDate;
  return await gsheets_api.write.insertRow({
    data, type: SocketUser, ..._params
  });
}

async function update(data: SocketUser, rowIndex: number = -1) {
  if (rowIndex === -1) {
    const socketUsers = await fetch();
    rowIndex = socketUsers.findIndex(x => x.userId === data.userId);
    gsheets_api.util.validate(rowIndex);
  }

  rowIndex += 2;
  data.updatedDate = CommonLib.getUtcDate();
  return await gsheets_api.write.updateRow({
    data, rowIndex, type: SocketUser, ..._params
  });
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
  const list = await fetch();
  let rowIndex = list.findIndex(x => x.userId === userId);
  const data = list[rowIndex];
  if (!data) {
    throw new Error('Delete item not found! ' + userId);
  }
  rowIndex += 2;
  console.log(`Soft deleting socket user at row: ${rowIndex} | ${userId}`);
  data.deleted = true;
  return await update(data, rowIndex);
  // console.log(`Hard deleting socket user at row: ${rowIndex + 2} | ${userId}`);
  // await hardDeleteByIndex(rowIndex + 2);
}

async function hardDeleteByIndex(rowIndex: number) {
  const sheets = await gsheets_api.read.getSheets(params.spreadsheetId);
  const sheetId = sheets?.find(x => x?.properties?.title === params.sheet)?.properties?.sheetId || 0;
  if (!sheetId) {
    throw new Error('Sheet not found! ' + params.sheet);
  }
  const result = await gsheets_api.write.deleteSheetRow(params.spreadsheetId, sheetId, rowIndex);
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