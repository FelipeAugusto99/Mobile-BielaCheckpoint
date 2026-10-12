import { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCanReview, useCreateReview, useReviews } from '@/hooks/useReviews';
import { FlashMessage } from '@/motion/FlashMessage';
import { PressableScale } from '@/motion/PressableScale';
import { useFlash } from '@/motion/useFlash';
import { useListMotion } from '@/motion/useMotion';
import { errorMessage } from '@/services/errors';
import { colors, fonts, radius } from '@/theme';
import type { CanReview, PickedPhoto, Review } from '@/types/api';
import { formatDate } from '@/utils/format';
import { Button } from './Button';
import { Notice } from './Notice';
import { StarPicker, Stars } from './Stars';
import { TextField } from './TextField';

const MAX_PHOTOS = 3;
const MIN_COMMENT = 5;

/** Cada motivo devolvido pelo can-review ganha um texto próprio (RF-37). */
function explainCannotReview(info: CanReview): { tone: 'warn' | 'success'; text: string } {
  const reason = (info.reason ?? '').toUpperCase();
  if (/UNPAID|NOT_PAID|PENDING|AWAIT/.test(reason)) {
    return {
      tone: 'warn',
      text: 'Seu pedido desta peça ainda não foi pago. Assim que o pagamento for confirmado, a avaliação é liberada.',
    };
  }
  if (/ALREADY|REVIEWED|DUPLICATE|EXIST/.test(reason)) {
    return { tone: 'success', text: 'Você já avaliou esta peça. Obrigado por ajudar quem vem depois!' };
  }
  if (/PURCHAS|BOUGHT|NOT_BUY|NO_ORDER|NOT_ORDER/.test(reason)) {
    return {
      tone: 'warn',
      text: 'Só quem comprou esta peça pode avaliar. Feche um pedido, pague, e a avaliação é liberada.',
    };
  }
  return {
    tone: 'warn',
    text: info.message ?? 'A avaliação desta peça não está disponível para você agora.',
  };
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Stars value={review.rating} />
        <Text style={styles.cardDate}>{formatDate(review.createdAt)}</Text>
      </View>
      {review.title ? <Text style={styles.cardTitle}>{review.title}</Text> : null}
      {review.comment ? <Text style={styles.cardComment}>{review.comment}</Text> : null}
      {review.images.length > 0 ? (
        <View style={styles.photoRow}>
          {review.images.map((img) => (
            <Image key={img.url} source={{ uri: img.url }} style={styles.photo} contentFit="cover" />
          ))}
        </View>
      ) : null}
      <Text style={styles.cardAuthor}>
        {review.isMine ? 'Você' : review.authorName}
        {review.verifiedPurchase ? ' · compra verificada' : ''}
      </Text>
    </View>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const create = useCreateReview(productId);
  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [galleryDenied, setGalleryDenied] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  async function addPhoto() {
    let granted = permission?.granted ?? false;
    if (!granted) {
      const result = await requestPermission();
      granted = result.granted;
    }
    if (!granted) {
      // RF-40: o formulário segue funcionando, só sem foto.
      setGalleryDenied(true);
      return;
    }
    setGalleryDenied(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setPhotos((current) => [
      ...current,
      {
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `avaliacao-${Date.now()}.jpg`,
      },
    ]);
  }

  function handleSubmit() {
    const trimmed = comment.trim();
    const missingRating = rating < 1;
    const shortComment = trimmed.length < MIN_COMMENT;
    setRatingError(missingRating ? 'Escolha uma nota de 1 a 5 estrelas.' : null);
    setCommentError(
      shortComment ? `Conte um pouco mais: o comentário precisa de pelo menos ${MIN_COMMENT} letras.` : null,
    );
    if (missingRating || shortComment) return;

    create.mutate({ rating, comment: trimmed, photos }, { onSuccess: onDone });
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Sua avaliação</Text>
      <StarPicker
        value={rating}
        onChange={(n) => {
          setRating(n);
          setRatingError(null);
        }}
      />
      {ratingError ? <Text style={styles.fieldError}>{ratingError}</Text> : null}

      <TextField
        label="Comentário"
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          setCommentError(null);
        }}
        placeholder="Como a peça se comportou na sua bike?"
        multiline
        maxLength={2000}
        autoCapitalize="sentences"
        style={styles.commentInput}
        error={commentError ?? undefined}
      />

      <View style={styles.photosBlock}>
        <Text style={styles.label}>Fotos (opcional, até {MAX_PHOTOS})</Text>
        <View style={styles.photoRow}>
          {photos.map((photo) => (
            <View key={photo.uri}>
              <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
              <PressableScale
                accessibilityLabel="Remover foto"
                onPress={() => setPhotos((list) => list.filter((p) => p.uri !== photo.uri))}
                style={styles.photoRemove}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </PressableScale>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <PressableScale accessibilityLabel="Adicionar foto" onPress={addPhoto} style={styles.addPhoto}>
              <Ionicons name="image-outline" size={24} color={colors.primary} />
              <Text style={styles.addPhotoText}>Foto</Text>
            </PressableScale>
          ) : null}
        </View>
        {galleryDenied ? (
          <View style={styles.deniedBox}>
            <Notice tone="warn">
              Sem acesso à galeria, a avaliação vai só com nota e comentário. Você perde a chance
              de mostrar a peça na sua bike. Para anexar fotos, libere a galeria nos ajustes.
            </Notice>
            {permission?.canAskAgain === false ? (
              <Button label="Abrir ajustes" variant="outline" onPress={() => void Linking.openSettings()} />
            ) : null}
          </View>
        ) : null}
      </View>

      {create.isError ? <Notice tone="error">{errorMessage(create.error)}</Notice> : null}

      <Button
        label={photos.length > 0 ? 'Enviar avaliação com foto' : 'Enviar avaliação'}
        variant="accent"
        onPress={handleSubmit}
        loading={create.isPending}
      />
    </View>
  );
}

