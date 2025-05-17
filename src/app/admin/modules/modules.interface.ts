export enum ModuleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Module {
  id: number;
  name: string;
  description: string;
  order: number;
  points: number;
  status: ModuleStatus;
  guideId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}