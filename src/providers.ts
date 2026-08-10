import { ImageProviderName } from './types';

/**
 * Per-provider colour and label, used everywhere a result is attributed.
 * The two colours are deliberately far apart in hue so a grid of mixed
 * results can be scanned at a glance.
 */
export const PROVIDER_META: Record<ImageProviderName, { label: string; color: string }> = {
  gemini: { label: 'Gemini', color: '#4285f4' },
  openai: { label: 'OpenAI', color: '#10a37f' },
};

export function providerLabel(name: ImageProviderName): string {
  return PROVIDER_META[name]?.label ?? name;
}

export function providerColor(name: ImageProviderName): string {
  return PROVIDER_META[name]?.color ?? '#8c8c8c';
}
