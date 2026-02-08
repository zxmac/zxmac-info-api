export interface SocketServer {
  id: string;
  name: string;
  host: string;
  ip: string;
  api: string;
  description: string;  
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  uptime: string;
}