import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ensureChannel } from './setup';

/**
 * Os três desfechos (RF-56):
 * - undetermined: nunca perguntamos (nenhum prompt foi mostrado)
 * - granted:      liberada
 * - denied:       negada (canAskAgain=false → só pelos ajustes do sistema)
 */
export type NotificationPermissionState =
  | { status: 'loading' }
  | { status: 'undetermined' }
  | { status: 'granted' }
  | { status: 'denied'; canAskAgain: boolean };

function fromResponse(response: Notifications.NotificationPermissionsStatus): NotificationPermissionState {
  if (response.granted) return { status: 'granted' };
  if (response.status === Notifications.PermissionStatus.UNDETERMINED) return { status: 'undetermined' };
  return { status: 'denied', canAskAgain: response.canAskAgain };
}

export function useNotificationPermission() {
  const [state, setState] = useState<NotificationPermissionState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    try {
      setState(fromResponse(await Notifications.getPermissionsAsync()));
    } catch {
      setState({ status: 'undetermined' });
    }
  }, []);

  useEffect(() => {
    void refresh();
    // Quem volta dos ajustes do sistema com a permissão alterada vê o estado novo.
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  /** Só chamar a partir de um toque: é aqui que o prompt do sistema aparece. */
  const request = useCallback(async () => {
    try {
      await ensureChannel();
      setState(fromResponse(await Notifications.requestPermissionsAsync()));
    } catch {
      await refresh();
    }
  }, [refresh]);

  return { state, request, refresh };
}
