import { ProfileLink } from '@models';
import { CvService } from '@services';

export async function getCv(sheetId: string) {
  const cv = await CvService.getCv(sheetId);
  cv.profile_links = cv.profile_links?.map((link: ProfileLink) => {
    if (link.url.indexOf('*') === 0) {
      const url = link.url.indexOf('?') === -1 
        ? link.url.replace('*', `*/${sheetId}`) 
        : link.url.replace('?', '').replace('*', `*/${sheetId}`);
      return { ...link, url, link: url };
    }
    return link;
  });
  return cv;
}

export async function getPf(sheetId: string) {
  const pf = await CvService.getPf(sheetId);
  pf.profile_links = pf.profile_links?.filter(x => x.name !== 'LINK_PORTFOLIO');
  pf.profile_links = pf.profile_links?.map((link: ProfileLink) => {
    if (link.url.indexOf('*') === 0 && link.url.indexOf('?') !== -1) {
      const url = link.url.split('?')[0];
      return { ...link, url, link: url };
    }
    return link;
  });
  return pf;
}

export async function getTechStackByCompany(sheetId: string, companyId: string) {
  const pf = await getPf(sheetId);
  const techStacks = pf.experience
    ?.find(x => x.company === companyId)?.projects
      ?.flatMap(x => {
        return x.techStack?.flatMap(ts => ts.tech.split(','));
      })
      ?.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
  return {
    list: techStacks || [],
    str: techStacks?.join(', ') || ''
  };
}