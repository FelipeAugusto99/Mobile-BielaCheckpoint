import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { syncStoreMessages } from './sync';
import { useNotificationPermission } from './useNotificationPermission';

/** Ao abrir o app (e ao voltar para ele) busca os avisos da loja, se a permissão permitir. */
export function NotificationSync({ userId }: { userId: string }) {
  const { state } = useNotificationPermission();
  const running = useRef(false);
  const granted = state.status === 'granted';

  const run = useCallback(async () => {
    if (!granted || running.current) return;
    running.current = true;
    try {
      await syncStoreMessages(userId);
    } catch {
      // sem rede ou sem histórico: o app segue normal, tenta de novo na próxima abertura
    } finally {
      running.current = false;
    }
  }, [granted, userId]);

  useEffect(() => {
    void run();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void run();
    });
    return () => subscription.remove();
  }, [run]);

  return null;
}
