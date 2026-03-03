export interface Media {
  id?: number;
  guid: string;
  name: string;
  url: string;
  type: string;
  description: string;
  sequence: number;
}

export type MediaDto = Media