import type { Cart } from '@/types/api';
import { http } from './http';

export async function getCart(): Promise<Cart> {
  const { data } = await http.get<Cart>('/cart');
  return data;
}

export async function addToCart(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await http.post<Cart>('/cart/items', { variantId, quantity });
  return data;
}

export async function setCartQuantity(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await http.patch<Cart>(`/cart/items/${variantId}`, { quantity });
  return data;
}

export async function removeCartItem(variantId: string): Promise<Cart> {
  const { data } = await http.delete<Cart>(`/cart/items/${variantId}`);
  return data;
}
