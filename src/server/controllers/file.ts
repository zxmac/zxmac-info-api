import { Request, Response } from "express";
import { BadRequestResponse, SuccessMsgResponse, SuccessResponse } from "../helpers/api-response";
import service from "../services/file.service";
import blobService from "../services/blob.service";
import { getToken } from "../middlewares/jwt";
import { reqData } from "../helpers/api.helper";
import { env } from "../helpers/env";

async function upload(req: Request, res: Response) {
  const filename = req.params.filename as string;
  await blobService.upload(filename, req.body);
  return new SuccessMsgResponse('File uploaded!').send(res);
}

async function update(req: Request, res: Response) {
  const { sessionId, isSuperAdmin } = reqData(req);
  let filename = req.body.id;
  let url = req.body.url;
  if (!url) {
    const origin = req.get('origin') || env.CORS_ORIGINS.split(',')[0];
    url = `${origin}/print/${filename}/${env.API_AUTH_KEY}`;
  }
  const token = getToken(req);

  if (filename !== sessionId && !isSuperAdmin)
    return new BadRequestResponse('Invalid filename!').send(res);
  if (!filename && isSuperAdmin) 
    filename = sessionId;
  
  const pdfBuffer = await service.generatePdfBuffer(url, { token });
  
  await blobService.upload(`${filename}.pdf`, pdfBuffer, { allowOverwrite: true });

  return new SuccessMsgResponse('File updated!').send(res);
}

async function download(req: Request, res: Response) {
  const { sessionId: filename } = reqData(req);

  const { blob, response } = await blobService.download(`${filename}.pdf`);
    
  res.setHeader('Content-Type', response.headers['content-type']);
  res.setHeader('Content-Disposition', `attachment; filename="${blob.pathname}"`);
  
  response.data.pipe(res);
}

async function directdl(req: Request, res: Response) {
  const { id, url } = req.body;
  
  const pdfBuffer = await service.generatePdfBuffer(url, { format: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
  
  res.send(pdfBuffer);
}

async function metadata(req: Request, res: Response) {
  const filename = req.params.id as string;
  const blob = await blobService.metadata(`${filename}.pdf`);
  return new SuccessResponse(blob).send(res);
}

export default {
  upload,
  update,
  download,
  directdl,
  metadata
};