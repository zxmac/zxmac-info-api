import { Request, Response } from "express";
import service from "../services/socket/socket-user.service";
import { SuccessResponse } from "../helpers/api-response";
import { reqParams } from "../helpers/api.helper";

async function getUsers(res: Response) {
  const list = await service.fetch();
  return new SuccessResponse(list).send(res);
}

async function getUser(req: Request, res: Response) {
  const { id } = reqParams(req);
  const result = await service.getByUserId(id);
  return new SuccessResponse(result).send(res);
}

async function getServers(req: Request, res: Response) {
  const result = await service.fetch();
  return new SuccessResponse(result).send(res);
}

export default {
  getUsers,
  getUser,
  getServers
};