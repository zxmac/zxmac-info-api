
import { ChatMessage, Contact, listSocketIds } from '@models';
import { ChatService, SocketService, SocketUserService } from '@services';
import { CommonLib, env, getSocketSupportId, getSocketSupportName, newError, newExc } from '@utils';

async function getSocketIds(req: any) {
  try {
    const io = req.app.get('io');
    if (!io) return [];
    const sockets = await io.fetchSockets();  
    const socketIds: string[] = sockets.map((socket: any) => socket.id);
    return socketIds;
  } catch (e) {
    if (env.SOCKET_ENABLED) throw e;
    return [];
  } 
}

export async function save(data: any, userId: string, roles: string[], 
  sessionId: string, ip: string, origin: string, io?: any) {
  data.userId = userId;
  data.sender = userId;

  try {
    let appRecipient = data.recipient;
    let isAdmin = false;

    let recipientSocketIds: string[] | undefined;
    const supportId = getSocketSupportId(data.recipient);
    if (supportId) {
      recipientSocketIds = SocketService.userSockets[supportId];
      appRecipient = supportId;
    } else if (roles.includes('superadmin')) {
      recipientSocketIds = SocketService.userSockets[data.recipient];
      isAdmin = true;
    }
    
    if (!data.hasChat) {
      await ChatService.createRoom(data.sender);
      await ChatService.createRoom(appRecipient);
    }

    data.status = 'Sent';
    data.timestamp = CommonLib.getUtcDate();

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
    
    const result = await ChatService.insert(chatMessage, data.sender, appRecipient);
    if (!result) {
      console.error('Encountered error on saving msg to send', data.sender);
      throw newError('Unable to sendchat message (1)', 400);
    }
    const result2 = await ChatService.insert(chatMessage, appRecipient, data.sender);
    if (!result2) {
      console.error('Encountered error on saving msg to recipient');
      throw newError('Unable to sendchat message (2)', 400);
    }
    
    if (recipientSocketIds?.length && io) {
      const sockets: any[] = await io.fetchSockets();      
      const activeSocketIds = recipientSocketIds.filter(x => sockets.findIndex(s => s.id === x) > -1);

      let chatData = { ...data };
      
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
      
      return isAdmin ? chatMessage : data;
    } else {
      if (env.SOCKET_ENABLED) {
        return { message: 'User no active sockets' };
      } else {
        return isAdmin ? chatMessage : data;
      }
    }    
  } catch (e: any) {
    console.error('Error saving chat message:', e);
    throw e.message && e.error ? e : newExc('Internal Server Error', e, 500);
  }
}

export function checkSupportStatus(onlineSocketIds: string[]) {
  const supportId = getSocketSupportId();
  const supportName = getSocketSupportName(supportId);
  const userSocketIds = SocketService.userSockets[supportId] || [];  
  return { 
    supportName,
    online: userSocketIds.some(s => onlineSocketIds.some(x => x === s))
   };
}

export async function fetchChats(req: any) {
  const socketIds = await getSocketIds(req);
  const socketUsers = await SocketUserService.fetch();
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
  return chats;
}