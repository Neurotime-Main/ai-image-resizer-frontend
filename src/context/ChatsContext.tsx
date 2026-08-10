import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as chatsApi from '../api/chats';
import { Chat, ProviderInfo } from '../types';
import { useAuth } from './AuthContext';

interface ChatsContextValue {
  chats: Chat[];
  /** Image models the server has keys for — drives the composer's selector. */
  providers: ProviderInfo[];
  loading: boolean;
  refresh: () => Promise<void>;
  upsertChat: (chat: Chat) => void;
  removeChat: (chatId: number) => Promise<void>;
  rename: (chatId: number, title: string) => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

function sortChats(list: Chat[]): Chat[] {
  return [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : b.id - a.id));
}

export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setChats(sortChats(await chatsApi.fetchChats()));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setProviders([]);
      return;
    }
    refresh().catch(() => undefined);
    chatsApi
      .fetchProviders()
      .then(setProviders)
      .catch(() => undefined);
  }, [user, refresh]);

  const value = useMemo<ChatsContextValue>(
    () => ({
      chats,
      providers,
      loading,
      refresh,
      upsertChat: (chat) =>
        setChats((current) => sortChats([chat, ...current.filter((item) => item.id !== chat.id)])),
      removeChat: async (chatId) => {
        await chatsApi.deleteChat(chatId);
        setChats((current) => current.filter((item) => item.id !== chatId));
      },
      rename: async (chatId, title) => {
        const updated = await chatsApi.renameChat(chatId, title);
        setChats((current) => sortChats(current.map((item) => (item.id === chatId ? updated : item))));
      },
    }),
    [chats, providers, loading, refresh]
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export function useChats(): ChatsContextValue {
  const context = useContext(ChatsContext);
  if (!context) throw new Error('useChats must be used inside ChatsProvider');
  return context;
}
