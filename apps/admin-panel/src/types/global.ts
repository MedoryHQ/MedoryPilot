export interface Language {
  id: string;
  name: string;
  code: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableOption {
  value: string;
  text: string;
}

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}
