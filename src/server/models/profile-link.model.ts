import { ProfileDto } from "./profile.model";

export interface ProfileLink {
  id?: number;
  name: string;
  url: string;
  description: string;
  sequence: number;
  profileId: number;
  isLink: number;
  color: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
  link: string;
}

export interface ProfileLinkDto extends ProfileLink {
  profile?: ProfileDto;
}