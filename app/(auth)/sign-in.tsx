import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
      console.log('Existing session found:', session.user.id);
      router.replace('/(tabs)');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        console.log('Sign in successful:', data.session.user.id);
        // Verify session is stored
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Session not persisted after sign in');
        }
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component code
} 