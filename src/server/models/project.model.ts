import { ExperienceDto } from './experience.model';
import { LexiconDto } from './lexicon.model';
import { MediaDto } from './media.model';
import { TechStackDto } from './tech-stack.model';

export interface Project {
  id?: number;
  name: string;
  url: string;  
  description: string;
  techStackGuid: string;
  lexiconGuid: string;
  mediaGuid: string;
  sequence: number;
  experienceId: number;
}

export interface ProjectDto extends Project {
  experience?: ExperienceDto;
  techStack?: TechStackDto[];
  lexicons?: LexiconDto[];
  media?: MediaDto[];
}