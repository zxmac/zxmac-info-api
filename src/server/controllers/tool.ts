import { Request, Response } from "express";
import service from "../services/tools/form.tool.service";
import fileService from "../services/file.service";
import { SuccessResponse } from "../helpers/api-response";
import { reqParams } from "../helpers/api.helper";

function formToJson(req: Request, res: Response) {
  const { keys } = reqParams(req);
  const data = req.body || '';
  const arrKeys = keys.split(',');
  const result = service.convertToJson(data, arrKeys);
  return new SuccessResponse(result).send(res);
}

async function pdfBuffer(req: Request, res: Response) {
  const pdfBuffer = fileService.generatePdfBuffer(req.body.url);
  res.send(pdfBuffer);
}

export default {
  formToJson,
  pdfBuffer
};