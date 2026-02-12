import { gsheets_api } from 'zxmac.googleapis.helper';

export async function getData(id: string, sn?: string, slug?: string) {
  const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
  const sheet = !sn || sn === '_' ? gsheets_api.options.sheetName : sn;
  switch (slug) {
    case 'raw':
      return await gsheets_api.read.getRawValues({ spreadsheetId, sheet });
    default:
      return await gsheets_api.read.getValues({ spreadsheetId, sheet });
  }
}