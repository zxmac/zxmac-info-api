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
}