import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { fonts } from '@/constants/fonts';
import { useForgotPassword } from '@/services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { forgotPassword } = useForgotPassword();

  const handleResetPassword = async () => {
    if (!email) return;
    
    try {
      await forgotPassword(email.toLowerCase());
      router.back();
      // TODO: Add success toast
    } catch (error) {
      console.error('Forgot password error:', error);
      // TODO: Add error toast
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={router.back} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} />
      </Pressable>

      <Text style={styles.heading}>Reset Password</Text>
      <Text style={styles.logo}>selah</Text>

      <View style={styles.form}>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@gmail.com"
            placeholderTextColor="#0B0B0B"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
        </View>

        <Pressable 
          style={[
            styles.button,
            email ? styles.buttonEnabled : styles.buttonDisabled
          ]}
          onPress={handleResetPassword}
          disabled={!email}
        >
          <Text style={[
            styles.buttonText,
            email && styles.buttonTextEnabled
          ]}>SEND RESET LINK</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 24,
  },
  heading: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
  },
  logo: {
    fontFamily: fonts.acornSemibold,
    fontSize: 32,
    letterSpacing: -0.03 * 32,
    marginBottom: 48,
  },
  subtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0B0B0B',
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#F3F3F3',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonEnabled: {
    backgroundColor: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonTextEnabled: {
    color: '#fff',
  },
}); 