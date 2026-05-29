export type Regulation = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  version: string;
  content?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  effectiveDate?: Date | string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
