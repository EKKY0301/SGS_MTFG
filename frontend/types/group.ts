import { Member } from './member';

export type Group = {
  id: string;
  name: string;
  members?: Member[];
  createdAt: Date;
  updatedAt: Date;
};
