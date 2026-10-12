import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { listPushMessages, type PushMessage } from '@/services/pushService';
import { CHANNEL_ID, ensureChannel } from './setup';

const MAX_PRESENTED = 3;
const MAX_REMEMBERED = 100;

const seenKey = (userId: string) => `biela.push-seen.${userId}`;

async function loadSeen(userId: string): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(seenKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : null;
  } catch {
    return null;
  }
}

/** SENT e SKIPPED (ex.: NO_DEVICE) contam: SKIPPED aqui significa "funcionou, não havia aparelho". */
function isPresentable(message: PushMessage, userId: string): boolean {
  if (message.status === 'FAILED') return false;
  if (message.customerId && message.customerId !== userId) return false;
  return true;
}

/**
 * Caminho B: lê o histórico da loja ao abrir o app e apresenta como notificação local,
 * com o payload inteiro (título/corpo para a pessoa, data para o app).
 * Cada mensagem é apresentada uma única vez por comprador.
 * @returns quantas notificações foram apresentadas
 */
export async function syncStoreMessages(userId: string): Promise<number> {
  const messages = await listPushMessages();
  const seen = await loadSeen(userId);
  const seenSet = new Set(seen ?? []);

  // Mais novas primeiro.
  const ordered = [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const fresh = ordered.filter((m) => !seenSet.has(m.id) && isPresentable(m, userId));
  // Primeira execução: não despeja o histórico inteiro, só as mais recentes.
  const toPresent = fresh.slice(0, MAX_PRESENTED).reverse();

  if (toPresent.length > 0) await ensureChannel();
  for (const message of toPresent) {
    await Notifications.scheduleNotificationAsync({
      content: { title: message.title, body: message.body, data: message.data },
      trigger: { channelId: CHANNEL_ID },
    });
  }

  const remembered = [...ordered.map((m) => m.id), ...seenSet].slice(0, MAX_REMEMBERED);
  await AsyncStorage.setItem(seenKey(userId), JSON.stringify([...new Set(remembered)]));
  return toPresent.length;
}
