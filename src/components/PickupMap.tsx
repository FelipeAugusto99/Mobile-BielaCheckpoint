import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useReducedMotion } from 'react-native-reanimated';
import { colors, fonts, radius } from '@/theme';
import type { PickupPoint, StoreInfo } from '@/types/api';
import type { Coords } from '@/services/pickupService';

interface Props {
  points: PickupPoint[];
  store: StoreInfo | undefined;
  user: Coords | null;
  selectedId: string | null;
  onSelect: (point: PickupPoint) => void;
}

interface Located extends PickupPoint {
  latitude: number;
  longitude: number;
}

function hasCoords(point: PickupPoint): point is Located {
  return point.latitude !== undefined && point.longitude !== undefined;
}

export function PickupMap({ points, store, user, selectedId, onSelect }: Props) {
  const mapRef = useRef<MapView>(null);
  const reducedMotion = useReducedMotion();

  const located = useMemo(() => points.filter(hasCoords), [points]);
  const storeCoords: Coords | null =
    store?.latitude !== undefined && store.longitude !== undefined
      ? { latitude: store.latitude, longitude: store.longitude }
      : null;

  const allCoords = useMemo(() => {
    const list: Coords[] = located.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
    if (storeCoords) list.push(storeCoords);
    if (user) list.push(user);
    return list;
  }, [located, storeCoords, user]);

  // Enquadra todos os marcadores. Sob "Reduzir movimento" o mapa pula direto, sem voar.
  useEffect(() => {
    if (allCoords.length === 0) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(allCoords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: !reducedMotion,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [allCoords, reducedMotion]);

  if (allCoords.length === 0) {
    return (
      <View style={[styles.map, styles.fallback]}>
        <Text style={styles.fallbackText}>
          Os pontos ainda não têm coordenadas cadastradas, então não dá para mostrar o mapa.
          A lista abaixo continua valendo.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      showsUserLocation={user !== null}
      toolbarEnabled={false}
      initialRegion={{
        latitude: allCoords[0].latitude,
        longitude: allCoords[0].longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }}
    >
      {storeCoords ? (
        <Marker
          coordinate={storeCoords}
          title={store?.name ?? 'Nossa loja'}
          description="Loja Biela"
          pinColor={colors.primary}
        />
      ) : null}
      {located.map((point) => (
        <Marker
          key={point.id}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          title={point.name}
          description={point.addressLine}
          pinColor={point.id === selectedId ? '#B84A14' : colors.accent}
          onPress={() => onSelect(point)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 240, borderRadius: radius.lg, overflow: 'hidden' },
  fallback: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackText: { fontFamily: fonts.medium, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
