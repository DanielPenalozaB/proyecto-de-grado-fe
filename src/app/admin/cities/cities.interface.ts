import { Languages } from "@/common/common.interface";

export interface City {
  id: number;
  name: string;
  description?: string;
  rainfall?: number;
  language?: Languages;
  createdAt: string;
  updatedAt: string;
}