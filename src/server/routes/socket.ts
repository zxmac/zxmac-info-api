import { Router } from 'express';
import { SocketUserService, SocketServerService } from '@services';

export const router = Router();

router.get('/users/', async (req: any, res: any) => {
  const list = await SocketUserService.fetch();
  res.json(list);
});

router.get('/user/:id/', async (req: any, res: any) => {
  const data = await SocketUserService.getByUserId(req.params.id);
  res.json(data);
});

router.get('/servers/', async (req: any, res: any) => {
  const list = await SocketServerService.fetch();
  res.json(list);
});