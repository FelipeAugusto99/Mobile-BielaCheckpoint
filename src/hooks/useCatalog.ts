import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProduct, listCategories, listProducts } from '@/services/catalogService';
import { queryKeys } from '@/query/keys';

/** Busca e paginação no servidor (?search=&page=&pageSize=). */
export function useProducts(search: string, categoryId?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products(search, categoryId),
    queryFn: ({ pageParam }) => listProducts({ search, categoryId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });
}

/** A chave inclui o id: abrir o item 2 depois do item 1 busca o item 2. */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProduct(id),
    enabled: id.length > 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });
}
