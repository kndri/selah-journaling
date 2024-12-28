import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { fonts } from '@/constants/fonts';
import { useForgotPassword } from '@/services/auth.service';

interface ForgotPasswordSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export function ForgotPasswordSheet({ bottomSheetRef }: ForgotPasswordSheetProps) {
  const [email, setEmail] = useState('');
  const { forgotPassword } = useForgotPassword();

  const handleResetPassword = async () => {
    if (!email) return;
    
    try {
      await forgotPassword(email.toLowerCase());
      bottomSheetRef.current?.dismiss();
      // TODO: Add toast notification
    } catch (error) {
      console.error('Forgot password error:', error);
      // TODO: Add error toast
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['60%']}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
    >
      <View style={styles.container}>
        <Pressable 
          onPress={() => bottomSheetRef.current?.dismiss()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} />
        </Pressable>

        <Text style={styles.title}>Reset Password</Text>
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
          style={[styles.button, !email && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={!email}
        >
          <Text style={styles.buttonText}>SEND RESET LINK</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFDF7',
    borderRadius: 24,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    textAlign: 'center',
  },
}); 