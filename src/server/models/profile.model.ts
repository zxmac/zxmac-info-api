import { CvStyle } from './cv.model';
import { EducationDto } from './education.model';
import { ExperienceDto } from './experience.model';
import { ProfileLinkDto } from './profile-link.model';
import { TechStackDto } from './tech-stack.model';

export interface Profile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
  position: string;
  summary: string;
  intro: string;
  hei: string;
  techStackGuid: string;
  sheetId: string;
  photo: string;
}

export interface ProfileDto extends Profile {
  education?: EducationDto[]
  profile_links?: ProfileLinkDto[]
  experience?: ExperienceDto[]
  tech_stack?: TechStackDto[],
  styleObj: CvStyle,
}