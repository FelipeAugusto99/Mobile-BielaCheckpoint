import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/motion/PressableScale';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/theme';
import { coverUrl, formatBRL } from '@/utils/format';
import type { ProductSummary } from '@/types/api';

interface Props {
  product: ProductSummary;
  onPress: () => void;
}

function categoryName(product: ProductSummary): string | undefined {
  const { category } = product;
  if (!category) return undefined;
  return typeof category === 'string' ? category : category.name;
}

// Card "ficha de peça": foto à esquerda, etiqueta de preço em laranja.
export function ProductCard({ product, onPress }: Props) {
  const image = coverUrl(product);
  const price = product.priceFrom ?? product.price;
  const category = categoryName(product);

  return (
    <PressableScale onPress={onPress} style={styles.card}>
      <View style={styles.photo}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
        ) : (
          <Ionicons name="bicycle" size={34} color={colors.muted} />
        )}
      </View>
      <View style={styles.info}>
        {category ? <Text style={styles.category}>{category.toUpperCase()}</Text> : null}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {product.priceFrom != null ? 'a partir de ' : ''}
            {formatBRL(price)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 4 },
  category: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary, letterSpacing: 1 },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.ink, lineHeight: 20 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  tagText: { fontFamily: fonts.title, fontSize: 14, color: colors.accent },
});
