import gsheets_api from "../../core/gsheets-api";
import { env } from "../../helpers/env";
import { SocketServer } from "../../models";

const params = {
  spreadsheetId: env.GSHEETS_API_MASTER_ID,
  sheet: 'SOCKET_SERVERS'
};

async function fetch() {
  const list = await gsheets_api.read.getValues<SocketServer>(params);
  return list.filter(x => x.deleted !== true);
}

export default { fetch }