import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <View style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Name</Text>
              <Text style={styles.menuValue}>Kouame NDri</Text>
            </View>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="mail-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Email</Text>
              <Text style={styles.menuValue}>kouamendri1@gmail.com</Text>
            </View>
          </Pressable>

          <Pressable 
            style={styles.menuItem}
            onPress={() => router.push('/settings/reminders')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Reminders</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable 
            style={styles.menuItem}
            onPress={handleSignOut}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            </View>
            <Text style={[styles.menuLabel, styles.signOutText]}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 28,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  menuIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
  },
  menuValue: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  signOutText: {
    color: '#FF3B30',
  },
}); 