import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { NotificationCard } from '@/components/NotificationCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, fonts, radius } from '@/theme';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const [leaving, setLeaving] = useState(false);

  async function handleSignOut() {
    setLeaving(true);
    await signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Conta" />
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>{user?.name.slice(0, 1).toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <NotificationCard />
        <Button label="Sair da conta" variant="outline" onPress={handleSignOut} loading={leaving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  card: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initial: { fontFamily: fonts.title, fontSize: 28, color: '#FFFFFF' },
  name: { fontFamily: fonts.title, fontSize: 20, color: colors.ink },
  email: { fontSize: 15, color: colors.muted },
});
