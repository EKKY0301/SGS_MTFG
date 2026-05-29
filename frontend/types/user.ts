export type User = {
  id: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  auditLogs?: AuditLog[];
};

export type AuditLog = {
  id: string;
  userId: string;
  user?: User;
  entity: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  notes?: string | null;
  createdAt: Date;
};
