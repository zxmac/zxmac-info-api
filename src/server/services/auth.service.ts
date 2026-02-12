import argon2 from 'argon2';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middlewares/jwt';
import { SocketUserService } from './socket/socket-user.service';
import { JwtPayload, newSocketUser } from '@models';
import { CommonLib } from '@utils';
import { UserService } from './user/user.service';

async function register(email: string, password: string) {
  if (await UserService.getByEmail(email)) {
    const err: any = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const id = CommonLib.generateHexId();
  const passwordHash = await argon2.hash(password);
  const user = { id, email, passwordHash, roles: 'user' };
  await UserService.create(user);
  return { id, email, roles: user.roles.split(',') };
}

async function login(email: string, password: string, sessionId: string, ipAddress: string, origin: string) {
  const user = await UserService.getByEmail(email);
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) {
    const err: any = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }

  await SocketUserService.upsert(newSocketUser(user.id, sessionId, ipAddress, origin));
  
  const payload = { sub: user.id, roles: user.roles.split(',') };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function loginAsAdmin(email: string, password: string, sessionId: string, ipAddress: string, origin: string) {
  const user = await UserService.getByEmail(email);
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  if (user.roles.split(',').indexOf('admin') === -1) {
    const err: any = new Error('Unauthorized');
    err.status = 403;
    throw err;
  }

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) {
    const err: any = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }
  
  await SocketUserService.upsert(newSocketUser(user.id, sessionId, ipAddress, origin));
  
  const payload = { sub: user.id, roles: user.roles.split(',') };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function loginAsGuest(userId: string | undefined, sessionId: string, ipAddress: string, origin: string) {
  const socketUsers = await SocketUserService.fetch();
  
  if (!userId) {
    if (!sessionId) throw new Error('Session ID is required for guest login');
    userId = CommonLib.generateHexId(); 
    const rowIndex = socketUsers.findIndex(x => x.userId === userId);
    if (rowIndex === -1) {
      await SocketUserService.create(newSocketUser(userId, sessionId, ipAddress, origin));
    } else {
      console.log('AUTH: User id already exists!');
      return {};
    }
  } else {
    if (socketUsers.findIndex(x => x.userId === userId && x.ipAddress === ipAddress) < 0) {
      await SocketUserService.create(newSocketUser(userId, sessionId, ipAddress, origin));
    } else {
      return { isGuestLoggedIn: true };
    }
  }
  
  const payload: JwtPayload = { sub: userId, roles: ['guest'], sessionId };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function refresh(refreshToken: string) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserService.get(`${decoded?.sub}`);
    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const payload = { sub: user.id, roles: user.roles };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    };
  } catch (e: any) {
    e.status = 401;
    e.message = 'Invalid or expired refresh token';
    throw e;
  }
}

async function getById(id: any) {
  const user = await UserService.get(id);
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { id: user.id, email: user.email, roles: user.roles.split(',') };
}

function generateUUID() {
  return crypto.randomUUID();
}

export const AuthService = {
  register,
  login,
  loginAsAdmin,
  loginAsGuest,
  refresh,
  getById,
  generateUUID,
};