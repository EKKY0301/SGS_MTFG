export class CreateAuditLogDto {
  userId: string;
  entity: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  notes?: string;
}
