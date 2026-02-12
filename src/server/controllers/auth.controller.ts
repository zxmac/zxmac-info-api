import { AuthService, SocketService, SocketUserService } from '@services';
import { gsheets_api } from 'zxmac.googleapis.helper';

async function isValidSheetId(sheetId: string) {
  try {
    const matchedSheetId = await gsheets_api.read.getMatchSheetId(sheetId);
    return !!matchedSheetId;
  } catch {
    return false;
  }
}

async function checkValidSessionId(sessionId: string) {
  try {
    if (!(await isValidSheetId(sessionId))) {
      throw Error('Invalid sessionId!');
    }
    return true;
  } catch(e: any) {
    console.log(`Auth: invalid sessionId ${sessionId}`, e.message, e.stack, e.error);
    const err: any = new Error(e.message);
    err.status = 400;
    throw err;
  }
}

async function clearUserSocket(userId: string, req: any) {
  try {
    const userSocketIds = SocketService.userSockets[userId] || [];  
    if (!userSocketIds.length) return;
    
    const io = req.app.get('io');
    if (!io) return;
    const sockets = await io.fetchSockets();
    const socketsToDisconnect: any[] = sockets
      .filter((socket: any) => userSocketIds.some(x => x === socket.id));
    
    if (socketsToDisconnect.length) {
      socketsToDisconnect.map(s => {
        if (s) s.disconnect(true);

        if (SocketService.userSockets[userId]?.length) {
          const index = SocketService.userSockets[userId].indexOf(s.id);
          if (index !== -1) {
            SocketService.userSockets[userId].splice(index, 1);
          }
        }
      });
    }
    console.log(`Auth: sockets ${userId} disconnected [${socketsToDisconnect.length}]`);
  } catch (e: any) {
    console.log(`Auth: socket disconnection error!`, e.message);
  }
}

export async function login(email: string, password: string, sessionId: string, ip: string, origin: string ) {
  await checkValidSessionId(sessionId);
  const result = await AuthService.login(email.toLowerCase(), password, sessionId, ip, origin);
  return result;
}

export async function loginAsGuest(userId: string | undefined, sessionId: string, ipAddress: string, origin: string) {
  await checkValidSessionId(sessionId);
  const result = await AuthService.loginAsGuest(userId, sessionId, ipAddress, origin);
  return result;
}

export async function loginAsAdmin(email: string, password: string, sessionId: string, ip: string, origin: string ) {
  const result = await AuthService.loginAsAdmin(email.toLowerCase(), password, sessionId, ip, origin);
  return result;
}

export async function logout(userId: string, req: any) {
  await SocketUserService.deleteByUserId(userId);
  if (req) {
    await clearUserSocket(userId, req);
  }
}