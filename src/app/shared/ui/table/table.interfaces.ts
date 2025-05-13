import { LucideIconData } from "lucide-angular";

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'badge' | 'action';
  format?: <T>(value: T) => string;
  width?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: LucideIconData;
  action: (row: T) => void;
  style?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T[];
  meta?: {
    pagination: Pagination;
  };
}