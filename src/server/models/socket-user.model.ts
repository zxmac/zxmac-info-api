export class SocketUser {
  userId: string = '';
  sessionId: string = '';
  origin: string = '';
  ipAddress: string = '';
  socketIds: string = '';
  createdDate: string = '';
  updatedDate: string = '';
  deleted: boolean = false;
}

export const newSocketUser = (userId: string, sessionId: string, ipAddress: string, origin: string, socketId: string = '') => {
  const user: SocketUser = {    
    userId,
    sessionId,
    origin,
    ipAddress,
    socketIds: socketId,
    createdDate: '',
    updatedDate: '',
    deleted: false
  };
  return user;
};