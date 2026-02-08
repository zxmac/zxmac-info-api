export function newError(message: string, status?: number) {  
  const err: any = new Error(message);
  err.status = status;
  return err;
}

export function newExc(msg: string, err: any, status?: number) {  
  const obj = { ...err, message: msg, status };
  if (!status) {
    obj.message = `${msg}: ${err.message}`;
  }
  return obj;
}