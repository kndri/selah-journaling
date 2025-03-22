import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { notificationService } from './notification.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export const authService = {
  login: async ({ email, password }: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch additional user data from your profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: profile as User,
      session: data.session,
    };
  },

  register: async ({ email, password, name }: RegisterData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create profile in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user!.id,
          email,
          name,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    return {
      user: profile as User,
      session: authData.session,
    };
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'selah://reset-password',
    });

    if (error) throw error;
    return true;
  },

  resetPassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return true;
  },

  signOut: async () => {
    try {
      await notificationService.cancelAllNotifications();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

// Custom hooks
export function useLogin() {
  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, session } = await authService.login(credentials);
      useAuthStore.getState().login(session?.access_token!, user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return { login };
}

export function useRegister() {
  const register = async (data: RegisterData) => {
    try {
      const { user, session } = await authService.register(data);
      useAuthStore.getState().login(session?.access_token!, user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return { register };
}

export function useForgotPassword() {
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  return { forgotPassword };
} 