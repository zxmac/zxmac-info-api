import { Router } from 'express';
import { gsheets_api } from 'zxmac.googleapis.helper';
import { GSheet } from '../controllers';

export const router = Router();

router.get('/sheets/:id/', async (req: any, res: any) => {
  const data = await gsheets_api.read.getSheets(req.params.id);
  res.json(data);
});

router.get('/:id/:sn/', async (req: any, res: any) => {
  const { id, sn } = req.params;
  const data = await GSheet.getData(id, sn);
  res.json(data);
});

router.get('/:id/:sn/raw', async (req: any, res: any) => {
  const { id, sn } = req.params;
  const data = await GSheet.getData(id, sn, 'raw');
  res.json(data);
});