import { Request, Response } from "express";
import service from "../services/tasks/info.task.service";
import { SuccessResponse } from "../helpers/api-response";
import { reqParams } from "../helpers/api.helper";

async function processSync(req: Request, res: Response) {
  const { id } = reqParams(req);
  const result = await service.processPrivateSyncSheets(id);
  return new SuccessResponse(result).send(res);
}

export default {
  processSync
};