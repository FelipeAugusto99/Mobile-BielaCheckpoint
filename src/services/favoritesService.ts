import type { FavoriteItem } from '@/types/api';
import { isRaw, num, str, toList, type Raw } from '@/utils/raw';
import { http } from './http';

function toFavorite(item: Raw): FavoriteItem | null {
  const variant = isRaw(item.variant) ? item.variant : undefined;
  const product = isRaw(item.product) ? item.product : undefined;

  const variantId = str(item, 'variantId') ?? str(variant, 'id');
  if (!variantId) return null;

  const images = Array.isArray(item.images) ? item.images : undefined;
  const firstImage = images && isRaw(images[0]) ? str(images[0], 'url') : undefined;

  return {
    variantId,
    name:
      str(item, 'productName', 'name') ??
      str(product, 'name') ??
      str(variant, 'productName', 'name') ??
      'Peça sem nome',
    variantName: str(item, 'variantName') ?? str(variant, 'name'),
    price: num(item, 'price', 'unitPrice') ?? num(variant, 'price'),
    imageUrl: str(item, 'imageUrl', 'image') ?? str(product, 'imageUrl', 'image') ?? firstImage,
    productId: str(item, 'productId') ?? str(product, 'id'),
  };
}

export async function listFavorites(): Promise<FavoriteItem[]> {
  const { data } = await http.get<unknown>('/customers/me/favorites');
  return toList(data)
    .filter(isRaw)
    .map(toFavorite)
    .filter((fav): fav is FavoriteItem => fav !== null);
}

export async function addFavorite(variantId: string): Promise<void> {
  await http.post('/customers/me/favorites', { variantId });
}

export async function removeFavorite(variantId: string): Promise<void> {
  await http.delete(`/customers/me/favorites/${variantId}`);
}
