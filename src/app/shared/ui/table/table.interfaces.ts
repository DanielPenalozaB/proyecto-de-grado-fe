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

export interface Meta {
  pagination: Pagination;
  sort: Sort;
}

export interface Pagination {
  page: number;
  limit: number;
  pageCount: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Sort {
  by: string;
  direction: string;
}

export interface ApiResponse<T> {
  data: T[];
  meta: Meta;
}