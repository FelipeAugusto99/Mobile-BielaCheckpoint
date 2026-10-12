import { Linking, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePickupSelection } from '@/checkout/PickupSelection';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { PickupMap } from '@/components/PickupMap';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { usePickupPoints, useStoreInfo } from '@/hooks/usePickup';
import { useUserLocation, type LocationState } from '@/hooks/useUserLocation';
import { PressableScale } from '@/motion/PressableScale';
import { useListMotion } from '@/motion/useMotion';
import { errorMessage } from '@/services/errors';
import { colors, fonts, radius } from '@/theme';
import type { PickupPoint } from '@/types/api';
import { formatDistance } from '@/utils/format';

function LocationBanner({ state, onRetry }: { state: LocationState; onRetry: () => void }) {
  switch (state.status) {
    case 'ready':
      return <Notice tone="success">Pontos ordenados do mais perto para o mais longe de você.</Notice>;

    case 'loading':
      return (
        <View style={styles.locating}>
          <Ionicons name="locate" size={18} color={colors.primary} />
          <Text style={styles.locatingText}>Obtendo sua posição…</Text>
        </View>
      );

    case 'denied':
      return (
        <View style={styles.bannerBox}>
          <Notice tone="warn">
            Sem acesso à sua localização, mostramos os pontos na ordem de cadastro, sem saber qual
            fica mais perto de você. Você ainda pode escolher qualquer ponto.
          </Notice>
          {state.canAskAgain ? (
            <Button label="Tentar de novo" variant="outline" onPress={onRetry} />
          ) : (
            <Button label="Abrir ajustes" variant="outline" onPress={() => void Linking.openSettings()} />
          )}
        </View>
      );

    case 'unavailable':
      return (
        <View style={styles.bannerBox}>
          <Notice tone="warn">
            {state.reason === 'services-off'
              ? 'O GPS do aparelho está desligado, então não sabemos onde você está. Os pontos aparecem na ordem de cadastro.'
              : 'Não conseguimos obter sua posição agora (sem sinal de GPS). Os pontos aparecem na ordem de cadastro.'}
          </Notice>
          <Button label="Tentar de novo" variant="outline" onPress={onRetry} />
        </View>
      );

    case 'idle':
      return (
        <View style={styles.bannerBox}>
          <Text style={styles.hint}>
            Quer ver qual ponto fica mais perto? Usamos sua localização só para ordenar a lista.
          </Text>
          <Button label="Usar minha localização" variant="outline" onPress={onRetry} />
        </View>
      );
  }
}

export default function PickupScreen() {
  const router = useRouter();
  const { selected, select } = usePickupSelection();
  const location = useUserLocation();
  const { entering } = useListMotion();

  const coords = location.state.status === 'ready' ? location.state.coords : null;
  const points = usePickupPoints(coords);
  const store = useStoreInfo();

  function renderBody() {
    if (points.isPending) return <LoadingState label="Buscando pontos de retirada…" />;
    if (points.isError) {
      return <ErrorState message={errorMessage(points.error)} onRetry={() => void points.refetch()} />;
    }
    if (points.data.length === 0) {
      return (
        <EmptyState
          icon="storefront-outline"
          title="Nenhum ponto de retirada"
          message="A loja ainda não cadastrou pontos de retirada. Você pode receber em casa."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      );
    }
    return (
      <View style={styles.list}>
        {points.data.map((point, index) => (
          <Animated.View key={point.id} entering={entering(index)}>
            <PointRow
              point={point}
              active={selected?.id === point.id}
              onPress={() => select(point)}
            />
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Animated.ScrollView contentContainerStyle={styles.content}>
        <LocationBanner state={location.state} onRetry={() => void location.request()} />
        {points.data && points.data.length > 0 ? (
          <PickupMap
            points={points.data}
            store={store.data}
            user={coords}
            selectedId={selected?.id ?? null}
            onSelect={select}
          />
        ) : null}
        {renderBody()}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <Button
          label={selected ? `Retirar em ${selected.name}` : 'Escolha um ponto'}
          variant="accent"
          disabled={!selected}
          onPress={() => router.back()}
        />
        {selected ? (
          <Button
            label="Prefiro receber em casa"
            variant="outline"
            onPress={() => {
              select(null);
              router.back();
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function PointRow({
  point,
  active,
  onPress,
}: {
  point: PickupPoint;
  active: boolean;
  onPress: () => void;
}) {
  const distance = formatDistance(point.distanceKm);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.row, active && styles.rowActive]}
    >
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{point.name}</Text>
        {point.addressLine ? <Text style={styles.rowMeta}>{point.addressLine}</Text> : null}
        {point.hours ? <Text style={styles.rowMeta}>{point.hours}</Text> : null}
      </View>
      {distance ? (
        <View style={styles.distance}>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, flexGrow: 1 },
  list: { gap: 10 },
  bannerBox: { gap: 10 },
  hint: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  locating: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locatingText: { fontSize: 14, color: colors.muted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontFamily: fonts.title, fontSize: 16, color: colors.ink },
  rowMeta: { fontSize: 13, color: colors.muted },
  distance: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  distanceText: { fontFamily: fonts.title, fontSize: 13, color: colors.success },
  footer: {
    padding: 16,
    gap: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
