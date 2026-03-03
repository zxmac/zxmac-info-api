import gsheets_api from "../core/gsheets-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function responseHandler(req: any, res: any, next: any) {
  try {
    res.on('finish', () => {      
      console.log(`Response for request to ${req.originalUrl} has been sent. Performing cleanup...`);
      gsheets_api.access.dispose();
      // Perform specific cleanup tasks here (e.g., delete temp files)
      // Be careful with resource-intensive synchronous operations
    });
    return next();
  } catch {
    return res.status(401).json({ error: 'Error response handler' });
  }
}