export function ReviewsSection({ productId }: { productId: string }) {
  const reviews = useReviews(productId);
  const canReview = useCanReview(productId);
  const { entering } = useListMotion();
  const flash = useFlash();
  const [formOpen, setFormOpen] = useState(false);

  function renderPermission() {
    if (canReview.isPending) {
      return (
        <View style={styles.checking}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.checkingText}>Verificando se você pode avaliar…</Text>
        </View>
      );
    }
    if (canReview.isError) {
      return (
        <View style={styles.block}>
          <Notice tone="error">{errorMessage(canReview.error)}</Notice>
          <Button label="Tentar de novo" variant="outline" onPress={() => void canReview.refetch()} />
        </View>
      );
    }
    if (!canReview.data.allowed) {
      const { tone, text } = explainCannotReview(canReview.data);
      return <Notice tone={tone}>{text}</Notice>;
    }
    if (formOpen) {
      return (
        <ReviewForm
          productId={productId}
          onDone={() => {
            setFormOpen(false);
            flash.show('Avaliação enviada. Obrigado!');
          }}
        />
      );
    }
    return <Button label="Avaliar esta peça" variant="primary" onPress={() => setFormOpen(true)} />;
  }

  function renderList() {
    if (reviews.isPending) {
      return (
        <View style={styles.checking}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.checkingText}>Carregando avaliações…</Text>
        </View>
      );
    }
    if (reviews.isError) {
      return (
        <View style={styles.block}>
          <Notice tone="error">{errorMessage(reviews.error)}</Notice>
          <Button label="Tentar de novo" variant="outline" onPress={() => void reviews.refetch()} />
        </View>
      );
    }
    if (reviews.data.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyText}>
            Ninguém avaliou esta peça ainda. Quem comprar pode ser o primeiro.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.list}>
        {reviews.data.map((review, index) => (
          <Animated.View key={review.id} entering={entering(index)}>
            <ReviewCard review={review} />
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>AVALIAÇÕES</Text>
      {flash.message ? <FlashMessage message={flash.message} /> : null}
      {renderPermission()}
      {renderList()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary, letterSpacing: 1 },
  block: { gap: 10 },
  checking: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkingText: { color: colors.muted, fontSize: 14 },
  list: { gap: 10 },
  empty: { alignItems: 'center', gap: 8, padding: 16 },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 14, lineHeight: 20 },
  card: {
    padding: 14,
    gap: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 12, color: colors.muted },
  cardTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  cardComment: { fontSize: 15, lineHeight: 21, color: colors.ink },
  cardAuthor: { fontSize: 12, color: colors.muted },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 76, height: 76, borderRadius: radius.sm, backgroundColor: colors.bg },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 76,
    height: 76,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoText: { fontSize: 12, color: colors.primary, fontFamily: fonts.medium },
  form: {
    padding: 14,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  formTitle: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  fieldError: { color: colors.danger, fontSize: 13 },
  commentInput: { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 },
  photosBlock: { gap: 8 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  deniedBox: { gap: 8 },
});
