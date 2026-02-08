import { Router } from 'express';
import { gsheets_api } from 'zxmac.googleapis.helper';

export const router = Router();

router.get('/:id/:sn/', async (req: any, res: any) => {
  const { id, sn } = req.params;
  const sheetId = await gsheets_api.read.getMatchSheetId(id);
  const data = await gsheets_api.read.getValues(sheetId, sn);
  res.json(data);
});