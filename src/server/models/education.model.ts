import { ProfileDto } from './profile.model';

export interface Education {
  id?: number;
  name: string;
  description: string;
  graduated: Date | null;
  degree: string;
  location: string;
  sequence: number;
  profileId: number;
}

export interface EducationDto extends Education {
  profile?: ProfileDto;
}