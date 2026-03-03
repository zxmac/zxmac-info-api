import { ApiError, ErrorType, HandleApiError } from "../helpers/api-error";
import { env } from "../helpers/env";
import { isValueInEnum } from "../helpers/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function notFoundHandler(req: any, res: any, next: any) {
  res.status(404).json({ error: 'Not Found' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: any, res: any, next: any) { 
  if (err instanceof ApiError || isValueInEnum(ErrorType, err.type)) {
    new HandleApiError(err.type, err.message).handle(res);
  } else {
    const status = err.status || 500;
    const payload = {
      error: err.message || 'Internal Server Error',
    };
    res.status(status).json(env.NODE_ENV !== 'development' 
      ? payload : { ...payload, stack: err.stack });
  }
}