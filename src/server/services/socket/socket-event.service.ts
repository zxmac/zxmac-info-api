import { Server, Socket } from 'socket.io';
import { SocketUserService } from './socket-user.service';
import { listSocketIds } from '@models';

interface MessageData {
  text: string;
  timestamp?: number;
}

interface PrivateMessageData extends MessageData {
  recipientId: string;
}

function messageEvents(io: Server, socket: Socket): void {
  
  socket.on('message:disconnect', (data: { targetSocketId: string }) => {
    console.log('SOCKET: message:disconnect from', socket.data.user?.userId, ':', data?.targetSocketId);
    if (data?.targetSocketId === socket.id) {
      console.log('SOCKET: message:disconnect socket disconnected', socket.data.user?.userId, ':', data?.targetSocketId);
      socket.disconnect(true);
    }
  });

  // socket.on('message:private', (data: PrivateMessageData) => {
  //   const { recipientId, text } = data;
  //   console.log('SOCKET: Message:private from', socket.data.user?.userId, ':', data);
    
  //   // Send to specific user's room
  //   io.to(`user:${recipientId}`).emit('message:received', {
  //     from: socket.data.user?.userId,
  //     text,
  //     private: true,
  //     timestamp: Date.now()
  //   });
  // });

  socket.on('message:private_old', async (data: PrivateMessageData) => {
    const { recipientId, text } = data;
    console.log('SOCKET: Message:private from', socket.data.user?.sub, ':', data);

    const userId = socket.data.user?.sub;
    var superAdminId = '';
    const roles = socket.data.user?.roles;
    // const admin = await UserService.getSuperAdmin();

    let socketUser;
    if (recipientId === 'chat-assistant') {      
      socketUser = await SocketUserService.getByUserId(superAdminId);
    } else if (userId === superAdminId && roles.includes('superadmin')) {
      console.log('SOCKET: Message:private from admin', userId, ':', recipientId);
      socketUser = await SocketUserService.getByUserId(recipientId);
    }

    if (!socketUser) {
      throw new Error('Unauthorized private message attempt');
    }

    const socketIds = listSocketIds(socketUser).reduce((list, socketId) => {
      if (socketId && list.indexOf(socketId) === -1) list.push(socketId);
      return list;
    }, [] as string[]);
    console.log('socketIds', socketIds);
    if (socketIds.length === 0) {
      throw new Error(`Recipient is not connected: ${recipientId}`);
    }

    socketIds.forEach(targetSocketId => {
      io.to(targetSocketId).emit('message:received', {
        sender: userId,
        text,
        private: true,
        timestamp: Date.now(),
      });
    });
  });

  socket.on('message:private', async ({ content, recipient }: { content: string, recipient: string }) => {
    console.log(`SOCKET: Message:private from ${socket.data.user?.sub}`, content, ':', recipient);

    const userId = socket.data.user?.sub;
    var superAdminId = '';
    const roles = socket.data.user?.roles;
    let sender = userId;
    
    let socketIds: string[] | undefined;
    // if (recipient === env.SOCKET_SUPPORT_IDS) {      
    //   socketIds = userSockets[superAdminId];
    // } else if (userId === superAdminId && roles.includes('superadmin')) {
    //   console.log('SOCKET: Message:private from admin', userId, ':', recipient);
    //   socketIds = userSockets[recipient];
    //   sender = env.SOCKET_SUPPORT_ID;
    // }

    console.log('socketIds', socketIds);
    if (!socketIds?.length) {
      console.log('SOCKET: no active socket', socketIds);
      return;
      // throw new Error('Unauthorized private message attempt');
    }

    socketIds.forEach(targetSocketId => {
      io.to(targetSocketId).emit('message:received', {
        sender,
        content,
        private: true,
        timestamp: Date.now(),
      });
    });
    console.log('SOCKET: Success sent to socketIds', socketIds);
  });

  socket.on('typing:start', () => {
    socket.broadcast.emit('user:typing', {
      userId: socket.data.user?.userId
    });
  });

  socket.on('typing:stop', () => {
    socket.broadcast.emit('user:stopped-typing', {
      userId: socket.data.user?.userId
    });
  });
}

// ===== socket/events/roomEvents.ts (Room Event Handlers) =====
interface RoomMessageData {
  roomId: string;
  text: string;
}

function roomEvents(io: Server, socket: Socket): void {
  
  socket.on('room:join', (roomId: string) => {
    socket.join(roomId);
    console.log(`SOCKET: User ${socket.data.user?.userId} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('room:user-joined', {
      userId: socket.data.user?.userId,
      roomId
    });
    
    socket.emit('room:joined', { roomId });
  });

  socket.on('room:leave', (roomId: string) => {
    socket.leave(roomId);
    console.log(`SOCKET: User ${socket.data.user?.userId} left room ${roomId}`);

    socket.to(roomId).emit('room:user-left', {
      userId: socket.data.user?.userId,
      roomId
    });
  });

  socket.on('room:message', ({ roomId, text }: RoomMessageData) => {
    io.to(roomId).emit('room:message-received', {
      from: socket.data.user?.userId,
      text,
      roomId,
      timestamp: Date.now()
    });
  });
}

export const SocketEventService = { messageEvents, roomEvents };