import { gsheets_api } from '../../zxmac.googleapis.helper';
import { env } from "../helpers/env";

export function access_config() {
  gsheets_api.access.config({
    master: {
      id: env.GSHEETS_API_MASTER_ID
    },
    key: {
      gsheets_api_email: 'GSHEETS_API_EMAIL',
      gsheets_api_key: 'GSHEETS_API_KEY',
      gsheets_api_scopes: 'GSHEETS_API_SCOPES',
      gsheets_api_sheet_range: 'GSHEETS_API_SHEET_RANGE',
    }
  });
}

export default {
  ...gsheets_api,
  access_config,
};