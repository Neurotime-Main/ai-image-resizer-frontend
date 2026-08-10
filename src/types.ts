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

/** The image models that can adapt a banner. */
export type ImageProviderName = 'gemini' | 'openai';

export interface ProviderInfo {
  name: ImageProviderName;
  label: string;
  model: string;
  /** False when the server has no API key for it — the UI hides those. */
  configured: boolean;
}

export interface GeneratedResult {
  id: string;
  width: number;
  height: number;
  status: 'done' | 'error';
  /** Which model produced this result. */
  provider: ImageProviderName;
  model?: string;
  /** Native canvas the model rendered before the crop to the exact size. */
  renderedAs?: string;
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
  /** Models this generation ran through — two when comparing. */
  providers: ImageProviderName[];
  createdAt: string;
  results: GeneratedResult[];
}
