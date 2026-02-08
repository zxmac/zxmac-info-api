import { Router } from 'express';
import { gsheets_api } from 'zxmac.googleapis.helper';

export const router = Router();

router.get('/sheets/:id/', async (req: any, res: any) => {
  const data = await gsheets_api.read.getSheets(req.params.id);
  res.json(data);
});

router.get('/:id/', async (req: any, res: any) => {
  const sheetId = await gsheets_api.read.getMatchSheetId(req.params.id);
  const { sn } = req.query;
  const data = await gsheets_api.read.getValues(sheetId, sn);
  res.json(data);
});

router.get('/:id/:sn/', async (req: any, res: any) => {
  const { id, sn } = req.params;
  const sheetId = await gsheets_api.read.getMatchSheetId(id);
  const data = await gsheets_api.read.getValues(sheetId, sn);
  res.json(data);
});