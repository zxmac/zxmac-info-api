import { Router } from 'express';
import { gsheets_api } from 'zxmac.googleapis.helper';

export const router = Router();

router.get('/:id/:sn/', async (req: any, res: any) => {
  const { id, sn } = req.params;
  const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
  const data = await gsheets_api.read.getValues({ spreadsheetId, sheet: sn });
  res.json(data);
});