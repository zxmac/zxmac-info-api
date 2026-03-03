export function newError(msg: string) {
  return { msg };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newExc(msg: string, e: any) {
  msg = msg.endsWith(':') ? msg : `${msg}:`;
  return { ...e, message: `${msg} ${e.msg || e.message}` };
}