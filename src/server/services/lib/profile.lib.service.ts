import { 
  CvDto, EducationDto, ExperienceDto, Lexicon, Media, 
  ProfileDto, ProfileLinkDto, ProjectDto, TechStack, 
  TechStackDto, TechType, TechTypeEnum 
} from '@models';
import { CommonLib } from '@utils';

const techTypeList: TechType[] = [
  {
    'id': 1,
    'name': 'Frontend',
    'description': 'Frontend',
    'sequence': 0
  },
  {
    'id': 2,
    'name': 'Backend',
    'description': 'Backend',
    'sequence': 0
  },
  {
    'id': 3,
    'name': 'Web-Hybrid Frameworks',
    'description': 'Web-Hybrid Frameworks',
    'sequence': 0
  },
  {
    'id': 4,
    'name': 'Miscellaneous',
    'description': 'Miscellaneous',
    'sequence': 0
  },
  {
    'id': 5,
    'name': 'Fullstack',
    'description': 'Fullstack',
    'sequence': 0
  }
];

function mapProfile(cv: CvDto) {
  const profile: ProfileDto = {
    id: 1,
    name: cv.profile.name,
    email: cv.profile.email,
    phone: cv.profile.number,
    address: cv.profile.address,
    profession: cv.profile.position,
    position: cv.profile.position,
    summary: cv.summary.title,
    intro: cv.summary.intro,
    hei: cv.summary.hei,
    techStackGuid: CommonLib.generateUUID('PT'),
    sheetId: cv.sheetId,
    photo: cv.profile.photo,
    styleObj: cv.styleObj
  };

  // create education list
  profile.education = cv.education.map(x => x.list).flat().map((edu, index) => ({
    id: index + 1,
    name: edu.value,
    description: edu.value,
    graduated: edu.value3 ? new Date(edu.value3) : null,
    location: edu.description,
    degree: edu.value2,
    sequence: index + 1,
    profileId: profile.id
  } as EducationDto));

  // create profile link list
  profile.profile_links = [];
  profile.profile_links.push({
    id: 1,
    name: cv.profile.addressObj.key,
    url: cv.profile.addressObj.value,
    description: cv.profile.addressObj.value2,
    sequence: 1,
    profileId: profile.id!,
    isLink: 0,
    color: cv.profile.addressObj.description,
    style: cv.profile.addressObj.description ? JSON.stringify(cv.profile.addressObj.description) : {},
    link: cv.profile.addressObj.value3
  });

  profile.profile_links.push({
    id: 2,
    name: cv.profile.emailObj.key,
    url: cv.profile.emailObj.value,
    description: cv.profile.emailObj.value2,
    sequence: 2,
    profileId: profile.id!,
    isLink: 0,
    color: cv.profile.emailObj.description,
    style: cv.profile.emailObj.description ? JSON.parse(cv.profile.emailObj.description) : {},
    link: cv.profile.emailObj.value3
  });

  profile.profile_links.push({
    id: 3,
    name: cv.profile.numberObj.key,
    url: cv.profile.numberObj.value,
    description: cv.profile.numberObj.value2,
    sequence: 3,
    profileId: profile.id!,
    isLink: 0,
    color: cv.profile.numberObj.description,
    style: cv.profile.numberObj.description ? JSON.parse(cv.profile.numberObj.description) : {},
    link: cv.profile.numberObj.value3
  });

  const profile_links = cv.profile.links.map((link, index) => ({
    id: index + 4,
    name: link.key,
    url: link.value,
    description: link.value2,
    sequence: index + 4,
    profileId: profile.id,
    isLink: 1,
    color: link.description,
    style: link.description ? JSON.parse(link.description) : {},
    link: link.value3
  } as ProfileLinkDto));

  profile.profile_links = [...profile.profile_links, ...profile_links];

  profile.tech_stack = cv.techStack.techs.map((tech, index) => {
    const techType = techTypeList.find(x => x.name === tech.value);
    return {
      id: index + 1,
      guid: profile.techStackGuid,
      tech: tech.value2,
      proficiency: tech.value,
      url: tech.value3,
      icon: tech.value3,
      sequence: index + 1,
      techTypeId: techType?.id,
      techType: techType
    } as TechStackDto;
  });

  profile.experience = cv.experience.map((tech, index) => {
    const exp = {
      id: index + 1,
      guid: '',
      title: tech.company.value2,
      company: tech.company.value,
      position: tech.position,
      location: tech.company.description,
      timeperiod: tech.timeperiod,
      sequence: index + 1,
      profileId: profile.id
    } as ExperienceDto;

    exp.guid = CommonLib.concatId('EXP', exp.title)

    const id = (index + 1) * 100;
    exp.projects = tech.expApps.map((expApp, index2) => {
      const project = {
        id: id + index2 + 1,
        name: expApp.expApp.value,
        url: expApp.expApp.value2,
        description: expApp.expApp.description || 'NONE',
        sequence: index2 + 1,
        techStackGuid: CommonLib.generateUUID('TS'),
        lexiconGuid: CommonLib.generateUUID('LX'),
        mediaGuid: CommonLib.generateUUID('MD'),
        experienceId: exp.id!
      } as ProjectDto;

      project.techStackGuid = CommonLib.concatId('TS', exp.title, project.name);
      project.lexiconGuid = CommonLib.concatId('LX', exp.title, project.name);
      project.mediaGuid = CommonLib.concatId('MD', exp.title, project.name);

      const projectTechStackList: TechStack[] = [{
        id: id + index2 + 1,
        guid: project.techStackGuid,
        tech: expApp.expAppTechs_,
        proficiency: '10',
        url: '1',
        icon: '1',
        sequence: 1,
        techTypeId: TechTypeEnum.Fullstack
      }];

      const projectLexiconList: Lexicon[] = expApp.expAppConts.map((cont, index2) => ({
        id: id + index2 + 1,
        guid: project.lexiconGuid,
        key: cont.value || 'NONE',
        value: cont.value2 || 'NONE',
        description: cont.description || 'NONE',
        sequence: index2 + 1
      }));

      const projectMediaList: Media[] = expApp.expAppImgs.map((img, index2) => ({
        id: id + index2 + 1,
        guid: project.mediaGuid,
        name: img.key2 || 'NONE',
        url: img.value2 || 'NONE',
        type: img.key3!,
        description: img.value,
        sequence: index2 + 1
      }));

      project.techStack = projectTechStackList;
      project.lexicons = projectLexiconList;
      project.media = projectMediaList;


      return project;
    });

    const lexiconList: Lexicon[] = tech.descriptions.map((desc, index) => ({
      id: index,
      guid: exp.guid,
      key: 'Description',
      value: desc,
      description: desc,
      sequence: index
    }));

    exp.lexicons = lexiconList;

    return exp;
  });

  return profile;
}

export const ProfileLibService = { techTypeList, mapProfile };