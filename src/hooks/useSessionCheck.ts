import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/authService';
import { queryKeys } from '@/query/keys';

/**
 * Valida o token na abertura com GET /auth/me.
 * Se o token for inválido, a API responde 401 e o interceptor derruba a sessão.
 * Sem rede, a sessão guardada continua valendo (os favoritos funcionam offline).
 */
export function useSessionCheck(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
