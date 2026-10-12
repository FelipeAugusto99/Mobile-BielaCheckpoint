// Tipos dos contratos da API (conferidos no OpenAPI da turma).
// Campos que o Swagger não detalha estão como opcionais.

export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ProductImage {
  url: string;
  isPrimary?: boolean;
  position?: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  priceFrom?: number | null;
  price?: number | null;
  imageUrl?: string | null;
  image?: string | null;
  thumbnailUrl?: string | null;
  images?: ProductImage[];
  category?: { id: string; name: string } | string | null;
  brand?: { id: string; name: string } | string | null;
}

export interface Variant {
  id: string;
  sku: string;
  price: number;
  stock?: number;
  available?: number;
  availableStock?: number;
  options?: unknown;
  active?: boolean;
}

export interface ProductDetail extends ProductSummary {
  description?: string | null;
  variants: Variant[];
  /** média e contagem vêm junto com o produto (RF-35); formato lido de forma tolerante */
  rating?: Record<string, unknown> | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export interface FavoriteItem {
  variantId: string;
  name: string;
  variantName?: string;
  price?: number;
  imageUrl?: string;
  productId?: string;
}

export interface CartItem {
  variantId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO';

export interface OrderItem {
  variantId: string;
  productName: string;
  variantName: string | null;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPayment {
  status: string;
  method: string;
  amount: number;
  transactionId: string;
}

export interface OrderPickup {
  id: string;
  name: string;
  hours?: string | null;
  address?: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
  payment: OrderPayment | null;
  pickup?: OrderPickup | null;
  createdAt: string;
}

export interface ReviewImage {
  url: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  images: ReviewImage[];
  authorName: string;
  verifiedPurchase: boolean;
  hidden: boolean;
  isMine: boolean;
  createdAt: string;
}

export interface CanReview {
  allowed: boolean;
  /** motivo devolvido pela API quando não pode avaliar */
  reason?: string;
  message?: string;
  existingReview?: Review;
}

export interface PickedPhoto {
  uri: string;
  mimeType: string;
  fileName: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  addressLine?: string;
  hours?: string;
  /** só vem preenchida quando a busca recebeu latitude e longitude */
  distanceKm: number | null;
}

export interface StoreInfo {
  name?: string;
  latitude?: number;
  longitude?: number;
}
