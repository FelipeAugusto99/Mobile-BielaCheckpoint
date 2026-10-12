import { useEffect, useRef } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { str } from '@/utils/raw';
import { isRaw } from '@/utils/raw';

/**
 * Deep link (RF-59): o toque na notificação abre o produto de data.produtoId.
 * useLastNotificationResponse também devolve a notificação que ABRIU o app
 * (app fechado), então o mesmo código cobre os dois casos.
 * Só é montado com o comprador logado: rotas de produto são protegidas.
 */
export function NotificationRouter() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const response = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!navigationState?.key || !response) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const identifier = response.notification.request.identifier;
    if (handledId.current === identifier) return;
    handledId.current = identifier;

    const data = response.notification.request.content.data;
    const produtoId = isRaw(data) ? str(data, 'produtoId') : undefined;
    if (produtoId) {
      router.push({ pathname: '/product/[id]', params: { id: produtoId } });
    }
  }, [navigationState?.key, response, router]);

  return null;
}
