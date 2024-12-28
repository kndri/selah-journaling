import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/auth.store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen 
            name="(auth)"
            options={{
              headerShown: false
            }}
            redirect={isAuthenticated}
          />
          <Stack.Screen 
            name="(tabs)"
            options={{
              headerShown: false
            }}
            redirect={!isAuthenticated}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
      <Toast position="top" />
    </GestureHandlerRootView>
  );
}
