import { Router } from 'express';
import { TodoService } from '@services';
import { gsheets_api } from 'zxmac.googleapis.helper';

export const router = Router();

router.get('/:id/:sn/list/', async (req: any, res: any) => {
  const sheetId = await gsheets_api.read.getMatchSheetId(req.params.id);
  const list = await TodoService.fetch(sheetId, req.params.sn);
  res.json(list);
});

router.post('/:id/:sheet/',
  async (req, res, next) => {
    try {
      const { id, sheet } = req.params;
      const data = req.body;
      const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
      const result = await TodoService.create(spreadsheetId, sheet, data);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }
);

router.put('/:id/:sheet/:rowIndex',
  async (req, res, next) => {
    try {
      const { id, sheet, rowIndex } = req.params;
      const data = req.body;
      const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
      const result = await TodoService.update(spreadsheetId, sheet, data, +rowIndex);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }
);

router.delete('/:id/:sheet/:rowIndex',
  async (req, res, next) => {
    try {
      const { id, sheet, rowIndex } = req.params;
      const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
      const result = await TodoService.deleteByIndex(spreadsheetId, sheet, +rowIndex);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }
);

router.post('/raw/:id/:sheet/',
  async (req, res, next) => {
    try {
      const { id, sheet } = req.params;
      const { values } = req.body;
      const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
      const result = await TodoService.create(spreadsheetId, sheet, values);
      res.status(201).json({ id, sheet, values, result });
    } catch (e) { next(e); }
  }
);

router.put('/raw/:id/:sheet/:rowIndex',
  async (req, res, next) => {
    try {
      const { id, sheet, rowIndex } = req.params;
      const { values } = req.body;
      const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
      const result = await TodoService.update(spreadsheetId, sheet, values, +rowIndex);
      res.status(201).json({ id, sheet, values, result });
    } catch (e) { next(e); }
  }
);