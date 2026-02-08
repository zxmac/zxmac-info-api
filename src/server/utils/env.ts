import dotenv from 'dotenv';
dotenv.config();
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET || '',
  REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN || '7d',
  TRUST_PROXY: process.env.TRUST_PROXY || '',
  GSHEETS_API_MASTER_ID: process.env.GSHEETS_API_MASTER_ID || '',
  GSHEETS_API_CRUD_ID: process.env.GSHEETS_API_CRUD_ID || '',
  GSHEETS_API_CHAT_ID: process.env.GSHEETS_API_CHAT_ID || '',
  API_KEY: process.env.API_KEY || '',
  API_LOCAL_KEY: process.env.API_LOCAL_KEY || '',
  API_AUTH_KEY: process.env.API_AUTH_KEY || '',
  SOCKET_SUPPORT: process.env.SOCKET_SUPPORT || '',
  SOCKET_MAX_CONNECTIONS_PER_USER: +(process.env.SOCKET_MAX_CONNECTIONS_PER_USER || 1),
  SOCKET_MAX_USER_CONNECTIONS: +(process.env.SOCKET_MAX_USER_CONNECTIONS || 200),
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '',
  SOCKET_ALLOWED_PROJECT_ID: process.env.SOCKET_ALLOWED_PROJECT_ID || '',
  SOCKET_MOBILE_CORS_ORIGIN: process.env.SOCKET_MOBILE_CORS_ORIGIN || '',
  SOCKET_ENABLED: process.env.SOCKET_ENABLED === 'true'
};

['JWT_SECRET'].forEach((key) => {
  if (!(env as any)[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

export const mapSocketSupport = () => {
  const list = env.SOCKET_SUPPORT.split(',')
    .map(x => {
      const s = x.split('|');
      return { name: s[0], id: s[1] };
    });;
  return list;
}

export const getSocketSupportId = (name: string = ''): string => {
  const list = mapSocketSupport();
  if (!list.length) throw new Error('SOCKET_SUPPORT not set!');
    
  return name ? list.find(x => x.name === name)?.id! : list[0].id;
}

export const getSocketSupportName = (id: string = ''): string => {
  const list = mapSocketSupport();
  if (!list.length) throw new Error('SOCKET_SUPPORT not set!');
    
  return id ? list.find(x => x.id === id)?.name! : list[0].name;
}