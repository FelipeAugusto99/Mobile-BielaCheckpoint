import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePickupSelection } from '@/checkout/PickupSelection';
import { Button } from '@/components/Button';
import { PressableScale } from '@/motion/PressableScale';
import { useListMotion } from '@/motion/useMotion';
import { Notice } from '@/components/Notice';
import { QuantityStepper } from '@/components/QuantityStepper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { useCart, useRemoveCartItem, useSetCartQuantity } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrders';
import { errorMessage } from '@/services/errors';
import { formatBRL } from '@/utils/format';
import { colors, fonts, radius } from '@/theme';

export default function CartScreen() {
  const router = useRouter();
  const cart = useCart();
  const setQuantity = useSetCartQuantity();
  const removeItem = useRemoveCartItem();
  const checkout = useCheckout();
  const pickup = usePickupSelection();
  const { entering, exiting, layout } = useListMotion();

  const busy = setQuantity.isPending || removeItem.isPending;
  const mutationError = setQuantity.error ?? removeItem.error;

  function handleCheckout() {
    checkout.mutate(pickup.selected?.id, {
      onSuccess: (order) => {
        pickup.select(null);
        router.push({ pathname: '/order/[id]', params: { id: order.id } });
      },
    });
  }

  function renderBody() {
    if (cart.isPending) return <LoadingState label="Separando sua sacola…" />;
    if (cart.isError) {
      return <ErrorState message={errorMessage(cart.error)} onRetry={() => void cart.refetch()} />;
    }
    const { items, total } = cart.data;
    if (items.length === 0) {
      return (
        <EmptyState
          icon="bag-outline"
          title="Sua sacola está vazia"
          message="Escolha uma peça na vitrine e ela aparece aqui."
          actionLabel="Ir para a vitrine"
          onAction={() => router.navigate('/')}
        />
      );
    }
    return (
      <>
        <Animated.FlatList
          itemLayoutAnimation={layout}
          data={items}
          keyExtractor={(item) => item.variantId}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item, index }) => (
            <Animated.View style={styles.row} entering={entering(index)} exiting={exiting}>
              <View style={styles.rowTop}>
                <View style={styles.rowInfo}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.sku}>
                    {item.sku} · {formatBRL(item.unitPrice)} cada
                  </Text>
                </View>
                <PressableScale
                  accessibilityLabel="Remover da sacola"
                  onPress={() => removeItem.mutate(item.variantId)}
                  disabled={busy}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </PressableScale>
              </View>
              <View style={styles.rowBottom}>
                <QuantityStepper
                  value={item.quantity}
                  disabled={busy}
                  onChange={(quantity) =>
                    setQuantity.mutate({ variantId: item.variantId, quantity })
                  }
                />
                <Text style={styles.subtotal}>{formatBRL(item.subtotal)}</Text>
              </View>
            </Animated.View>
          )}
        />
        <View style={styles.footer}>
          {mutationError ? <Notice tone="error">{errorMessage(mutationError)}</Notice> : null}
          {checkout.isError ? <Notice tone="error">{errorMessage(checkout.error)}</Notice> : null}
          <PressableScale
            accessibilityRole="button"
            onPress={() => router.push('/pickup')}
            style={styles.receive}
          >
            <Ionicons
              name={pickup.selected ? 'storefront' : 'home-outline'}
              size={22}
              color={colors.primary}
            />
            <View style={styles.receiveInfo}>
              <Text style={styles.receiveTitle}>
                {pickup.selected ? `Retirar em ${pickup.selected.name}` : 'Receber em casa'}
              </Text>
              <Text style={styles.receiveHint}>
                {pickup.selected ? 'Toque para trocar o ponto' : 'Ou escolha um ponto de retirada'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </PressableScale>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{formatBRL(total)}</Text>
          </View>
          <Button
            label="Fechar pedido"
            variant="accent"
            onPress={handleCheckout}
            loading={checkout.isPending}
            disabled={busy}
          />
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Sacola" subtitle="Confira antes de fechar o pedido." />
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16 },
  sep: { height: 10 },
  row: {
    padding: 14,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', gap: 12 },
  rowInfo: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.ink },
  sku: { fontSize: 13, color: colors.muted },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtotal: { fontFamily: fonts.title, fontSize: 17, color: colors.ink },
  footer: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  receive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  receiveInfo: { flex: 1, gap: 2 },
  receiveTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  receiveHint: { fontSize: 12, color: colors.muted },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 16, color: colors.muted },
  total: { fontFamily: fonts.title, fontSize: 26, color: colors.accent },
});
