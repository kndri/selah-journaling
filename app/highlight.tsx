import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';

export default function HighlightScreen() {
  const { summary, suggestion, goal } = useLocalSearchParams<{
    summary: string;
    suggestion: string;
    goal?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Highlight</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.sectionText}>{summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestion</Text>
            <Text style={styles.sectionText}>{suggestion}</Text>
          </View>

          {goal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goal</Text>
              <Text style={styles.sectionText}>{goal}</Text>
            </View>
          )}
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
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
  },
}); 