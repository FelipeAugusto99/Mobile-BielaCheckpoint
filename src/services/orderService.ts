import type { Order, PaymentMethod } from '@/types/api';
import { http } from './http';

export async function checkout(pickupPointId?: string): Promise<Order> {
  const { data } = await http.post<Order>('/orders/checkout', pickupPointId ? { pickupPointId } : {});
  return data;
}

export async function payOrder(
  orderId: string,
  method: PaymentMethod,
  simulate: 'approve' | 'decline',
): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${orderId}/pay`, { method, simulate });
  return data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${orderId}/cancel`);
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>('/orders');
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${id}`);
  return data;
}
