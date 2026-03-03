import profileMapper from "../../mappers/profile.mapper";
import gsheetMapper from "../../mappers/gsheet.mapper";
import gsheets_api from "../../core/gsheets-api";
import * as gsheetHelper from "../../helpers/gsheet.helper"; 
import { GSheet } from "../../models";

async function processPrivateSync(spreadsheetId: string) {
  const values = await gsheets_api.read.getValues<GSheet>({ spreadsheetId });
  return profileMapper.mapProfile(gsheetMapper.gsheetToCv(values));
}

async function processPrivateSyncSheets(spreadsheetId: string) {
  const values = await gsheets_api.read.getValues<GSheet>({ spreadsheetId });
  const profile = profileMapper.mapProfile(gsheetMapper.gsheetToCv(values));
  
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
  const techTypeListValues = gsheetHelper.listToValues(profileMapper.techTypeList);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.techTypes, techTypeListValues);
  // end 

  const profileValues = gsheetHelper.objToValues(profile);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.profile, profileValues);

  const profileLinksValues = gsheetHelper.listToValues(profile.profile_links || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.profileLinks, profileLinksValues);
  
  const techStackValues = gsheetHelper.listToValues(profile.tech_stack || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.techStacks, techStackValues);

  const educationValues = gsheetHelper.listToValues(profile.education || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.education, educationValues);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = profile.styleObj as any;
  const styleValFormat = Object.keys(o).map((key, index) => {
    return { id: index+1, key, css: JSON.stringify(o[key].css), class: o[key].class };
  });
  const styleValues = gsheetHelper.listToValues(styleValFormat);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.style, styleValues);
  
  // experience
  const experienceValues = gsheetHelper.listToValues(profile.experience || []);
  await gsheets_api.write.createSheetRows(spreadsheetId, sheets.experience, experienceValues);

  const expLexiconsValues = gsheetHelper.listToValues(profile.experience?.flatMap(x => x.lexicons) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.lexicons, expLexiconsValues);

  const expProjValues = gsheetHelper.listToValues(profile.experience?.flatMap(x => x.projects) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.projects, expProjValues);

  const expProjTechStackValues = gsheetHelper.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.techStack).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.techStacks, expProjTechStackValues);

  const expProjLexiconsValues = gsheetHelper.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.lexicons).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.lexicons, expProjLexiconsValues);

  const expProjMediaValues = gsheetHelper.listToValues(profile.experience?.flatMap(x => x.projects).flatMap(x => x?.media).filter(x => x) || []);
  await gsheets_api.write.insertSheetRows(spreadsheetId, sheets.media, expProjMediaValues);
  
  return { profileValues, profileLinksValues, techStackValues, experienceValues, educationValues, styleValues, 
    expLexiconsValues, expProjValues, expProjTechStackValues, expProjLexiconsValues, expProjMediaValues };
}

export default { 
  processPrivateSync, 
  processPrivateSyncSheets 
};