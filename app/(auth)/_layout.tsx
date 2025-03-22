import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  // Redirect to tabs if already authenticated
  if (!isLoading && session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
} 