// Leitura segura de JSON cujo formato o Swagger não detalha (sem usar any).

export type Raw = Record<string, unknown>;

export function isRaw(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function str(source: Raw | undefined, ...keys: string[]): string | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

export function num(source: Raw | undefined, ...keys: string[]): number | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
  }
  return undefined;
}

/** Aceita [..] ou { data: [..] } ou { items: [..] }. */
export function toList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRaw(payload)) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.favorites)) return payload.favorites;
  }
  return [];
}
