import { Member } from './member';

export type Event = {
  id: string;
  name: string;
  description?: string | null;
  date: Date | string;
  location?: string | null;
  maxCapacity?: number | null;
  organizedBy?: string | null;
  attendances?: EventAttendance[];
  createdAt: Date;
  updatedAt: Date;
};

export type EventAttendance = {
  id: string;
  eventId: string;
  event?: Event;
  memberId: string;
  member?: Member;
  status: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
