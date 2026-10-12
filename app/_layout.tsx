import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { PickupSelectionProvider } from '@/checkout/PickupSelection';
import '@/notifications/setup';
import { NotificationRouter } from '@/notifications/NotificationRouter';
import { NotificationSync } from '@/notifications/NotificationSync';
import { AppQueryProvider } from '@/query/AppQueryProvider';
import { useSessionCheck } from '@/hooks/useSessionCheck';
import { colors, fonts } from '@/theme';

void SplashScreen.preventAutoHideAsync();

function SessionCheck({ active }: { active: boolean }) {
  useSessionCheck(active);
  return null;
}

function Shell() {
  const [fontsLoaded, fontError] = useFonts({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold });
  const { ready, user } = useAuth();
  const loggedIn = user !== null;
  const showApp = (fontsLoaded || fontError !== null) && ready;

  useEffect(() => {
    if (showApp) void SplashScreen.hideAsync();
  }, [showApp]);

  if (!showApp) return null;

  const detailHeader = {
    headerShown: true,
    headerTintColor: colors.primary,
    headerStyle: { backgroundColor: colors.bg },
    headerTitleStyle: { fontFamily: fonts.title, color: colors.ink },
    headerShadowVisible: false,
    headerBackTitle: 'Voltar',
  } as const;

  return (
    <AppQueryProvider userId={user?.id ?? null}>
      <StatusBar style={loggedIn ? 'dark' : 'light'} />
      <SessionCheck active={loggedIn} />
      <PickupSelectionProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        {/* Rotas protegidas: deslogado não alcança nenhuma delas. */}
        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>
        <Stack.Protected guard={loggedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ ...detailHeader, title: 'Peça' }} />
          <Stack.Screen name="order/[id]" options={{ ...detailHeader, title: 'Pedido' }} />
          <Stack.Screen name="pickup" options={{ ...detailHeader, title: 'Retirada' }} />
        </Stack.Protected>
      </Stack>
      {user ? (
        <>
          <NotificationRouter />
          <NotificationSync userId={user.id} />
        </>
      ) : null}
      </PickupSelectionProvider>
    </AppQueryProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
