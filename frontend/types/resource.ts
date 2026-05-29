import { Rental } from './rental';

export type Resource = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  rentals?: Rental[];
  createdAt: Date;
  updatedAt: Date;
};
