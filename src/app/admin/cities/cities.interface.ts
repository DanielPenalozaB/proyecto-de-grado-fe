export enum Languages {
  EN = 'en',
  ES = 'es'
}

export interface City {
  id: number;
  name: string;
  description?: string;
  rainfall?: number;
  language?: Languages;
  createdAt: string;
  updatedAt: string;
}