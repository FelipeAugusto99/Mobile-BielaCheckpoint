import { useNetInfo } from '@react-native-community/netinfo';

/** true quando o aparelho está sem conexão (modo avião, sem rede). */
export function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected === false || isInternetReachable === false;
}
