import axios from 'axios';
import { env } from '@/config/env';
import { toAppError } from './errors';
import { getToken, notifyUnauthorized } from './session';

// Única instância de Axios do app. Nenhuma tela importa axios.
export const http = axios.create({
  baseURL: env.apiUrl, // termina em /v1
  timeout: 15000,
  headers: {
    'X-API-Key': env.apiKey,
    'X-Student-RM': env.studentRm,
  },
});

// Injeta o Bearer quando há sessão e remove quando não há.
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.delete('Authorization');
  }
  return config;
});

// Normaliza qualquer falha em AppError. 401 com sessão ativa derruba a sessão.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const appError = toAppError(error);
    if (appError.status === 401 && getToken()) {
      notifyUnauthorized();
    }
    return Promise.reject(appError);
  },
);
