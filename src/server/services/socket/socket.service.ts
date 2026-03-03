import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import socketUserService from "./socket-user.service";
import { env } from "../../helpers/env";
import { 
  collectSocketInfo, 
  getSocketSupportName, 
  mapSocketSupport, 
  restrictNonWebRequest 
} from "./socket-common.service";

interface UserSocket {
  [userId: string]: string[];
}

const userSockets: UserSocket = {};
const MAX_CONNECTIONS_PER_USER = env.SOCKET_MAX_CONNECTIONS_PER_USER;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initSocketIO(server: any) {
  const io = new Server(server, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN.split(','),
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifyAdmins = (userId: string, ev: string, obj: any = {}) => {
    const supportList = mapSocketSupport().filter(x => x.id !== userId);
    for (const sup of supportList) {
      const socketIds = userSockets[sup.id] || [];
      for (const sid of socketIds) {
        try {
          io.to(sid).emit(ev, { socketId: sid, ...obj });
        } catch (e) {
          console.error(`Error sending nootify admins to ${{ ...sup, sid, ev }}}`, e);
        }
      }
    }
  };

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    // Verify JWT token
    if (token) {
      const rnwr = restrictNonWebRequest(socket);
      if (!rnwr.ok) return next(new Error(rnwr.message));
      
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.data.user = decoded;
        socket.data.authenticated = true;
        return next();
      } catch {
        return next(new Error('Invalid token'));
      }
    }

    return next(new Error('Authentication required'));
  });

  // Connection handler
  io.on('connection', async (socket) => {
    console.log('SOCKET: connection', socket.conn?.remoteAddress);
    const userId = socket.data.user.sub;
    const isAdmin = socket.data.user.roles.includes('superadmin');

    const notifyClients = (online: boolean) => {
      if (!isAdmin) return;
      socket.broadcast.emit('support:info', {
        supportName: getSocketSupportName(),
        online
      });
    };
    
    // Join user to their personal room
    // if (socket.data.user?.userId) {
    //   socket.join(`user:${socket.data.user.userId}`);
    // }

    if (Object.keys(userSockets).length >= env.SOCKET_MAX_USER_CONNECTIONS) {
      console.log(`SOCKET: Exceeded max user socket connections. Disconnecting oldest connection.`);
      socket.disconnect(true);
      // throw new Error('Max user socket connections exceeded');
      notifyAdmins(userId, 'socket:syserror', { message:  'Max user socket connections exceeded' });
      return;
    }

    socket.emit('authenticated', {
      socketId: socket.id,
      userId,
      conn: collectSocketInfo(socket)
    });
    
    notifyClients(true);

    // messageEvents(io, socket);
    // roomEvents(io, socket);
    
    socket.on('disconnect', () => {
      console.log(`SOCKET: User ${userId} disconnected. Remaining connections: ${userSockets[userId]?.length || 0}`);

      notifyAdmins(userId, 'user:disconnected');
      notifyClients(false);
    });

    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }
    
    // Add new socket id
    userSockets[userId].push(socket.id);
    console.log(`SOCKET: User ${userId} connected. Total connections: ${userSockets[userId].length}`);

    // Enforce the connection limit
    if (userSockets[userId].length > MAX_CONNECTIONS_PER_USER) {
      console.log(`SOCKET: User ${userId} exceeded connection limit. Disconnecting oldest connection.`);
      // Disconnect the oldest connection(s)
      while (userSockets[userId].length > MAX_CONNECTIONS_PER_USER) {
        const oldestSocket = userSockets[userId].shift()!;
        const s = io.sockets.sockets.get(oldestSocket);
        if (s) {
          s.disconnect(true);
          console.log(`SOCKET: Disconnected oldest socket: ${s.id}`);
        }
        const index = userSockets[userId].indexOf(oldestSocket);
        if (index !== -1) {
          userSockets[userId].splice(index, 1);
        }
      }
    }
    
    const socketUser = await socketUserService.getByUserId(userId);
    if (socketUser) {
      console.log('SOCKET: Socket user updated', userId);
      try {
        await socketUserService.update({ ...socketUser, socketIds: userSockets[userId].join(',') });
      } catch {
        console.log('SOCKET: Error socket user updated', userId);
      }
    } else {
      console.warn('SOCKET: Socket user not found!');
    }

    // notify admins
    notifyAdmins(userId, 'user:connected');
  });

  return io;
}

export default { 
  initSocketIO, 
  userSockets 
};