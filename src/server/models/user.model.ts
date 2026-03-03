import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export enum UserStatus {
  DELETED = 0,
  ACTIVE = 1,
  INACTIVE = 2,
  BANNED = 3
}

export class User {
  id: string = '';
  email: string = '';
  passwordHash: string = '';
  roles: string = '';
  status?: UserStatus = 0;
  deleted?: boolean = false;
}

export interface UserJwtPayload extends JwtPayload {
  roles: string[];
  sessionId?: string;
}

export type UserClaims = UserJwtPayload

export interface UserRequest extends Request {
  user: UserClaims 
}