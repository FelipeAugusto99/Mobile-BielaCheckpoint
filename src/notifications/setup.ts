import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const CHANNEL_ID = 'biela-avisos';

// Como o app se comporta com a notificação chegando COM o app aberto (SDK 54: shouldShowBanner/List).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** No Android 13+ o canal precisa existir ANTES de pedir a permissão. */
export async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Avisos da loja',
    description: 'Queda de preço nas peças que você favoritou',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
  });
}
