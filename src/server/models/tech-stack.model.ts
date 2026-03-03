export interface TechType {
  id?: number;
  name: string;
  description: string;
  sequence: number;
}

export interface TechTypeDto extends TechType {
  tech_stack?: string[];
}

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