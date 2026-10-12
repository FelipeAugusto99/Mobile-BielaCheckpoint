import type { ProductDetail, ProductSummary, Variant } from '@/types/api';
import { isRaw, num } from './raw';

export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function coverUrl(product: ProductSummary): string | undefined {
  const primary = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  return primary?.url ?? product.imageUrl ?? product.image ?? product.thumbnailUrl ?? undefined;
}

export function stockOf(variant: Variant): number | undefined {
  return variant.stock ?? variant.available ?? variant.availableStock;
}

/** A opção pode vir como texto ("2.1") ou como objeto ({ name, value }): lê os dois jeitos. */
function optionText(option: unknown): string | null {
  if (typeof option === 'string' || typeof option === 'number') return String(option);
  if (option !== null && typeof option === 'object') {
    const raw = option as Record<string, unknown>;
    for (const key of ['value', 'label', 'name', 'title']) {
      const found = raw[key];
      if (typeof found === 'string' || typeof found === 'number') return String(found);
    }
  }
  return null;
}

export function variantLabel(variant: Variant): string {
  const source: unknown = variant.options;
  const values: unknown[] =
    source !== null && typeof source === 'object' ? Object.values(source) : [];
  const parts = values.map(optionText).filter((text): text is string => text !== null);
  return parts.length > 0 ? parts.join(' · ') : variant.sku;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  CANCELED: 'Cancelado',
  FULFILLED: 'Separado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  REFUNDED: 'Reembolsado',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

/** Média e contagem que a API já manda no produto (RF-35). Nada é calculado aqui. */
export function ratingOf(product: ProductDetail): { average: number; count: number } | null {
  const raw = product.rating;
  if (!isRaw(raw)) return null;
  const average = num(raw, 'average', 'avg', 'mean');
  const count = num(raw, 'count', 'total', 'reviewsCount');
  if (average === undefined || count === undefined) return null;
  return { average, count };
}

export function formatDistance(km: number | null | undefined): string | undefined {
  if (km === null || km === undefined) return undefined;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}