import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, checkout, getOrder, listOrders, payOrder } from '@/services/orderService';
import { queryKeys } from '@/query/keys';
import type { PaymentMethod } from '@/types/api';

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: listOrders });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => getOrder(id),
    enabled: id.length > 0,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pickupPointId?: string) => checkout(pickupPointId),
    onSuccess: async (order) => {
      queryClient.setQueryData(queryKeys.order(order.id), order);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function usePayOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { method: PaymentMethod; simulate: 'approve' | 'decline' }) =>
      payOrder(orderId, vars.method, vars.simulate),
    onSuccess: async (order) => {
      queryClient.setQueryData(queryKeys.order(orderId), order);
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: async (order) => {
      queryClient.setQueryData(queryKeys.order(orderId), order);
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}
