export function collectData(req: any) {
    const origin = (req.get('origin') || 'https://x.x') as string;
    let ip = (req.ip || 'x.x.x') as string;
    if (origin.includes('//localhost:')) {
        ip = 'x.x.x.x';
    }
    const userId = (req.user?.sub || '') as string;
    const roles = (req.user?.roles || []) as string[];
    const sessionId = (req.user?.sessionId || '') as string;
    const isAdmin = roles.includes('admin');
    return { ip, origin, userId, roles, sessionId, isAdmin };
}