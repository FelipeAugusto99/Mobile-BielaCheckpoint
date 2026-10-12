import { useEffect, useMemo, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider, type Persister } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { isAppError } from '@/services/errors';

const DAY = 1000 * 60 * 60 * 24;

// TanStack Query precisa saber quando o aparelho está offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
  }),
);

export function cacheKeyFor(userId: string): string {
  return `biela.query-cache.${userId}`;
}

/** Apaga o cache persistido de um comprador (chamado no logout). */
export async function removePersistedCache(userId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKeyFor(userId));
}

// Sem comprador logado nada é gravado em disco.
const noopPersister: Persister = {
  persistClient: async () => undefined,
  restoreClient: async () => undefined,
  removeClient: async () => undefined,
};

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: DAY,
        retry: (failureCount, error) => {
          // Não insiste em erro que o servidor já respondeu (4xx).
          if (isAppError(error) && error.status !== undefined && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

interface Props {
  userId: string | null;
  children: ReactNode;
}

/**
 * Um QueryClient e uma chave de cache POR comprador. Trocar de conta troca
 * o client inteiro, então a lista do usuário anterior nunca vaza.
 */
export function AppQueryProvider({ userId, children }: Props) {
  const client = useMemo(createClient, [userId]);

  useEffect(() => () => client.clear(), [client]);

  const persistOptions = useMemo(() => {
    const persister = userId
      ? createAsyncStoragePersister({
          storage: AsyncStorage,
          key: cacheKeyFor(userId),
          throttleTime: 1000,
        })
      : noopPersister;
    return {
      persister,
      maxAge: DAY,
      dehydrateOptions: {
        shouldDehydrateQuery: (query: { state: { status: string } }) =>
          query.state.status === 'success',
      },
    };
  }, [userId]);

  return (
    <PersistQueryClientProvider client={client} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  );
}
