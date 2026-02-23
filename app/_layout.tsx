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
  const { token, user, loading, checkAuth } = useAuthStore();
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
    console.log('RootLayout Redirect Check:', { token: !!token, role: user?.role, inAuthGroup, segments });

    if (!token && !inAuthGroup) {
      console.log('Redirecting to login...');
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      console.log('Authenticated, redirecting based on role:', user?.role);
      if (user?.role === 'admin') {
        router.replace('/(admin)/cms');
      } else if (user?.role) {
        router.replace('/(tabs)');
      } else {
        console.log('User role not found yet, waiting...');
      }
    }
  }, [token, user, loading, segments, minSplashTimeReached]);

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
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(account)" options={{ headerShown: false }} />
        <Stack.Screen name="(shop)" options={{ headerShown: false }} />
        <Stack.Screen name="(agent)" options={{ headerShown: false }} />
        <Stack.Screen name="(blog)" options={{ headerShown: false }} />
        <Stack.Screen name="ai-chat" options={{ title: 'FreshRoot AI' }} />
        <Stack.Screen name="search" options={{ title: 'Tìm kiếm' }} />
        <Stack.Screen name="notifications" options={{ title: 'Thông báo' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Thông tin' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
