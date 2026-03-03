import { Request, Response } from "express";
import gsheets_api from "../core/gsheets-api";
import { GSheet } from "../models";
import { SuccessResponse } from "../helpers/api-response";
import { reqParams } from "../helpers/api.helper";

async function getSheet(req: Request, res: Response) {
  const { id, sn: sheet } = reqParams(req);
  const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
  const result = await gsheets_api.read.getValues<GSheet>({ spreadsheetId, sheet });
  return new SuccessResponse(result).send(res);
}

export default {
  getSheet
};