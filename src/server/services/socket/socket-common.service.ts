import { env } from "../../helpers/env";
import { SocketUser } from "../../models";

export function mapSocketSupport(): { name: string; id: string }[] {
  const list = env.SOCKET_SUPPORT.split(',')
    .map(x => {
      const s = x.split('|');
      return { name: s[0], id: s[1] };
    });;
  return list;
}

export function getSocketSupportId(name: string = ''): string {
  const list = mapSocketSupport();
  if (!list.length) throw new Error('SOCKET_SUPPORT not set!');
    
  return name ? list.find(x => x.name === name)?.id || '' : list[0].id;
}

export function getSocketSupportName(id: string = ''): string {
  const list = mapSocketSupport();
  if (!list.length) throw new Error('SOCKET_SUPPORT not set!');

  if (id) {
    const support = list.find(x => x.id === id);
    if (!support) throw new Error(`SOCKET_SUPPORT id ${id} not found!`);
    return support.name;
  }
  return list[0].name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function collectSocketInfo(socket: any) {
  const remoteAddress = socket.conn?.remoteAddress || '';
  const origin = socket.handshake.headers.origin || '';
  const address = socket.handshake?.address || '';
  const url = socket.handshake.url || '';
  const isCrossDomain = socket.handshake.xdomain;
  return { remoteAddress, origin, address, url, isCrossDomain };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restrictNonWebRequest(socket: any) {
  const { remoteAddress, origin, address, url, isCrossDomain } = collectSocketInfo(socket);
  const projectId = socket.handshake?.auth?.projectId;
  console.log('restrictNonWebRequest: ', remoteAddress, origin, address, url, isCrossDomain);

  if (origin.indexOf('https') !== -1) return { ok: true };
  
  const mobileCors = env.SOCKET_MOBILE_CORS_ORIGIN.split(',');
  const allowedProjectIds = env.SOCKET_ALLOWED_PROJECT_ID.split(',');
  
  // restrict mobile app
  if ((remoteAddress.indexOf('https') === -1 || address.indexOf('https') === -1)
    && ((mobileCors.indexOf(remoteAddress) !== -1 || mobileCors.indexOf(address) !== -1) && !origin)) {
    console.log('Detected mobile app request', projectId);
    if (!projectId || !allowedProjectIds.includes(projectId)) {
      return { message: 'Forbidden: Invalid Project ID' };
    }
  }
    
  return { ok: true };
}

export function listSocketIds(data: SocketUser) {
  return data.socketIds?.split(',') || [];
}