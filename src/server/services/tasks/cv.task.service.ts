import { SheetLib } from '@utils';
import { ProfileLibService } from '../lib/profile.lib.service';
import { GsheetLibService } from '../lib/gsheet.lib.service';
import { gsheets_api } from 'zxmac.googleapis.helper';

async function processPrivateSync(spreadsheetId: string) {
  const values = await gsheets_api.read.getValues({ spreadsheetId });
  return ProfileLibService.mapProfile(GsheetLibService.gsheetToCv(values));
}

async function processPrivateSyncSheets(spreadsheetId: string) {
  const values = await gsheets_api.read.getValues({ spreadsheetId });
  const profile = ProfileLibService.mapProfile(GsheetLibService.gsheetToCv(values));
  
  const sheets = {
    profile: 'Profile', 
    profileLinks: 'ProfileLinks', 
    techStacks: 'TechStacks', 
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    style: 'Style',
    lexicons: 'Lexicons',
    media: 'Media',
    techTypes: 'TechTypes'
  };

  const allSheetProps = await gsheets_api.read.getSheets(spreadsheetId);
  const tableSheets = allSheetProps?.filter(x => x.properties?.title != 'Sheet1');
  if (tableSheets?.length) {
    for (const sheet of tableSheets) {
      await gsheets_api.resource.deleteSheet(spreadsheetId, sheet?.properties?.sheetId || 0);
    }
  }

  for (const sheet of Object.values(sheets)) {
    await gsheets_api.resource.addSheet(spreadsheetId, sheet);
  }
  
  // libs
  const techTypeListValues = SheetLib.listToValues(ProfileLibService.techTypeList);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.techTypes, techTypeListValues);
  // end 

  const profileValues = SheetLib.objToValues(profile);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.profile, profileValues);

  const profileLinksValues = SheetLib.listToValues(profile.profile_links || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.profileLinks, profileLinksValues);
  
  const techStackValues = SheetLib.listToValues(profile.tech_stack || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.techStacks, techStackValues);

  const educationValues = SheetLib.listToValues(profile.education || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.education, educationValues);

  const o = profile.styleObj as any;
  const styleValFormat = Object.keys(o).map((key, index) => {
    return { id: index+1, key, css: JSON.stringify(o[key].css), class: o[key].class };
  });
  const styleValues = SheetLib.listToValues(styleValFormat);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.style, styleValues);
  
  // experience
  const experienceValues = SheetLib.listToValues(profile.experience || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.experience, experienceValues);

  const expLexiconsValues = SheetLib.listToValues(profile.experience?.flatMap(x => x.lexicons) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.lexicons, expLexiconsValues);

  const expProjValues = SheetLib.listToValues(profile.experience?.flatMap(x => x.projects) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.projects, expProjValues);

  const expProjTechStackValues = SheetLib.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.techStack).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.techStacks, expProjTechStackValues);

  const expProjLexiconsValues = SheetLib.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.lexicons).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.lexicons, expProjLexiconsValues);

  const expProjMediaValues = SheetLib.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.media).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.media, expProjMediaValues);
  
  return { profileValues, profileLinksValues, techStackValues, experienceValues, educationValues, styleValues, 
    expLexiconsValues, expProjValues, expProjTechStackValues, expProjLexiconsValues, expProjMediaValues };
}

export const CvTaskService = { processPrivateSync, processPrivateSyncSheets };