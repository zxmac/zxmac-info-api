export interface TechType {
  id?: number;
  name: string;
  description: string;
  sequence: number;
}

export interface TechTypeDto extends TechType {
  tech_stack?: string[];
}