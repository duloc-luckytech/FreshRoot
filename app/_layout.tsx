import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { BrandedSplash } from '@/components/branded-splash';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { useRouter, useSegments } from 'expo-router';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { token, loading, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [minSplashTimeReached, setMinSplashTimeReached] = React.useState(false);

  useEffect(() => {
    checkAuth();
    // Force minimum splash time for premium feel
    const timer = setTimeout(() => {
      setMinSplashTimeReached(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || !minSplashTimeReached) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  if (loading || !minSplashTimeReached) {
    return <BrandedSplash />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackTitle: 'Quay lại',
          headerTintColor: Colors[colorScheme ?? 'light'].tint,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(account)" options={{ headerShown: false }} />
        <Stack.Screen name="(shop)" options={{ headerShown: false }} />
        <Stack.Screen name="(agent)" options={{ headerShown: false }} />
        <Stack.Screen name="(blog)" options={{ headerShown: false }} />
        <Stack.Screen name="ai-chat" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: 'Thông báo' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Thông tin' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
