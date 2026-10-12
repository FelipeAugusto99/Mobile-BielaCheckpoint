import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart,
  getCart,
  removeCartItem,
  setCartQuantity,
} from '@/services/cartService';
import { queryKeys } from '@/query/keys';
import type { Cart } from '@/types/api';

export function useCart() {
  return useQuery({ queryKey: queryKeys.cart, queryFn: getCart });
}

// Dinheiro e estoque não se adivinham: sem atualização otimista.
// Cada mutation espera o servidor e grava o carrinho que ele devolveu.
function useCartMutation<TVars>(fn: (vars: TVars) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
}

export function useAddToCart() {
  return useCartMutation((vars: { variantId: string; quantity: number }) =>
    addToCart(vars.variantId, vars.quantity),
  );
}

export function useSetCartQuantity() {
  return useCartMutation((vars: { variantId: string; quantity: number }) =>
    setCartQuantity(vars.variantId, vars.quantity),
  );
}

export function useRemoveCartItem() {
  return useCartMutation((variantId: string) => removeCartItem(variantId));
}
