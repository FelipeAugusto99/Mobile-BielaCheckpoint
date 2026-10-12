import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { EmptyState, ErrorState } from '@/components/StateView';
import { PressableScale } from '@/motion/PressableScale';
import { ProductSkeletonList } from '@/motion/Skeleton';
import { useListMotion } from '@/motion/useMotion';
import { ProductCard } from '@/components/ProductCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useDebounce } from '@/hooks/useDebounce';
import { errorMessage } from '@/services/errors';
import { colors, fonts, radius } from '@/theme';

export default function CatalogScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const search = useDebounce(text.trim(), 400);

  const products = useProducts(search, categoryId);
  const categories = useCategories();
  const { entering } = useListMotion();

  const items = products.data?.pages.flatMap((page) => page.data) ?? [];
  const filtering = search.length > 0 || categoryId !== undefined;

  function renderBody() {
    if (products.isPending) return <ProductSkeletonList />;
    if (products.isError && items.length === 0) {
      return <ErrorState message={errorMessage(products.error)} onRetry={() => void products.refetch()} />;
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title={filtering ? 'Nada com esse nome' : 'Vitrine vazia'}
          message={
            filtering
              ? 'Não achamos peça para essa busca. Tente outro termo ou limpe os filtros.'
              : 'Ainda não há peças cadastradas na loja.'
          }
          actionLabel={filtering ? 'Limpar busca' : undefined}
          onAction={
            filtering
              ? () => {
                  setText('');
                  setCategoryId(undefined);
                }
              : undefined
          }
        />
      );
    }
    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item, index }) => (
          // atraso por posição, com teto (tokens.stagger.maxDelay): o 40º item não espera segundos
          <Animated.View entering={entering(index)}>
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
            />
          </Animated.View>
        )}
        onEndReached={() => {
          if (products.hasNextPage && !products.isFetchingNextPage) void products.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshing={products.isRefetching && !products.isFetchingNextPage}
        onRefresh={() => void products.refetch()}
        ListFooterComponent={
          products.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : products.isFetchNextPageError ? (
            <Pressable onPress={() => void products.fetchNextPage()}>
              <Text style={styles.retry}>Não deu pra carregar mais. Toque para tentar de novo.</Text>
            </Pressable>
          ) : null
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Vitrine" subtitle="Tudo pra sua bike rodar redonda." />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Buscar corrente, pneu, freio…"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {text.length > 0 ? (
          <Pressable onPress={() => setText('')} accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {categories.data && categories.data.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories.data}
          keyExtractor={(c) => c.id}
          style={styles.chipsRow}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const active = item.id === categoryId;
            return (
              <PressableScale
                onPress={() => setCategoryId(active ? undefined : item.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.name}</Text>
              </PressableScale>
            );
          }}
        />
      ) : null}
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    minHeight: 48,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  chipsRow: { flexGrow: 0, marginTop: 12 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  chipTextActive: { color: '#FFFFFF' },
  list: { padding: 16, paddingBottom: 32 },
  sep: { height: 10 },
  footer: { marginVertical: 16 },
  retry: { textAlign: 'center', color: colors.danger, padding: 16 },
});
