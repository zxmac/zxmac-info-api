import jwt from 'jsonwebtoken';
import { env, CommonLib } from '@utils';

function collectToken(req: any) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw { msg: 'Missing token' };
  return token;
}

export function signAccessToken(payload: any) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as any);
}

export function signRefreshToken(payload: any) {
  return jwt.sign(payload, env.REFRESH_JWT_SECRET, { expiresIn: env.REFRESH_JWT_EXPIRES_IN } as any);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_JWT_SECRET);
}

export function authenticateJWT(req: any, res: any, next: any) {
  try {
    const token = collectToken(req);
    req.user = verifyAccessToken(token); // { sub, roles, iat, exp }
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: e.msg || 'Invalid or expired token' });
  }
}

export function authenticateAdminJWT(req: any, res: any, next: any) {
  try {
    const token = collectToken(req);
    req.user = verifyAccessToken(token);
    if (!req.user.roles.includes('admin')) throw { msg: 'Unauthorized access' }
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: e.msg || 'Invalid or expired token' });
  }
}

export function tryAuthenticateJWT(req: any, res: any, next: any) {
  try {
    const token = collectToken(req);
    req.user = verifyAccessToken(token);
    return next();
  } catch (e: any) {
    return next();
  }
}

export function authenticateKey(req: any, res: any, next: any) {
  const auth = req.headers.key || '';
  if (!auth) return res.status(401).json({ error: 'Missing key' });
  try {
    if (!CommonLib.isLocalIp(req.ip)) {
      if (auth != env.API_KEY) throw new Error();
    } else {
      if (auth != env.API_LOCAL_KEY) throw new Error();
    }
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid key' });
  }
}

export function authenticateAuthKey(req: any, res: any, next: any) {
  const auth = req.headers.authkey || '';
  if (!auth) return res.status(401).json({ error: 'Missing key' });
  try {
    if (auth != env.API_AUTH_KEY) throw new Error();
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid key' });
  }
}