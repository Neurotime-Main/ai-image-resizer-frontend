import client from './client';
import { Chat, Generation, ImageProviderName, ProviderInfo, TargetSize } from '../types';

export async function fetchChats(): Promise<Chat[]> {
  const { data } = await client.get<{ chats: Chat[] }>('/chats');
  return data.chats;
}

export async function fetchChat(chatId: number): Promise<{ chat: Chat; generations: Generation[] }> {
  const { data } = await client.get<{ chat: Chat; generations: Generation[] }>(`/chats/${chatId}`);
  return data;
}

export async function renameChat(chatId: number, title: string): Promise<Chat> {
  const { data } = await client.patch<{ chat: Chat }>(`/chats/${chatId}`, { title });
  return data.chat;
}

export async function deleteChat(chatId: number): Promise<void> {
  await client.delete(`/chats/${chatId}`);
}

export async function fetchProviders(): Promise<ProviderInfo[]> {
  const { data } = await client.get<{ providers: ProviderInfo[] }>('/generate/providers');
  return data.providers;
}

export interface GenerateInput {
  chatId: number | null;
  file: File | null;
  description: string;
  sizes: TargetSize[];
  /** One model, or several to compare them on the same banner. */
  providers: ImageProviderName[];
}

export async function generateBanners(
  input: GenerateInput
): Promise<{ chat: Chat; generation: Generation }> {
  const formData = new FormData();
  if (input.file) formData.append('image', input.file);
  if (input.chatId !== null) formData.append('chatId', String(input.chatId));
  formData.append('description', input.description.trim());
  formData.append('sizes', JSON.stringify(input.sizes));
  formData.append('provider', input.providers.join(','));

  const { data } = await client.post<{ chat: Chat; generation: Generation }>('/generate', formData, {
    timeout: 600000,
  });
  return data;
}
