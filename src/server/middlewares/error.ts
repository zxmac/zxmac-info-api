import { env } from "@utils";

export function notFoundHandler(req: any, res: any, next: any) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, req: any, res: any, next: any) { // eslint-disable-line
  const status = err.status || 500;
  const payload: any = {
    error: err.message || 'Internal Server Error',
  };
  if (env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}

// export function errorHandler(err: any, req: any, res: any, next: any) { // eslint-disable-line
//   const status = err.status || 500;
//   const payload: any = {
//     error: err.message || 'Internal Server Error',
//   };
//   if (req.app.get('env') === 'development') {
//     payload.stack = err.stack;
//   }
//   res.status(status).json(payload);
// }