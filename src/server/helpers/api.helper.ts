import { Request } from "express";
import { UserRequest } from "../models";

export function reqData(req: Request) {
  const origin = (req.get('origin') || 'https://x.x') as string;
  const ip = !origin.includes('//localhost:') ? `${req.ip || 'x.x.x'}` : 'x.x.x.x';
  const user = (req as UserRequest).user;
  const userId = (user?.sub || '') as string;
  const roles = (user?.roles || []) as string[];
  const sessionId = (user?.sessionId || '') as string;
  const isAdmin = roles.includes('admin');
  const isSuperAdmin = roles.includes('superadmin');
  return { ip, origin, userId, roles, sessionId, isAdmin, isSuperAdmin };
}

export function reqParams(req: Request) {
  const keys = Object.keys(req.params);
  return keys.reduce((accu, key) => {
    const p = req.params[key] as string;
    accu[key] = p !== '_' ?  p : '';
    return accu;
  }, {} as { [key: string]: string });
}