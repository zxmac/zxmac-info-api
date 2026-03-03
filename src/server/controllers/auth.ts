import { Request, Response } from "express";
import gsheets_api from "../core/gsheets-api";
import service from "../services/user.service";
import socketService from "../services/socket/socket.service";
import socketUserService from "../services/socket/socket-user.service";
import { generateHexId } from "../helpers/utils";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../middlewares/jwt";
import { newSocketUser, UserJwtPayload } from "../models";
import { ApiError, AuthFailureError, BadRequestError, InternalError, NotFoundError } from "../helpers/api-error";
import { SuccessResponse } from "../helpers/api-response";
import { reqData } from "../helpers/api.helper";

const SALT_ROUNDS = 12;

async function checkValidSessionId(sessionId: string) {
  try {
    const matchedSheetId = await gsheets_api.read.getMatchSheetId(sessionId);
    if (!matchedSheetId) throw new Error();
  } catch {
    throw new BadRequestError('Invalid sessionId');
  }
}

async function clearUserSocket(userId: string, req: Request) {
  try {
    const userSocketIds = socketService.userSockets[userId] || [];  
    if (!userSocketIds.length) return;
    
    const io = req.app.get('io');
    if (!io) return;
    const sockets = await io.fetchSockets();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketsToDisconnect: any[] = sockets
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((socket: any) => userSocketIds.some(x => x === socket.id));
    
    if (socketsToDisconnect.length) {
      socketsToDisconnect.map(s => {
        if (s) s.disconnect(true);

        if (socketService.userSockets[userId]?.length) {
          const index = socketService.userSockets[userId].indexOf(s.id);
          if (index !== -1) {
            socketService.userSockets[userId].splice(index, 1);
          }
        }
      });
    }
    console.log(`Auth: sockets ${userId} disconnected [${socketsToDisconnect.length}]`);
  } catch (e) {
    console.log(`Auth: socket disconnection error!`, e);
  }
}

async function register(req: Request, res: Response) {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  if (await service.getByEmail(email)) {
    throw new BadRequestError('Email already registered');
  }
  const id = generateHexId();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  const user = { id, email, passwordHash, roles: 'user' };
  await service.create(user);  
  return new SuccessResponse({ 
    id: user.id, 
    email: user.email, 
    roles: user.roles.split(',') 
  }).send(res);
}

async function login(req: Request, res: Response) {
  const { ip, origin } = reqData(req);
  const { password } = req.body;
  const email = req.body.email.toLowerCase();
  const sessionId = req.body.sessionId;

  await checkValidSessionId(sessionId);
  const user = await service.getByEmail(email);
  if (!user) {
    throw new NotFoundError('Invalid credentials');
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new BadRequestError('Invalid username or password');
  }

  await socketUserService.upsert(newSocketUser(user.id, sessionId, ip, origin));  
  const payload: UserJwtPayload = { sub: user.id, roles: user.roles.split(',') };
  return new SuccessResponse({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  }).send(res);
}

async function loginAsGuest(req: Request, res: Response) {
  const data = reqData(req);
  const { ip, origin } = data;
  let { userId } = data;
  const { sessionId } = req.body;

  await checkValidSessionId(sessionId);
  const socketUsers = await socketUserService.fetch();
    
  if (!userId) {
    if (!sessionId) throw new BadRequestError('Session ID is required for guest login');
    userId = generateHexId(); 
    const rowIndex = socketUsers.findIndex(x => x.userId === userId);
    if (rowIndex === -1) {
      await socketUserService.create(newSocketUser(userId, sessionId, ip, origin));
    } else {
      throw new InternalError('Guest id already exists')
    }
  } else {
    if (socketUsers.findIndex(x => x.userId === userId && x.ipAddress === ip) < 0) {
      await socketUserService.create(newSocketUser(userId, sessionId, ip, origin));
    } else {
      return new SuccessResponse({ isGuestLoggedIn: true }).send(res);
    }
  }
  
  const payload = { sub: userId, roles: ['guest'], sessionId };
  return new SuccessResponse({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  }).send(res);
}

async function loginAsAdmin(req: Request, res: Response) {
  const { ip, origin } = reqData(req);
  const { password } = req.body;
  const email = req.body.email.toLowerCase();
  const sessionId = req.body.sessionId || 'zxc123';

  const user = await service.getByEmail(email);
  if (!user) {
    throw new NotFoundError('Invalid credentials');
  }
  if (user.roles.split(',').indexOf('admin') === -1) {
    throw new AuthFailureError();
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AuthFailureError('Invalid username or password');
  }
  
  // temp
  try {
    await socketUserService.upsert(newSocketUser(user.id, sessionId, ip, origin));
  } catch (e) {
    console.log('LoginAsAdmin save socket-user error', e);
  }
  
  const payload: UserJwtPayload = { sub: user.id, roles: user.roles.split(',') };
  return new SuccessResponse({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  }).send(res);
}

async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await service.get(`${decoded?.sub}`);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const payload: UserJwtPayload = { sub: user.id, roles: user.roles.split(',') };
    return new SuccessResponse({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    }).send(res);
  } catch (e) {
    throw e instanceof ApiError ? e : new AuthFailureError('Invalid or expired refresh token');
  }
}

async function me(req: Request, res: Response) {
  const { userId } = reqData(req);
  const user = await service.get(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return new SuccessResponse({ 
    id: user.id, 
    email: user.email, 
    roles: user.roles.split(',') 
  }).send(res);
}


async function logout(req: Request, res: Response) {
  const { userId, roles } = reqData(req);
  if (roles.length === 1 && roles.includes('guest')) {
    throw new BadRequestError('Unable process logout');
  }
  await socketUserService.deleteByUserId(userId);
  if (req) {
    await clearUserSocket(userId, req);
  }
  return new SuccessResponse(userId).send(res);
}

function generateUUID() {
  return crypto.randomUUID();
}


export default {
  register,
  login,
  loginAsAdmin,
  loginAsGuest,
  refresh,
  logout,
  me,  
  generateUUID
};