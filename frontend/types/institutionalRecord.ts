export type InstitutionalRecord = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  recordDate: Date | string;
  content?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};
