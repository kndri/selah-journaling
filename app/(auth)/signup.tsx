import { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';

import { fonts } from '@/constants/fonts';
import { useRegister } from '@/services/auth.service';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useRegister();

  const isFormValid = name && email && password && confirmPassword && agreedToTerms;

  const handleSignup = async () => {
    if (!isFormValid) return;
    
    // Basic validation
    if (password !== confirmPassword) {
      // TODO: Add error toast
      console.error('Passwords do not match');
      return;
    }

    try {
      await register({
        email: email.toLowerCase(),
        password,
        name,
      });
      // Note: on success, auth.service will automatically:
      // 1. Store the session
      // 2. Navigate to tabs
    } catch (error) {
      console.error('Signup error:', error);
      // TODO: Add error toast
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={router.back} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} />
      </Pressable>

      <Text style={styles.heading}>Create account</Text>
      <Text style={styles.logo}>selah</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nimbus"
            placeholderTextColor="#0B0B0B"
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="***********"
              placeholderTextColor="#0B0B0B"
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <Pressable 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#000"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.termsContainer}>
          <Checkbox
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            style={styles.checkbox}
            color={agreedToTerms ? '#000' : undefined}
          />
          <Text style={styles.termsText}>
            By creating an account you agree to our Terms of Service, Privacy Policy, and default Notification Settings.
          </Text>
        </View>

        <Pressable 
          style={[
            styles.button,
            isFormValid && styles.buttonEnabled
          ]}
          onPress={handleSignup}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.buttonText,
            isFormValid && styles.buttonTextEnabled
          ]}>CREATE ACCOUNT</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            I have an account.{' '}
            <Link href="/login" asChild>
              <Text style={styles.footerLink}>Log in</Text>
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
    marginBottom: 24,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
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
