import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/auth.store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [loaded] = useFonts({
    'selah-acorn-regular': require('../assets/fonts/acorn-regular.otf'),
    'selah-acorn-semibold': require('../assets/fonts/acorn-semibold.otf'),
    'selah-acorn-bold': require('../assets/fonts/acorn-bold.otf'),
    'selah-acorn-thin': require('../assets/fonts/acorn-thin.otf'),

    'selah-manrope-light': require('../assets/fonts/Manrope-Light.ttf'),
    'selah-manrope-regular': require('../assets/fonts/Manrope-Regular.ttf'),
    'selah-manrope-medium': require('../assets/fonts/Manrope-Medium.ttf'),
    'selah-manrope-semibold': require('../assets/fonts/Manrope-SemiBold.ttf'),
    'selah-manrope-bold': require('../assets/fonts/Manrope-Bold.ttf'),
    'selah-manrope-extrabold': require('../assets/fonts/Manrope-ExtraBold.ttf'),
    'selah-manrope-extralight': require('../assets/fonts/Manrope-ExtraLight.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'create') {
        // Delay navigation to ensure app is mounted
        setTimeout(() => {
          router.push('/create');
        }, 1000);
      }
    });

    return () => subscription.remove();
  }, []);

  // Add session check to protected routes
  const isAuthenticated = !!session;

  if (loading) {
    return null; // or loading spinner
  }

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false
              }}
              redirect={!isAuthenticated}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false
              }}
              redirect={!isAuthenticated}
            />
            <Stack.Screen
              name="create"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="insight"
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="reflection/[id]"
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="highlight"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="settings/reminders"
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
        <Toast position="top" />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
