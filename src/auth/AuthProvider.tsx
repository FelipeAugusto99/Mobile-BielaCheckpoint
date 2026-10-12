import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as authService from '@/services/authService';
import {
  clearSession,
  loadSession,
  saveSession,
  setUnauthorizedHandler,
  type Session,
} from '@/services/session';
import { removePersistedCache } from '@/query/AppQueryProvider';
import type { Customer } from '@/types/api';

interface AuthContextValue {
  /** false enquanto o app lê o armazenamento seguro na abertura */
  ready: boolean;
  user: Customer | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const apply = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  // Leitura local do expo-secure-store (não é busca na API).
  useEffect(() => {
    loadSession().then((stored) => {
      apply(stored);
      setReady(true);
    });
  }, [apply]);

  const signOut = useCallback(async () => {
    const userId = sessionRef.current?.user.id;
    apply(null);
    await clearSession();
    if (userId) await removePersistedCache(userId);
  }, [apply]);

  // 401 em qualquer rota de comprador derruba a sessão.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token, customer } = await authService.login(email, password);
      const next = { token, user: customer };
      await saveSession(next);
      apply(next);
    },
    [apply],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { token, customer } = await authService.register(name, email, password);
      const next = { token, user: customer };
      await saveSession(next);
      apply(next);
    },
    [apply],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ready, user: session?.user ?? null, signIn, signUp, signOut }),
    [ready, session, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return context;
}
