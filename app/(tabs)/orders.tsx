import { FlatList, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/motion/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { useOrders } from '@/hooks/useOrders';
import { errorMessage } from '@/services/errors';
import { formatBRL, formatDate } from '@/utils/format';
import { colors, fonts, radius } from '@/theme';

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useOrders();

  function renderBody() {
    if (orders.isPending) return <LoadingState label="Buscando seus pedidos…" />;
    if (orders.isError) {
      return <ErrorState message={errorMessage(orders.error)} onRetry={() => void orders.refetch()} />;
    }
    if (orders.data.length === 0) {
      return (
        <EmptyState
          icon="receipt-outline"
          title="Nenhum pedido ainda"
          message="Quando você fechar uma compra, ela aparece aqui com o status."
          actionLabel="Ver a vitrine"
          onAction={() => router.navigate('/')}
        />
      );
    }
    return (
      <FlatList
        data={orders.data}
        keyExtractor={(order) => order.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshing={orders.isRefetching}
        onRefresh={() => void orders.refetch()}
        renderItem={({ item }) => {
          const units = item.items.reduce((sum, line) => sum + line.quantity, 0);
          return (
            <PressableScale
              style={styles.card}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id } })}
            >
              <View style={styles.top}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <StatusPill status={item.status} />
              </View>
              <Text style={styles.summary}>
                {units} {units === 1 ? 'peça' : 'peças'} · pedido {item.id.slice(-6).toUpperCase()}
              </Text>
              <Text style={styles.total}>{formatBRL(item.total)}</Text>
            </PressableScale>
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Pedidos" subtitle="Seu histórico de compras." />
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 32 },
  sep: { height: 10 },
  card: {
    padding: 14,
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: fonts.medium, color: colors.muted, fontSize: 14 },
  summary: { fontSize: 15, color: colors.ink },
  total: { fontFamily: fonts.title, fontSize: 20, color: colors.accent },
});
