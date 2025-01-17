import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/(auth)/welcome');
    }
  }, [session, isLoading]);

  if (isLoading) return null;
  if (!session) return null;

  return <>{children}</>;
} 