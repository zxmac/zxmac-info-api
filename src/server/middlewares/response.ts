import { gsheets_api } from 'zxmac.googleapis.helper';

export function responseHandler(req: any, res: any, next: any) {
  try {
    res.on('finish', () => {
      gsheets_api.access.dispose();
      console.log(`Response for request to ${req.originalUrl} has been sent. Performing cleanup...`);
      // Perform specific cleanup tasks here (e.g., delete temp files)
      // Be careful with resource-intensive synchronous operations
    });
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Error db access' });
  }
}