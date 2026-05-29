import { Member } from './member';

export type PaymentGroup = {
  id: string;
  memberId: string;
  member?: Member;
  year: number;
  amount: number;
  payments?: Payment[];
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  paymentGroupId: string;
  paymentGroup?: PaymentGroup;
  month: number;
  dueDate: Date | string;
  paidDate?: Date | string | null;
  amount?: number | null;
  status: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OldPayment = {
  id: string;
  memberId: string;
  year: number;
  monthsPaidBits: number;
  monthlyAmount: number;
  archivedAt: Date;
};
