import type { CanReview, PickedPhoto, Review } from '@/types/api';
import { isRaw, str, toList, type Raw } from '@/utils/raw';
import { http } from './http';

export function toReview(item: Raw): Review | null {
  const id = str(item, 'id');
  const rating = typeof item.rating === 'number' ? item.rating : undefined;
  if (!id || rating === undefined) return null;

  const author = isRaw(item.author) ? item.author : undefined;
  const images = Array.isArray(item.images)
    ? item.images.filter(isRaw).flatMap((img) => {
        const url = str(img, 'url');
        return url ? [{ url }] : [];
      })
    : [];

  return {
    id,
    rating,
    title: str(item, 'title'),
    comment: str(item, 'comment') ?? '',
    images,
    authorName: str(author, 'name') ?? str(item, 'authorName') ?? 'Cliente',
    verifiedPurchase: item.verifiedPurchase === true,
    hidden: item.hidden === true,
    isMine: item.isMine === true,
    createdAt: str(item, 'createdAt') ?? '',
  };
}

export async function listReviews(productId: string): Promise<Review[]> {
  const { data } = await http.get<unknown>(`/products/${productId}/reviews`, {
    params: { sort: 'recent', page: 1, pageSize: 20 },
  });
  return toList(data)
    .filter(isRaw)
    .map(toReview)
    .filter((review): review is Review => review !== null)
    // avaliação ocultada pelo painel não aparece (RF-42); o servidor já filtra, aqui é reforço
    .filter((review) => !review.hidden);
}

export async function fetchCanReview(productId: string): Promise<CanReview> {
  const { data } = await http.get<unknown>(`/products/${productId}/reviews/can-review`);
  const raw: Raw = isRaw(data) ? data : {};

  const flag = [raw.canReview, raw.allowed, raw.can, raw.eligible].find(
    (value): value is boolean => typeof value === 'boolean',
  );
  const existing = [raw.review, raw.myReview, raw.existingReview].find(isRaw);

  return {
    allowed: flag ?? false,
    reason: str(raw, 'reason', 'code'),
    message: str(raw, 'message'),
    existingReview: existing ? (toReview(existing) ?? undefined) : undefined,
  };
}

/**
 * Envia a foto como multipart/form-data e devolve o mediaId.
 * NÃO fixar Content-Type aqui: o React Native precisa gerar o boundary sozinho.
 */
export async function uploadPhoto(photo: PickedPhoto): Promise<string> {
  const form = new FormData();
  form.append('file', {
    uri: photo.uri,
    name: photo.fileName,
    type: photo.mimeType,
  } as unknown as Blob);
  form.append('folder', 'avaliacoes');

  const { data } = await http.post<unknown>('/uploads', form);
  const mediaId = isRaw(data) ? str(data, 'mediaId', 'id') : undefined;
  if (!mediaId) throw new Error('Upload sem mediaId na resposta');
  return mediaId;
}

export async function createReview(params: {
  productId: string;
  rating: number;
  comment: string;
  mediaIds: string[];
}): Promise<void> {
  await http.post(`/products/${params.productId}/reviews`, {
    rating: params.rating,
    comment: params.comment,
    mediaIds: params.mediaIds.length > 0 ? params.mediaIds : undefined,
  });
}
