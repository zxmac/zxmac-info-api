import { SocketServer } from '@models';
import { env } from '@utils';
import { gsheets_api } from 'zxmac.googleapis.helper';

const params = {
  spreadsheetId: env.GSHEETS_API_MASTER_ID,
  sheet: 'SOCKET_SERVERS'
};

async function fetch() {
  const list = await gsheets_api.read.getValues(params);
  return list.filter(x => x.deleted !== true) as SocketServer[];
}

export const SocketServerService = { fetch }