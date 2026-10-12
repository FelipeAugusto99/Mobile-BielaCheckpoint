import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { NotificationCard } from '@/components/NotificationCard';
import { useNotificationPermission } from '@/notifications/useNotificationPermission';
import { ReviewsSection } from '@/components/ReviewsSection';
import { Stars } from '@/components/Stars';
import { FavoriteButton } from '@/motion/FavoriteButton';
import { FlashMessage } from '@/motion/FlashMessage';
import { PressableScale } from '@/motion/PressableScale';
import { useFlash } from '@/motion/useFlash';
import { Notice } from '@/components/Notice';
import { QuantityStepper } from '@/components/QuantityStepper';
import { ErrorState, LoadingState } from '@/components/StateView';
import { useAddToCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useCatalog';
import { useAddFavorite, useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { errorMessage } from '@/services/errors';
import { colors, fonts, radius } from '@/theme';
import { coverUrl, formatBRL, ratingOf, stockOf, variantLabel } from '@/utils/format';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = useProduct(id ?? '');
  const favorites = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddToCart();
  const notifications = useNotificationPermission();

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const flash = useFlash();

  if (product.isPending) return <LoadingState label="Abrindo a peça…" />;
  if (product.isError) {
    return <ErrorState message={errorMessage(product.error)} onRetry={() => void product.refetch()} />;
  }

  const item = product.data;
  // A unidade vendável é a variante: preço, estoque e SKU moram nela.
  const variants = item.variants ?? [];
  const variant = variants.find((v) => v.id === selectedId) ?? variants[0];
  const image = coverUrl(item);
  // Média e contagem já vêm no produto: nenhuma requisição extra (RF-35).
  const rating = ratingOf(item);
  const stock = variant ? stockOf(variant) : undefined;
  const soldOut = stock !== undefined && stock <= 0;
  const isFavorite = variant
    ? (favorites.data ?? []).some((fav) => fav.variantId === variant.id)
    : false;
  const favoriteBusy = addFavorite.isPending || removeFavorite.isPending;

  function toggleFavorite() {
    if (!variant) return;
    if (isFavorite) {
      removeFavorite.mutate(variant.id, {
        onSuccess: () => flash.show('Tirada dos favoritos'),
      });
    } else {
      addFavorite.mutate(variant.id, {
        onSuccess: () => flash.show('Guardada nos favoritos'),
      });
    }
  }

  function handleAdd() {
    if (!variant) return;
    setAdded(false);
    addToCart.mutate(
      { variantId: variant.id, quantity },
      {
        onSuccess: () => {
          setAdded(true);
          flash.show('Peça na sacola');
        },
      },
    );
  }

  const actionError = addToCart.error ?? addFavorite.error ?? removeFavorite.error;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.photo}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons name="bicycle" size={64} color={colors.muted} />
        )}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.name}>{item.name}</Text>
        <FavoriteButton active={isFavorite} onPress={toggleFavorite} disabled={favoriteBusy || !variant} />
      </View>
      {flash.message ? <FlashMessage message={flash.message} /> : null}
      {/* Momento certo (RF-56): só oferece avisos depois de a pessoa favoritar uma peça. */}
      {isFavorite && notifications.state.status === 'undetermined' ? <NotificationCard /> : null}

      <View style={styles.ratingRow}>
        {rating && rating.count > 0 ? (
          <>
            <Stars value={rating.average} size={18} />
            <Text style={styles.ratingText}>
              {rating.average.toFixed(1).replace('.', ',')} · {rating.count}{' '}
              {rating.count === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </>
        ) : (
          <Text style={styles.ratingText}>Ainda sem avaliações</Text>
        )}
      </View>

      <Text style={styles.price}>{formatBRL(variant?.price ?? item.priceFrom)}</Text>

      {variants.length > 1 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Escolha a versão</Text>
          <View style={styles.chips}>
            {variants.map((v) => {
              const active = v.id === variant?.id;
              return (
                <PressableScale
                  key={v.id}
                  onPress={() => {
                    setSelectedId(v.id);
                    setQuantity(1);
                    setAdded(false);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {variantLabel(v)}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      ) : null}

      {item.description ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Sobre a peça</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ) : null}

      {variant ? <Text style={styles.sku}>Código {variant.sku}</Text> : null}

      <View style={styles.buyRow}>
        <QuantityStepper
          value={quantity}
          max={stock !== undefined && stock > 0 ? stock : 99}
          disabled={soldOut}
          onChange={setQuantity}
        />
        <Text style={styles.stock}>
          {soldOut ? 'Esgotada' : stock !== undefined ? `${stock} em estoque` : ''}
        </Text>
      </View>

      {actionError ? <Notice tone="error">{errorMessage(actionError)}</Notice> : null}
      {added ? <Notice tone="success">Peça na sacola. Bora fechar o pedido?</Notice> : null}

      <Button
        label={soldOut ? 'Indisponível' : 'Colocar na sacola'}
        variant="accent"
        onPress={handleAdd}
        loading={addToCart.isPending}
        disabled={soldOut || !variant}
      />
      {added ? (
        <Button label="Ir para a sacola" variant="outline" onPress={() => router.navigate('/cart')} />
      ) : null}

      <ReviewsSection productId={item.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  photo: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1, fontFamily: fonts.title, fontSize: 24, color: colors.ink, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, color: colors.muted },
  price: { fontFamily: fonts.title, fontSize: 30, color: colors.accent },
  block: { gap: 8 },
  blockTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary, letterSpacing: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.medium, color: colors.primary, fontSize: 14 },
  chipTextActive: { color: '#FFFFFF' },
  description: { fontSize: 15, lineHeight: 22, color: colors.ink },
  sku: { fontSize: 13, color: colors.muted },
  buyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stock: { fontSize: 14, color: colors.muted },
});
