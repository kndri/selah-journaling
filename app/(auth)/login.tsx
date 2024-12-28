import { useRef, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { fonts } from '@/constants/fonts';
import { useLogin } from '@/services/auth.service';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useLogin();

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
      // TODO: Add error toast
    }
  };

  const isFormValid = email && password;

  return (
    <View style={styles.container}>
      <Pressable onPress={router.back} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} />
      </Pressable>

      <Text style={styles.heading}>Log in</Text>
      <Text style={styles.logo}>selah</Text>

      <View style={styles.form}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="***********"
              placeholderTextColor="#0B0B0B"
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#000"
              />
            </Pressable>
          </View>
          <Link href="/forgot-password" asChild>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Link>
        </View>

        <Pressable 
          style={[
            styles.button,
            isFormValid && styles.buttonEnabled
          ]} 
          onPress={handleLogin}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.buttonText,
            isFormValid && styles.buttonTextEnabled
          ]}>LOGIN</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Link href="/signup" asChild>
              <Text style={styles.footerLink}>Create account</Text>
            </Link>
          </Text>
        </View>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    top: 6,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    textDecorationLine: 'underline'
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
  buttonText: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonTextEnabled: {
    color: '#fff',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
  },
  footerLink: {
    fontFamily: fonts.manropeMedium,
    color: '#007AFF',
  },
});
