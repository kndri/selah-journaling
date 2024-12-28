import { Image, StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { fonts } from '@/constants/fonts';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>selah</Text>
      
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/nimbus-welcome.png')}
          style={styles.mascot}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
            <Text style={styles.subtitle}>Your journey with God{'\n'}
            one reflection at a time.</Text>
        </View>

        <Link href="/signup" asChild>
          <ThemedText style={styles.button}>
            GET STARTED
          </ThemedText>
        </Link>

        <View style={styles.loginContainer}>
          <ThemedText style={styles.loginText}>
            Already have an account?{' '}
            <Link href="/login" asChild>
              <Text style={styles.loginLink}>Log in</Text>
            </Link>
          </ThemedText>
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
  logo: {
    fontFamily: fonts.acornSemibold,
    fontSize: 38,
    letterSpacing: -0.03 * 32, // -3% of fontSize
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40, // Adjust to move content up slightly
  },
  mascot: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: fonts.acornBold,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 32,
    textAlign: 'center',
  },
  button: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    textAlign: 'center',
    overflow: 'hidden',
  },
  loginContainer: {
    marginTop: 16,
  },
  loginText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontFamily: fonts.manropeMedium,
    color: '#007AFF',
  },
});
