import { Router } from 'express';
import { CvTaskService } from '@services';

export const router = Router();

router.get('/sync/:id', async (req: any, res: any) => {
  const data = await CvTaskService.processPrivateSyncSheets(req.params.id);
  res.json(data);
});