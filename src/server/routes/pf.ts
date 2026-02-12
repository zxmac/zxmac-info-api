import { Router } from 'express';
import { authenticateJWT } from '../middlewares/jwt';
import { collectData } from '@utils';
import { Cv } from '../controllers';

export const router = Router();

router.get('/:id', authenticateJWT, async (req: any, res: any) => {
  const { sessionId, isAdmin } = collectData(req);
  const sheetId = isAdmin && req.params.id ? req.params.id : sessionId;
  const result = await Cv.getPf(sheetId);
  res.json(result);
});

router.get('/:id/tech-stack/:companyId', authenticateJWT, async (req: any, res: any) => {
  const { sessionId, isAdmin } = collectData(req);
  const sheetId = isAdmin && req.params.id ? req.params.id : sessionId;
  const result = await Cv.getTechStackByCompany(sheetId, req.params.companyId);
  res.json(result);
});