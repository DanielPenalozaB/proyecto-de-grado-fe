export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  active?: boolean;
}