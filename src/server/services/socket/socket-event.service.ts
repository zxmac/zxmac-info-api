import { Server, Socket } from "socket.io";

interface MessageData {
  text: string;
  timestamp?: number;
}

interface PrivateMessageData extends MessageData {
  recipientId: string;
}

// ===== socket/events/messageEvents.ts (Message Event Handlers) =====
function messageEvents(io: Server, socket: Socket): void {
  
  socket.on('message:disconnect', (data: { targetSocketId: string }) => {
    console.log('SOCKET: message:disconnect from', socket.data.user?.userId, ':', data?.targetSocketId);
    if (data?.targetSocketId === socket.id) {
      console.log('SOCKET: message:disconnect socket disconnected', socket.data.user?.userId, ':', data?.targetSocketId);
      socket.disconnect(true);
    }
  });

  socket.on('message:private', (data: PrivateMessageData) => {
    const { recipientId, text } = data;
    console.log('SOCKET: Message:private from', socket.data.user?.userId, ':', data);
    
    // Send to specific user's room
    io.to(`user:${recipientId}`).emit('message:received', {
      from: socket.data.user?.userId,
      text,
      private: true,
      timestamp: Date.now()
    });
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

export default { 
  messageEvents, 
  roomEvents 
};