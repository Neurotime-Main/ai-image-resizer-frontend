export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

export interface UserStats {
  chats: number;
  generations: number;
  banners: number;
}

export interface TargetSize {
  width: number;
  height: number;
}

export interface GeneratedResult {
  id: string;
  width: number;
  height: number;
  status: 'done' | 'error';
  url?: string;
  filename?: string;
  error?: string;
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  thumbUrl: string | null;
}

export interface Generation {
  id: number;
  originalUrl: string;
  originalWidth: number | null;
  originalHeight: number | null;
  description: string;
  sizes: TargetSize[];
  createdAt: string;
  results: GeneratedResult[];
}
