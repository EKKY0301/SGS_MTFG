import { Member } from './member';
import { Resource } from './resource';

export type Rental = {
  id: string;
  resourceId: string;
  resource?: Resource;
  memberId: string;
  member?: Member;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  amount?: number | null;
  deposit?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
