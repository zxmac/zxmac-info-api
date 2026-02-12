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

export const addSocketId = (data: SocketUser, socketId: string) => {
  const keys = Object.keys(data);
  let isAdded = false;
  const obj = keys.reduce((obj, key) => {
    if (key.indexOf('socketId') === 0 && !isAdded && !(data as any)[key]) {
      obj[key] = socketId;
      isAdded = true;
    } else {
      obj[key] = (data as any)[key];
    }
    return obj;
  }, {} as any);

  if (!isAdded) {
    obj['socketId3'] = socketId;
  }

  return obj;
};

export const checkSlotSocketId = (data: SocketUser) => {
  const keys = Object.keys(data);
  return keys.filter(key => {
    if (key.indexOf('socketId') !== 0) return false;
    const o = (data as any)[key];
    return !!o;
  }).length;
};

export const hasSlotSocketId = (data: SocketUser) => {
  return checkSlotSocketId(data) < 3;
};

export const listSocketIds = (data: SocketUser) => {
  return data.socketIds?.split(',') || [];
};