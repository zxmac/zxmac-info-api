import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isLocalIp } from "../helpers/utils";
import { env } from "../helpers/env";
import { UserClaims, UserRequest } from "../models";
import { ApiError, AuthFailureError } from "../helpers/api-error";

export const getToken = (req: Request) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new AuthFailureError('Missing token');
  return token;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as { [key: string]: string });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, env.REFRESH_JWT_SECRET, { expiresIn: env.REFRESH_JWT_EXPIRES_IN } as { [key: string]: string });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_JWT_SECRET);
}

export function setUser(req: Request) {
  try {
    const token = getToken(req);
    if (!token) throw new AuthFailureError('Missing token');
    (req as UserRequest).user = verifyAccessToken(token) as UserClaims; // { sub, roles, iat, exp }
  } catch (e) {
    throw e instanceof ApiError ? e : new AuthFailureError('Invalid or expired token');
  }
}

export function authenticator(req: Request, _res: Response, next: NextFunction) {
  setUser(req);
  return next();
}

export function adminAuthenticator(req: Request, _res: Response, next: NextFunction) {
  setUser(req);
  if (!(req as UserRequest).user.roles.includes('admin')) throw new AuthFailureError('Unauthorized access');
  return next();
}

export function guestAuthenticator(req: Request, _res: Response, next: NextFunction) {
  try {
    setUser(req);
    return next();
  } catch {
    return next();
  }
}

export function keyAuthenticator(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.key || '';
  if (!auth) throw new AuthFailureError('Missing key');
  if (req.ip && !isLocalIp(req.ip)) {
    if (auth != env.API_KEY) throw new AuthFailureError('Invalid key');
  } else {
    if (auth != env.API_LOCAL_KEY) throw new AuthFailureError('Invalid local key');
  }
  return next();
}

export function authKeyAuthenticator(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authkey || '';
  if (!auth) throw new AuthFailureError('Missing key');
  if (auth != env.API_AUTH_KEY) throw new AuthFailureError('Invalid key');
  return next();
}