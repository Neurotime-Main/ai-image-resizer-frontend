import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import client, { TOKEN_KEY, USER_KEY } from '../api/client';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Applies a profile update returned by the API to the cached session. */
  applyUser: (user: User) => void;
  /** Replaces the stored token (used after a password change re-issues one). */
  applyToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [initializing, setInitializing] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setInitializing(false);
      return;
    }
    client
      .get<{ user: User }>('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const persistSession = (token: string, nextUser: User) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    };

    return {
      user,
      initializing,
      login: async (email, password) => {
        const { data } = await client.post<{ token: string; user: User }>('/auth/login', { email, password });
        persistSession(data.token, data.user);
      },
      register: async (name, email, password) => {
        const { data } = await client.post<{ token: string; user: User }>('/auth/register', {
          name,
          email,
          password,
        });
        persistSession(data.token, data.user);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
      applyUser: (nextUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      applyToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
      },
    };
  }, [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
