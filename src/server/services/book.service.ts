import gsheets_api from "../core/gsheets-api";
import profileLib from "../mappers/profile.mapper";
import gsheetLib from "../mappers/gsheet.mapper";
import { GSheet } from "../models";

async function get(spreadsheetId: string) {
  spreadsheetId = await gsheets_api.read.getMatchSheetId(spreadsheetId);
  const values = await gsheets_api.read.getValues<GSheet>({ spreadsheetId });
  const book = profileLib.mapProfile(gsheetLib.gsheetToCv(values));
  book.profile_links = book.profile_links?.filter(x => x.name !== 'LINK_PORTFOLIO');
  return book;
}

export default { get };