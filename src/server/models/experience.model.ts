import { LexiconDto } from './lexicon.model';
import { ProfileDto } from './profile.model';
import { ProjectDto } from './project.model';

export interface Experience {
    id?: number;
    guid: string;
    title: string;
    company: string;
    position: string;
    location: string;
    timeperiod: string;
    sequence: number;
    profileId: number;
}

export interface ExperienceDto extends Experience {
    profile?: ProfileDto;
    projects?: ProjectDto[];
    lexicons?: LexiconDto[];
}