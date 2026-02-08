export interface Lexicon {
  id?: number;
  guid: string;
  key: string;
  value: string;
  description: string;
  sequence: number;
}

export interface LexiconDto extends Lexicon {
}