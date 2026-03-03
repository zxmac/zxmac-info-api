import { Request, Response } from "express";
import service from "../services/book.service";
import { ProfileLink } from "../models";
import { SuccessResponse } from "../helpers/api-response";
import { reqData, reqParams } from "../helpers/api.helper";

async function getBookResult(spreadsheetId: string) {
  const book = await service.get(spreadsheetId);
  book.profile_links = book.profile_links?.filter(x => x.name !== 'LINK_PORTFOLIO');
  book.profile_links = book.profile_links?.map((link: ProfileLink) => {
    if (link.url.indexOf('*') === 0 && link.url.indexOf('?') !== -1) {
      const url = link.url.split('?')[0];
      return { ...link, url, link: url };
    }
    return link;
  });
  return book;
}

async function getBook(req: Request, res: Response) {
  const { sessionId: spreadsheetId } = reqData(req);
  const result = await getBookResult(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function getBookAdmin(req: Request, res: Response) {
  const { sessionId } = reqData(req);
  const spreadsheetId = reqParams(req).id || sessionId;
  const result = await getBookResult(spreadsheetId);
  return new SuccessResponse(result).send(res);
}

async function getTechStackByCompany(req: Request, res: Response) {
  const { sessionId, isAdmin } = reqData(req);
  const spreadsheetId = (isAdmin && req.params.id ? req.params.id : sessionId) as string;
  const companyId = req.params.companyId;
  
  const book = await service.get(spreadsheetId);
  const techStacks = book.experience
    ?.find(x => x.company === companyId)?.projects
      ?.flatMap(x => {
        return x.techStack?.flatMap(ts => ts.tech.split(','));
      })
      ?.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
  return new SuccessResponse({
    list: techStacks || [],
    str: techStacks?.join(', ') || ''
  }).send(res);
}

export default { 
  getBook,
  getBookAdmin,
  getTechStackByCompany
};