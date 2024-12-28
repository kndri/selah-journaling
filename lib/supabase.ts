import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cswkhsiptzvppjizccbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzd2toc2lwdHp2cHBqaXpjY2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTI4MzMsImV4cCI6MjA1MDk2ODgzM30.woec0v4eeWgN6-jNet6qL3fGJLRoEwN7guPX_7dxgd8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 