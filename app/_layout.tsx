import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  
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

  // Handle notification responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'create' && session) {
        setTimeout(() => {
          router.push('/create');
        }, 1000);
      }
    });

    return () => subscription.remove();
  }, [session]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth Group - Always accessible */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Protected Routes */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }}
        redirect={!session}
      />
      <Stack.Screen 
        name="create" 
        options={{ presentation: 'modal' }}
        redirect={!session}
      />
      <Stack.Screen 
        name="insight" 
        options={{ presentation: 'modal' }}
        redirect={!session}
      />
      <Stack.Screen 
        name="reflection/[id]" 
        options={{ presentation: 'card' }}
        redirect={!session}
      />
      <Stack.Screen 
        name="settings" 
        options={{ presentation: 'modal' }}
        redirect={!session}
      />
      <Stack.Screen 
        name="settings/reminders" 
        options={{ presentation: 'modal' }}
        redirect={!session}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <RootLayoutNav />
          <StatusBar style="dark" />
          <Toast position="top" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
