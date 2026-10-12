import * as SecureStore from 'expo-secure-store';
import type { Customer } from '@/types/api';

const TOKEN_KEY = 'biela.token';
const USER_KEY = 'biela.user';

export interface Session {
  token: string;
  user: Customer;
}

// Espelho em memória só para o interceptor ler o token de forma síncrona.
// A fonte de verdade é o expo-secure-store.
let memoryToken: string | null = null;

export function getToken(): string | null {
  return memoryToken;
}

export async function saveSession(session: Session): Promise<void> {
  memoryToken = session.token;
  await SecureStore.setItemAsync(TOKEN_KEY, session.token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
}

export async function loadSession(): Promise<Session | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const rawUser = await SecureStore.getItemAsync(USER_KEY);
    if (!token || !rawUser) return null;
    const user = JSON.parse(rawUser) as Customer;
    memoryToken = token;
    return { token, user };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  memoryToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

// 401 em rota de comprador → quem cuida da sessão registra aqui o que fazer.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
