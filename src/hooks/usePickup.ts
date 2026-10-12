import { useQuery } from '@tanstack/react-query';
import { getStoreInfo, listPickupPoints, type Coords } from '@/services/pickupService';
import { queryKeys } from '@/query/keys';

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Com posição a API ordena por distância; sem posição, ordem de cadastro. */
export function usePickupPoints(coords: Coords | null) {
  return useQuery({
    queryKey: queryKeys.pickupPoints(
      coords ? round(coords.latitude) : null,
      coords ? round(coords.longitude) : null,
    ),
    queryFn: () => listPickupPoints(coords),
  });
}

export function useStoreInfo() {
  return useQuery({
    queryKey: queryKeys.storeInfo,
    queryFn: getStoreInfo,
    staleTime: 10 * 60_000,
  });
}
