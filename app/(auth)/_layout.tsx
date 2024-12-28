import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Prevent accessing auth screens when authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
} 