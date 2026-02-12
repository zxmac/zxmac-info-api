
import { User, UserStatus } from '@models';
import { env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

const params = {
  spreadsheetId: env.GSHEETS_API_CRUD_ID,
  sheet: 'USERS'
};

async function fetch() {
  const list = await gsheets_api.read.getValues(params);
  return list.filter(x => x.deleted !== true) as User[];
}

async function get(id: string) {
  const list = await gsheets_api.read.getValues(params);
  return list.find(x => x.id === id) as User;
}

async function getSuperAdmin() {
  const list = await gsheets_api.read.getValues(params);
  return list.find(x => x.roles && x.roles.includes('superadmin')) as User;
}

async function getByEmail(email: string) {
  const list = await gsheets_api.read.getValues(params);
  return list.find(x => x.email === email) as User;
}

async function create(data: User) {
  const users = await fetch();
  if (users.length >= gsheets_api.config.validation.rowLimit) {
    throw new Error('Unable to create new user');
  } else if (users.find(x => x.email === data.email || x.id == data.id)) {
    throw new Error('User already exists');
  }
  data.status = UserStatus.ACTIVE;
  const rowIndex = users.length + 1;
  return await gsheets_api.write.insertRow({
    data, type: User, rowIndex, ...params
  });
}

async function update(data: User) {
  const users = await fetch();
  let rowIndex = users.findIndex(x => x.email === data.email);
  gsheets_api.util.validate(rowIndex);

  rowIndex += 2;
  return await gsheets_api.write.updateRow({
    data, rowIndex, type: User, ...params
  });
}

export const UserService = { fetch, get, getSuperAdmin, getByEmail, create, update };