export interface JwtPayload {
  sub: string;
  roles: string[];
  sessionId: string;
}