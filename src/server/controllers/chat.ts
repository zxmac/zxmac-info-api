
import { Request, Response } from "express";
import service from "../services/chat.service";
import socketService from "../services/socket/socket.service";
import socketUserService from "../services/socket/socket-user.service";
import { ChatMessage, Contact } from "../models";
import { getUtcDate } from "../helpers/utils";
import { env } from "../helpers/env";
import { ApiError, InternalError } from "../helpers/api-error";
import { SuccessResponse } from "../helpers/api-response";
import { getSocketSupportId, getSocketSupportName, listSocketIds } from "../services/socket/socket-common.service";
import { reqData } from "../helpers/api.helper";

async function getSocketIds(req: Request) {
  try {
    const io = req.app.get('io');
    if (!io) return [];
    const sockets = await io.fetchSockets();  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketIds: string[] = sockets.map((socket: any) => socket.id);
    return socketIds;
  } catch (e) {
    if (env.SOCKET_ENABLED) throw e;
    return [];
  }
}

async function save(req: Request, res: Response) {
  const { userId, ip, origin, roles, sessionId } = reqData(req);
  const data = req.body;
  const io = req.app.get('io');
  data.userId = userId;
  data.sender = userId;

  try {
    let appRecipient = data.recipient;
    let isAdmin = false;

    let recipientSocketIds: string[] | undefined;
    const supportId = getSocketSupportId(data.recipient);
    if (supportId) {
      recipientSocketIds = socketService.userSockets[supportId];
      appRecipient = supportId;
    } else if (roles.includes('superadmin')) {
      recipientSocketIds = socketService.userSockets[data.recipient];
      isAdmin = true;
    }
    
    if (!data.hasChat) {
      await service.createRoom(data.sender);
      await service.createRoom(appRecipient);
    }

    data.status = 'Sent';
    data.timestamp = getUtcDate();

    const chatMessage: ChatMessage = {
      id: data.id,
      content: data.content,
      isRead: data.isRead,      
      hasChat: data.hasChat,
      status: data.status,
      userId: data.userId,
      sender: data.sender,
      recipient: appRecipient,
      origin: origin,
      ipAddress: ip,
      timestamp: data.timestamp,
      sessionId
    };
    
    const r = await service.insert(chatMessage, data.sender, appRecipient);
    if (!r) {
      console.error('Encountered error on saving msg to send', data.sender);
      throw new InternalError('Unable to sendchat message (1)');
    }
    const result2 = await service.insert(chatMessage, appRecipient, data.sender);
    if (!result2) {
      console.error('Encountered error on saving msg to recipient');
      throw new InternalError('Unable to sendchat message (2)');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    
    if (recipientSocketIds?.length && io) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sockets: any[] = await io.fetchSockets();      
      const activeSocketIds = recipientSocketIds.filter(x => sockets.findIndex(s => s.id === x) > -1);

      const chatData = { ...data };
      
      if (isAdmin) {
        // send data to client
        // IMPORTANT: Do not show admin/support ids
        const sender = getSocketSupportName(data.sender);
        chatData.userId = sender
        chatData.sender = sender;
      } else {
        // send data to admin
        chatData.recipient = appRecipient;
      }
      
      for (const targetSocketId of activeSocketIds) {
        try {
          io.to(targetSocketId).emit('message:received', { ...chatData, targetSocketId });
        } catch (e) {
          console.error(`Error sending private message to ${targetSocketId}:${chatData.recipient}`, e);
        }
      }      
      result = isAdmin ? chatMessage : data;
    } else {
      if (env.SOCKET_ENABLED) {
        result = { message: 'User no active sockets' };
      } else {
        result = isAdmin ? chatMessage : data;
      }
    }
    return new SuccessResponse('success', result).send(res);
  } catch (e) {
    console.error('Error saving chat message:', e);
    throw e instanceof ApiError ? e : new InternalError('Error saving chat message');
  }
}

async function getMessages(req: Request, res: Response) {
  const { userId } = reqData(req);
  let chatmate = req.params.id as string;
  const supportId = getSocketSupportId(chatmate);
  if (supportId) chatmate = supportId;
  let messages = [];
  try {
    messages = await service.fetch(userId, chatmate);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch(e: any) {
    console.log(e.message + ` (${env.SOCKET_ENABLED ? 'SOCKET_ENABLED' : 'SOCKET_DISABLED'})`);
  }
  return new SuccessResponse(messages).send(res);
}

async function getChats(req: Request, res: Response) {
  const socketIds = await getSocketIds(req);
  const socketUsers = await socketUserService.fetch();
  const chats = socketUsers
    .map((user, index) => {
      const activeSocketIds = listSocketIds(user).filter(id => socketIds.includes(id));
      return {
        id: index + 1,
        userId: user.userId,
        status: activeSocketIds.length > 0 ? 'online' : 'offline',
        ipAddress: user.ipAddress,
        createdDate: user.createdDate,
        updatedDate: user.updatedDate,
      } as Contact;
    });
  return new SuccessResponse(chats).send(res);
}

async function getSupport(req: Request, res: Response) {
  const io = req.app.get('io');
  const sockets = await io.fetchSockets();  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketIds: string[] = sockets.map((socket: any) => socket.id);
  
  const supportId = getSocketSupportId();
  const supportName = getSocketSupportName(supportId);
  const userSocketIds = socketService.userSockets[supportId] || [];  
  
  return new SuccessResponse({ 
    supportName,
    online: userSocketIds.some(s => socketIds.some(x => x === s))
  }).send(res);
}

async function getActiveUsers(req: Request, res: Response) {
  const io = req.app.get('io');  
  const sockets = await io.fetchSockets();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketIds = sockets.map((socket: any) => socket.id);

  const socketUsers = await socketUserService.fetch();
  const activeUsers = socketUsers
    .map(user => {
      const activeSocketIds = listSocketIds(user).filter((id: string) => socketIds.includes(id));
      return { userId: user.userId, activeSocketIds };
    })
    .filter(user => user.activeSocketIds.length > 0);

  return new SuccessResponse(activeUsers).send(res);
}

export default {
  save,  
  getMessages,
  getChats,
  getSupport,
  getActiveUsers
};