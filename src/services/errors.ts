import axios from 'axios';

export type AppErrorKind = 'api' | 'timeout' | 'network' | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(params: {
    kind: AppErrorKind;
    code: string;
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.kind = params.kind;
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Converte qualquer falha (Axios, timeout, rede, formato { error }) em AppError. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new AppError({
        kind: 'timeout',
        code: 'TIMEOUT',
        message: 'A loja demorou demais para responder. Tente de novo em instantes.',
      });
    }
    if (!error.response) {
      return new AppError({
        kind: 'network',
        code: 'NETWORK_ERROR',
        message: 'Sem conexão com a internet. Confira sua rede e tente de novo.',
      });
    }
    const status = error.response.status;
    const body: unknown = error.response.data;
    if (isRecord(body) && isRecord(body.error)) {
      const { code, message, details } = body.error;
      return new AppError({
        kind: 'api',
        code: typeof code === 'string' ? code : 'UNKNOWN',
        message: typeof message === 'string' ? message : 'Algo deu errado. Tente novamente.',
        status,
        details,
      });
    }
    return new AppError({
      kind: 'api',
      code: 'UNKNOWN',
      message: 'Algo deu errado do nosso lado. Tente novamente.',
      status,
    });
  }

  return new AppError({
    kind: 'unknown',
    code: 'UNKNOWN',
    message: 'Algo inesperado aconteceu. Tente novamente.',
  });
}

/** Texto pronto para exibir na tela (nunca [object Object]). */
export function errorMessage(error: unknown): string {
  return toAppError(error).message;
}

/**
 * Extrai erros por campo de um VALIDATION_ERROR.
 * Aceita details como mapa { campo: mensagem } ou lista [{ field|path, message }].
 */
export function fieldErrors(error: unknown): Record<string, string> {
  const appError = toAppError(error);
  const result: Record<string, string> = {};
  const details = appError.details;

  if (Array.isArray(details)) {
    for (const item of details) {
      if (!isRecord(item)) continue;
      const key = item.field ?? item.path;
      if (typeof key === 'string' && typeof item.message === 'string') {
        result[key] = item.message;
      }
    }
  } else if (isRecord(details)) {
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string') result[key] = value;
      else if (Array.isArray(value) && typeof value[0] === 'string') result[key] = value[0];
    }
  }
  return result;
}
