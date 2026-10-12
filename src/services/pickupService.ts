import type { PickupPoint, StoreInfo } from '@/types/api';
import { isRaw, num, str, toList, type Raw } from '@/utils/raw';
import { http } from './http';

export interface Coords {
  latitude: number;
  longitude: number;
}

function toPoint(item: Raw): PickupPoint | null {
  const id = str(item, 'id');
  const name = str(item, 'name');
  if (!id || !name) return null;

  const coordinate = isRaw(item.coordinate) ? item.coordinate : undefined;
  const address = isRaw(item.address) ? item.address : item;

  const street = [str(address, 'street'), str(address, 'number')].filter(Boolean).join(', ');
  const cityState = [str(address, 'city'), str(address, 'state')].filter(Boolean).join(' - ');
  const addressLine = [street, str(address, 'district'), cityState].filter(Boolean).join(' · ');

  return {
    id,
    name,
    latitude: num(item, 'latitude') ?? num(coordinate, 'latitude'),
    longitude: num(item, 'longitude') ?? num(coordinate, 'longitude'),
    addressLine: addressLine || undefined,
    hours: str(item, 'hours'),
    distanceKm: num(item, 'distanceKm') ?? null,
  };
}

/** Sem coords a API devolve na ordem de cadastro (esperado, não é bug). */
export async function listPickupPoints(coords: Coords | null): Promise<PickupPoint[]> {
  const { data } = await http.get<unknown>('/pickup-points', {
    params: coords ? { latitude: coords.latitude, longitude: coords.longitude } : undefined,
  });
  return toList(data)
    .filter(isRaw)
    .map(toPoint)
    .filter((point): point is PickupPoint => point !== null);
}

/** Local da loja (origem do mapa), vindo da configuração da loja. */
export async function getStoreInfo(): Promise<StoreInfo> {
  const { data } = await http.get<unknown>('/store/settings');
  const raw: Raw = isRaw(data) ? data : {};
  return {
    name: str(raw, 'storeName'),
    latitude: num(raw, 'latitude'),
    longitude: num(raw, 'longitude'),
  };
}
