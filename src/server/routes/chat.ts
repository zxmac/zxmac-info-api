import { Router } from 'express';
import { ChatService, SocketUserService } from '@services';
import { listSocketIds } from '@models';
import { authenticateAdminJWT, authenticateJWT } from '../middlewares/jwt';
import { celebrate, Joi, Segments } from 'celebrate';
import { collectData, getSocketSupportId } from '@utils';
import { Chat } from '../controllers';

export const router = Router();

router.post('/',   
  authenticateJWT, 
  celebrate({
    [Segments.BODY]: Joi.object({
      id: Joi.string().min(8).max(50),
      userId: Joi.string().min(8).max(20),
      timestamp: Joi.string().max(20).allow(null, ''),
      isRead: Joi.boolean(),
      sender: Joi.string().min(8).max(20),
      status: Joi.string().min(4).max(10),
      hasChat: Joi.boolean(),
      recipient: Joi.string().min(8).max(20).required(),
      content: Joi.string().min(1).max(200).required(),
    })
  }),
  async (req: any, res) => {
  const { userId, ip, origin, roles, sessionId } = collectData(req);
  const data = req.body;
  
  try {
    await Chat.save(data, userId, roles, sessionId, ip, origin, req.app.get('io'));    
  } catch (e: any) {
    res.status(e.status || 500).send(e.message || 'Internal Server Error');
  }
});

router.get('/messages/:id', authenticateJWT, async (req: any, res) => {
  const { userId } = collectData(req);
  let chatmate = req.params.id;
  const supportId = getSocketSupportId(chatmate);
  if (supportId) chatmate = supportId;
  let messages = [];
  try {
  messages = await ChatService.fetch(userId, chatmate);
  } catch(e) {
    console.log('error fetch message', e);
  }
  res.status(200).json(messages);
});

router.get('/contacts', authenticateAdminJWT, async (req: any, res, next) => {
  try {
    const chats = await Chat.fetchChats(req);
    res.status(200).json(chats);
  } catch (e) { next(e); }
});

router.get('/support', authenticateJWT, async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const sockets = await io.fetchSockets();  
    const socketIds = sockets.map((socket: any) => socket.id);
    const result = Chat.checkSupportStatus(socketIds);
    res.json(result);
  } catch (e) { next(e); }
});

router.get('/active', authenticateJWT, async (req: any, res) => {
  const io = req.app.get('io');

  const sockets = await io.fetchSockets();
  
  const socketIds = sockets.map((socket: any) => socket.id);

  const socketUsers = await SocketUserService.fetch();
  const activeUsers = socketUsers
    .map((user: any) => {
      const activeSocketIds = listSocketIds(user).filter((id: string) => socketIds.includes(id));
      return { userId: user.userId, activeSocketIds };
    })
    .filter((user: any) => user.activeSocketIds.length > 0);

  res.status(200).json(activeUsers);
});