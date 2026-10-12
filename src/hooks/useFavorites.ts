import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFavorite, listFavorites, removeFavorite } from '@/services/favoritesService';
import { queryKeys } from '@/query/keys';

export function useFavorites() {
  return useQuery({ queryKey: queryKeys.favorites, queryFn: listFavorites });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}

/** Remove e invalida a query key: a lista atualiza sozinha. */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}
