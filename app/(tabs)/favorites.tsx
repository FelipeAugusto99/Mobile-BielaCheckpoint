import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView';
import { Notice } from '@/components/Notice';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { useIsOffline } from '@/hooks/useOnline';
import { PressableScale } from '@/motion/PressableScale';
import { useListMotion } from '@/motion/useMotion';
import { errorMessage } from '@/services/errors';
import { formatBRL } from '@/utils/format';
import { colors, fonts, radius } from '@/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavorites();
  const remove = useRemoveFavorite();
  const offline = useIsOffline();
  const { entering, exiting, layout } = useListMotion();

  const items = favorites.data ?? [];
  // Dados do cache mostrados mesmo com a rede fora: avisa que podem estar velhos.
  const stale = offline || (favorites.isError && items.length > 0);

  function renderBody() {
    if (favorites.isPending && favorites.fetchStatus === 'paused') {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          title="Sem conexão"
          message="Ainda não temos seus favoritos salvos neste aparelho. Volte a ficar online para carregá-los."
        />
      );
    }
    if (favorites.isPending) return <LoadingState label="Buscando seus favoritos…" />;
    if (favorites.isError && items.length === 0) {
      return <ErrorState message={errorMessage(favorites.error)} onRetry={() => void favorites.refetch()} />;
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon="heart-outline"
          title="Nenhum favorito ainda"
          message="Toque no coração de uma peça para guardá-la aqui."
          actionLabel="Ver a vitrine"
          onAction={() => router.navigate('/')}
        />
      );
    }
    return (
      <Animated.FlatList
        itemLayoutAnimation={layout}
        data={items}
        keyExtractor={(item) => item.variantId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshing={favorites.isRefetching}
        onRefresh={() => void favorites.refetch()}
        renderItem={({ item, index }) => (
          <Animated.View entering={entering(index)} exiting={exiting}>
          <PressableScale
            style={styles.row}
            disabled={!item.productId}
            onPress={() =>
              item.productId &&
              router.push({ pathname: '/product/[id]', params: { id: item.productId } })
            }
          >
            <View style={styles.photo}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
              ) : (
                <Ionicons name="bicycle" size={26} color={colors.muted} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              {item.variantName ? <Text style={styles.variant}>{item.variantName}</Text> : null}
              <Text style={styles.price}>{formatBRL(item.price)}</Text>
            </View>
            <PressableScale
              accessibilityLabel="Remover dos favoritos"
              disabled={remove.isPending || offline}
              onPress={() => remove.mutate(item.variantId)}
              hitSlop={10}
              style={[styles.heart, offline && styles.disabled]}
            >
              <Ionicons name="heart-dislike-outline" size={22} color={colors.danger} />
            </PressableScale>
          </PressableScale>
          </Animated.View>
        )}
        ListHeaderComponent={
          remove.isError ? <Notice tone="error">{errorMessage(remove.error)}</Notice> : null
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Favoritos" subtitle="As peças que você quer levar pra casa." />
      {stale ? (
        <View style={styles.banner}>
          <OfflineBanner />
        </View>
      ) : null}
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  banner: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, paddingBottom: 32 },
  sep: { height: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  variant: { fontSize: 13, color: colors.muted },
  price: { fontFamily: fonts.title, fontSize: 15, color: colors.accent },
  heart: { padding: 6 },
  disabled: { opacity: 0.4 },
});
