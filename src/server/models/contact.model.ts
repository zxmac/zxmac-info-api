export interface Contact {
  id: number;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  status: 'online' | 'offline';
  avatar?: string;
  favorite?: boolean;
  ipAddress: string;
  createdDate: string;
  updatedDate: string;
}