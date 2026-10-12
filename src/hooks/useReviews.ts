import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  fetchCanReview,
  listReviews,
  uploadPhoto,
} from '@/services/reviewService';
import { queryKeys } from '@/query/keys';
import type { PickedPhoto } from '@/types/api';

export function useReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews(productId),
    queryFn: () => listReviews(productId),
  });
}

/** Pergunta ANTES de mostrar o formulário, em vez de descobrir no POST. */
export function useCanReview(productId: string) {
  return useQuery({
    queryKey: queryKeys.canReview(productId),
    queryFn: () => fetchCanReview(productId),
  });
}

interface SubmitReview {
  rating: number;
  comment: string;
  photos: PickedPhoto[];
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SubmitReview) => {
      // Sobe as fotos uma a uma; a avaliação referencia os ids, não as URLs.
      const mediaIds: string[] = [];
      for (const photo of input.photos) {
        mediaIds.push(await uploadPhoto(photo));
      }
      await createReview({
        productId,
        rating: input.rating,
        comment: input.comment,
        mediaIds,
      });
    },
    // RF-41: lista, média (vem do produto) e permissão se atualizam sozinhas.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.canReview(productId) }),
      ]);
    },
  });
}
