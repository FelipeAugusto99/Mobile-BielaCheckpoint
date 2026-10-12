import { isRaw, str, toList, type Raw } from '@/utils/raw';
import { http } from './http';

export interface PushMessage {
  id: string;
  title: string;
  body: string;
  /** payload para o app (ex.: { rota: 'produto', produtoId }) */
  data: Record<string, string>;
  status?: string;
  customerId?: string;
  createdAt: string;
}

function parseData(value: unknown): Record<string, string> {
  let source: unknown = value;
  if (typeof value === 'string') {
    try {
      source = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (!isRaw(source)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(source)) {
    if (typeof entry === 'string') result[key] = entry;
    else if (typeof entry === 'number') result[key] = String(entry);
  }
  return result;
}

function toMessage(item: Raw): PushMessage | null {
  const id = str(item, 'id');
  const payload = isRaw(item.payload) ? item.payload : undefined;
  const title = str(item, 'title') ?? str(payload, 'title');
  const body = str(item, 'body') ?? str(payload, 'body');
  if (!id || !title || !body) return null;

  return {
    id,
    title,
    body,
    data: parseData(item.data ?? payload?.data),
    status: str(item, 'status'),
    customerId: str(item, 'customerId'),
    createdAt: str(item, 'createdAt') ?? '',
  };
}

/** Histórico de envios da loja (inspector). É a fonte do Caminho B. */
export async function listPushMessages(): Promise<PushMessage[]> {
  const { data } = await http.get<unknown>('/push/messages', { params: { pageSize: 20 } });
  return toList(data)
    .filter(isRaw)
    .map(toMessage)
    .filter((message): message is PushMessage => message !== null);
}
