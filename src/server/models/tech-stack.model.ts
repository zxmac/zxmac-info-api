import { TechTypeDto } from './lib/tech-type.mode';

export interface TechStack {
    id?: number;
    guid: string;
    tech: string;
    proficiency: string;
    url: string;
    icon: string;
    sequence: number;
    techTypeId: TechTypeEnum;
}

export interface TechStackDto extends TechStack {
    techType?: TechTypeDto;
}

export enum TechTypeEnum {
  None,
  Frontend,
  Backend,
  WebFremework,
  Miscellaneous,
  Fullstack
}