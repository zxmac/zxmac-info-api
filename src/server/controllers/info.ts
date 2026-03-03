import { Request, Response } from "express";
import service from "../services/info.service";
import { ProfileLink } from "../models";
import { SuccessResponse } from "../helpers/api-response";
import { reqData, reqParams } from "../helpers/api.helper";
import blobService from "../services/blob.service";

async function getInfoResult(spreadsheetId: string) {
  const info = await service.get(spreadsheetId);
  info.profile_links = info.profile_links?.map((link: ProfileLink) => {
    if (link.url.indexOf('*') === 0) {
      const url = link.url.indexOf('?') === -1 
        ? link.url.replace('*', `*/${spreadsheetId}`) 
        : link.url.replace('?', '').replace('*', `*/${spreadsheetId}`);
      return { ...link, url, link: url };
    }
    return link;
  });
  return info;
}

async function getInfo(req: Request, res: Response) {
  const { sessionId: spreadsheetId } = reqData(req);
  const result = await getInfoResult(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function getInfoAdmin(req: Request, res: Response) {
  const { sessionId } = reqData(req);
  const spreadsheetId = reqParams(req).id || sessionId;
  const result = await getInfoResult(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function getInfoPrint(req: Request, res: Response) {
  const { sessionId } = reqData(req);
  const spreadsheetId = reqParams(req).id || sessionId;
  const result = await getInfoResult(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function download(req: Request, res: Response) {
  const { sessionId: filename } = reqData(req);
  
  const { blob, response } = await blobService.download(`${filename}.pdf`);
  
  res.setHeader('Content-Type', response.headers['content-type']);
  res.setHeader('Content-Disposition', `attachment; filename="${blob.pathname}"`);
  
  response.data.pipe(res);
}

export default { 
  getInfo,
  getInfoAdmin,
  getInfoPrint,
  download
};