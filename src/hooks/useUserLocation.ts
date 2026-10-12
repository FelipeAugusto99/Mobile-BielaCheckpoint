import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coords } from '@/services/pickupService';

/**
 * Os três desfechos da permissão (RF-43) mais os estados de transição:
 * - idle:        ainda não pedimos (nenhum prompt foi mostrado)
 * - loading:     pedindo/obtendo a posição
 * - ready:       concedida, com posição
 * - denied:      negada (canAskAgain=false → só pelos ajustes do sistema)
 * - unavailable: concedida, mas sem posição (GPS desligado ou sem sinal)
 */
export type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; coords: Coords }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; reason: 'services-off' | 'no-fix' };

const FIX_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  /** Pede a permissão (se preciso) e a posição. Sempre termina em um estado final. */
  const request = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState({ status: 'denied', canAskAgain: permission.canAskAgain });
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        setState({ status: 'unavailable', reason: 'services-off' });
        return;
      }
      const position =
        (await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          FIX_TIMEOUT_MS,
        )) ?? (await Location.getLastKnownPositionAsync());
      if (!position) {
        setState({ status: 'unavailable', reason: 'no-fix' });
        return;
      }
      setState({
        status: 'ready',
        coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      });
    } catch {
      setState({ status: 'unavailable', reason: 'no-fix' });
    }
  }, []);

  // Se a permissão já estava concedida, usa direto (sem mostrar prompt nenhum).
  // Se nunca foi pedida, espera o toque do usuário: o prompt aparece quando ele entende o ganho.
  useEffect(() => {
    let active = true;
    Location.getForegroundPermissionsAsync().then((permission) => {
      if (!active) return;
      if (permission.granted) void request();
      else if (permission.status === 'denied' && !permission.canAskAgain) {
        setState({ status: 'denied', canAskAgain: false });
      }
    });
    return () => {
      active = false;
    };
  }, [request]);

  return { state, request };
}
