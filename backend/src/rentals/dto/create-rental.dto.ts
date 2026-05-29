export class CreateRentalDto {
  resourceId: string;
  memberId: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  amount?: number;
  deposit?: number;
  notes?: string;
}
