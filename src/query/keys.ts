export const queryKeys = {
  me: ['me'] as const,
  categories: ['categories'] as const,
  products: (search: string, categoryId: string | undefined) =>
    ['products', { search, categoryId: categoryId ?? null }] as const,
  product: (id: string) => ['product', id] as const,
  reviews: (productId: string) => ['reviews', productId] as const,
  canReview: (productId: string) => ['can-review', productId] as const,
  pickupPoints: (lat: number | null, lng: number | null) =>
    ['pickup-points', { lat, lng }] as const,
  storeInfo: ['store-info'] as const,
  pushMessages: ['push-messages'] as const,
  favorites: ['favorites'] as const,
  cart: ['cart'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
};
