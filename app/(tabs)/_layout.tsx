import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks/useCart';
import { colors, fonts } from '@/theme';
import type { ColorValue } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName, focusedName: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
}

export default function TabsLayout() {
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 62, paddingTop: 6 },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#FFFFFF' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Vitrine', tabBarIcon: icon('storefront-outline', 'storefront') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos', tabBarIcon: icon('heart-outline', 'heart') }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Sacola',
          tabBarIcon: icon('bag-outline', 'bag'),
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: icon('receipt-outline', 'receipt') }} />
      <Tabs.Screen name="account" options={{ title: 'Conta', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
