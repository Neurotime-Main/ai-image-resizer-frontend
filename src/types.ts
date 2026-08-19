export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
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
  method?: 'pixel_resize' | 'protected_extension' | 'generative_reflow';
  fidelityScore?: number;
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
