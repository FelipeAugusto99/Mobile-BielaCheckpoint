import type { Category, Page, ProductDetail, ProductSummary } from '@/types/api';
import { toList, isRaw } from '@/utils/raw';
import { http } from './http';

export const PAGE_SIZE = 10;

export interface ProductsParams {
  search: string;
  categoryId?: string;
  page: number;
}

export async function listProducts(params: ProductsParams): Promise<Page<ProductSummary>> {
  const { data } = await http.get<Page<ProductSummary>>('/products', {
    params: {
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
      page: params.page,
      pageSize: PAGE_SIZE,
    },
  });
  return data;
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const { data } = await http.get<ProductDetail>(`/products/${id}`);
  return data;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await http.get<unknown>('/categories');
  return toList(data).filter(isRaw).flatMap((item) =>
    typeof item.id === 'string' && typeof item.name === 'string'
      ? [{ id: item.id, name: item.name }]
      : [],
  );
}
