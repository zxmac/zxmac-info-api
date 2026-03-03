import { Request, Response } from "express";
import gsheets_api from "../core/gsheets-api";
import { GSheet } from "../models";
import { SuccessResponse } from "../helpers/api-response";

async function getSheet(req: Request, res: Response) {
  const spreadsheetId = req.params.id as string;
  const result = await gsheets_api.read.getSheets(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function getData(req: Request, res: Response) {
  const id = req.params.id as string;
  const sn = req.params.sn as string;
  const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
  const sheet = !sn || sn === '_' ? gsheets_api.options.sheetName : sn;
  const result = await gsheets_api.read.getValues<GSheet>({ spreadsheetId, sheet });
  return new SuccessResponse(result).send(res);
}

async function getRawData(req: Request, res: Response) {
  const id = req.params.id as string;
  const sn = req.params.sn as string;
  const spreadsheetId = await gsheets_api.read.getMatchSheetId(id);
  const sheet = !sn || sn === '_' ? gsheets_api.options.sheetName : sn;
  const result = await gsheets_api.read.getRawValues({ spreadsheetId, sheet });
  return new SuccessResponse(result).send(res);
}

export default {
  getSheet,
  getData,
  getRawData
};