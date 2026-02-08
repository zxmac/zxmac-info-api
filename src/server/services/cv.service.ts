import { gsheets_api } from 'zxmac.googleapis.helper';
import { CvTaskService } from './tasks/cv.task.service';

async function getCv(sheetId: string) {
  sheetId = await gsheets_api.read.getMatchSheetId(sheetId);
  const cv = await CvTaskService.processPrivateSync(sheetId);
  return cv;
}

async function getPf(sheetId: string) {
  sheetId = await gsheets_api.read.getMatchSheetId(sheetId);
  const pf = await CvTaskService.processPrivateSync(sheetId);
  pf.profile_links = pf.profile_links?.filter(x => x.name !== 'LINK_PORTFOLIO');
  return pf;
}

export const CvService = { getCv, getPf };