import { Languages } from "@/common/common.interface";

export enum GuideDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum GuideStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Guide {
  id: number;
  name: string;
  description: string;
  difficulty: GuideDifficulty;
  estimatedDuration: number;
  status: GuideStatus;
  language: Languages;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}