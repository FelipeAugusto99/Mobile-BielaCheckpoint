import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { PressableScale } from '@/motion/PressableScale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { StatusPill } from '@/components/StatusPill';
import { ErrorState, LoadingState } from '@/components/StateView';
import { useCancelOrder, useOrder, usePayOrder } from '@/hooks/useOrders';
import { errorMessage, isAppError } from '@/services/errors';
import { formatBRL, formatDate } from '@/utils/format';
import { colors, fonts, radius } from '@/theme';
import type { Order, PaymentMethod } from '@/types/api';

const METHODS: { value: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'PIX', label: 'Pix', icon: 'flash-outline' },
  { value: 'CREDIT_CARD', label: 'Cartão', icon: 'card-outline' },
  { value: 'BOLETO', label: 'Boleto', icon: 'barcode-outline' },
];

function wasDeclined(order: Order, askedToDecline: boolean): boolean {
  if (order.status === 'PAID') return false;
  const paymentStatus = order.payment?.status ?? '';
  return askedToDecline || /DECLIN|REFUS|FAIL/i.test(paymentStatus);
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ?? '';
  const router = useRouter();
  const order = useOrder(orderId);
  const pay = usePayOrder(orderId);
  const cancel = useCancelOrder(orderId);

  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [simulateDecline, setSimulateDecline] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (order.isPending) return <LoadingState label="Abrindo o pedido…" />;
  if (order.isError) {
    return <ErrorState message={errorMessage(order.error)} onRetry={() => void order.refetch()} />;
  }

  const data = order.data;
  const pending = data.status === 'PENDING';
  const justPaid = data.status === 'PAID';

  function handlePay() {
    setDeclined(false);
    const asked = simulateDecline;
    pay.mutate(
      { method, simulate: asked ? 'decline' : 'approve' },
      {
        // A API pode responder 200 com o pedido ainda PENDING ou um erro de recusa.
        onSuccess: (updated) => setDeclined(wasDeclined(updated, asked)),
        onError: (error) => {
          if (isAppError(error) && (error.status === 402 || /DECLIN/i.test(error.code))) {
            setDeclined(true);
          }
        },
      },
    );
  }

  const declinedByError =
    isAppError(pay.error) && (pay.error.status === 402 || /DECLIN/i.test(pay.error.code));
  const showDeclined = declined || declinedByError;
  const genericPayError = pay.isError && !declinedByError ? pay.error : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Pedido {data.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.date}>{formatDate(data.createdAt)}</Text>
        </View>
        <StatusPill status={data.status} />
      </View>

      <View style={styles.card}>
        {data.items.map((line) => (
          <View key={line.variantId} style={styles.line}>
            <View style={styles.lineInfo}>
              <Text style={styles.lineName}>{line.productName}</Text>
              <Text style={styles.lineMeta}>
                {line.quantity} × {formatBRL(line.unitPrice)}
                {line.variantName ? ` · ${line.variantName}` : ''}
              </Text>
            </View>
            <Text style={styles.lineTotal}>{formatBRL(line.subtotal)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{formatBRL(data.total)}</Text>
        </View>
      </View>

      {data.pickup ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RETIRADA</Text>
          <Text style={styles.lineName}>{data.pickup.name}</Text>
          {data.pickup.hours ? <Text style={styles.lineMeta}>{data.pickup.hours}</Text> : null}
        </View>
      ) : null}

      {justPaid ? (
        <Notice tone="success">Pagamento confirmado. Suas peças já estão separadas pra você.</Notice>
      ) : null}

      {showDeclined ? (
        <Notice tone="error">
          O pagamento foi recusado e o pedido continua aguardando. Nada foi cobrado. Tente outro
          método de pagamento ou refaça com o mesmo.
        </Notice>
      ) : null}
      {genericPayError ? <Notice tone="error">{errorMessage(genericPayError)}</Notice> : null}
      {cancel.isError ? <Notice tone="error">{errorMessage(cancel.error)}</Notice> : null}

      {pending ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>COMO VOCÊ QUER PAGAR?</Text>
          <View style={styles.methods}>
            {METHODS.map((item) => {
              const active = item.value === method;
              return (
                <PressableScale
                  key={item.value}
                  onPress={() => setMethod(item.value)}
                  style={[styles.method, active && styles.methodActive]}
                >
                  <Ionicons name={item.icon} size={22} color={active ? '#FFFFFF' : colors.primary} />
                  <Text style={[styles.methodText, active && styles.methodTextActive]}>
                    {item.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          <View style={styles.testRow}>
            <View style={styles.testText}>
              <Text style={styles.testTitle}>Modo teste: simular recusa</Text>
              <Text style={styles.testHint}>Para ver como o app trata um pagamento recusado.</Text>
            </View>
            <Switch
              value={simulateDecline}
              onValueChange={setSimulateDecline}
              trackColor={{ true: colors.accent, false: colors.border }}
            />
          </View>

          <Button
            label={`Pagar ${formatBRL(data.total)}`}
            variant="accent"
            onPress={handlePay}
            loading={pay.isPending}
          />
          <Button
            label="Cancelar pedido"
            variant="outline"
            onPress={() => cancel.mutate()}
            loading={cancel.isPending}
            disabled={pay.isPending}
          />
        </View>
      ) : null}

      <Button label="Voltar para a vitrine" variant="outline" onPress={() => router.navigate('/')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { gap: 2 },
  title: { fontFamily: fonts.title, fontSize: 22, color: colors.ink },
  date: { fontSize: 14, color: colors.muted },
  card: {
    padding: 14,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  line: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  lineInfo: { flex: 1, gap: 2 },
  lineName: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  lineMeta: { fontSize: 13, color: colors.muted },
  lineTotal: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  totalLabel: { fontSize: 16, color: colors.muted },
  total: { fontFamily: fonts.title, fontSize: 24, color: colors.accent },
  sectionTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary, letterSpacing: 1 },
  methods: { flexDirection: 'row', gap: 8 },
  method: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  methodActive: { backgroundColor: colors.primary },
  methodText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  methodTextActive: { color: '#FFFFFF' },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testText: { flex: 1, gap: 2 },
  testTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  testHint: { fontSize: 12, color: colors.muted },
});
