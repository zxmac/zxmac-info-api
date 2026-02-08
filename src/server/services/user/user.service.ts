
import { User, UserStatus } from '@models';
import { env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

const spreadsheetId = env.GSHEETS_API_CRUD_ID;
const sheet = 'USERS';

const validate = (values: any[]) => {
  if (!spreadsheetId || !sheet || values.length >= 10) return false;
  return true;
}

async function fetch() {
  const list = await gsheets_api.read.getValues(spreadsheetId, sheet);
  return list.filter(x => x.deleted !== true) as User[];
}

async function get(id: string) {
  const list = await gsheets_api.read.getValues(spreadsheetId, sheet);
  return list.find(x => x.id === id) as User;
}

async function getSuperAdmin() {
  const list = await gsheets_api.read.getValues(spreadsheetId, sheet);
  return list.find(x => x.roles && x.roles.includes('superadmin')) as User;
}

async function getByEmail(email: string) {
  const list = await gsheets_api.read.getValues(spreadsheetId, sheet);
  return list.find(x => x.email === email) as User;
}

async function create(data: User, check = true) {
  if (check) {
    const users = await fetch();
    if (users.length >= gsheets_api.config.validation.rowLimit) {
      throw new Error('Unable to create new user');
    } else if (users.find(x => x.email === data.email || x.id == data.id)) {
      throw new Error('User already exists');
    }
  }
  data.status = UserStatus.ACTIVE;
  const values: any[] = [Object.values(data)];
  const result = await gsheets_api.write.insertSheetRow(spreadsheetId, sheet, values, true, false);
  return result;
}

async function update(data: User) {
  const todos = await fetch();
  const rowIndex = todos.findIndex(x => x.email === data.email) + 2;

  const values: any[] = Object.values(data).filter(x => x != null);
  if (!validate(values) || rowIndex > gsheets_api.config.validation.rowLimit) return false;
  const result = await gsheets_api.write.updateSheetRow(spreadsheetId, sheet, values, rowIndex);
  return result;
}

export const UserService = { fetch, get, getSuperAdmin, getByEmail, create, update };