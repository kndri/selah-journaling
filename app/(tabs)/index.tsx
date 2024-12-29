import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts } from '@/constants/fonts';

const PROMPTS = [
  {
    id: 'gratitude',
    icon: '🙏',
    title: 'Start with Gratitude',
    question: "What's something you're thankful for today?",
    backgroundColor: '#FFF9E6',
  },
  {
    id: 'morning',
    icon: '✨',
    title: 'Morning Reflection',
    question: "How do you hope to see God's presence today?",
    backgroundColor: '#EDF4FF',
  },
  {
    id: 'evening',
    icon: '🌙',
    title: 'Evening Peace',
    question: 'What brought you peace today?',
    backgroundColor: '#F8F0FF',
  },
];

const TIPS = [
  {
    id: 'audio',
    icon: '🎙️',
    title: 'Audio First',
    description: 'Speak naturally, just like talking to a friend',
  },
  {
    id: 'time',
    icon: '⏱️',
    title: 'No Pressure',
    description: 'Start small with just a minute or two',
  },
  {
    id: 'present',
    icon: '🧘',
    title: 'Be Present',
    description: 'Find a quiet space to reflect',
  },
  {
    id: 'anytime',
    icon: '🌅',
    title: 'Any Time',
    description: "Morning, noon, or night - it's your choice",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Welcome to Selah</Text>
            <Text style={styles.subtitle}>Your journey of reflection begins here</Text>
          </View>
          <View style={styles.sparkleContainer}>
            <Text style={styles.sparkle}>✨</Text>
          </View>
        </View>

        <View style={styles.recordCard}>
          <View style={styles.micContainer}>
            <Ionicons name="mic" size={32} color="#FF69B4" />
          </View>
          <Text style={styles.recordTitle}>Create Your First Reflection</Text>
          <Text style={styles.recordSubtitle}>
            Take a moment to pause, breathe, and share what's on your heart
          </Text>
          <Pressable 
            style={styles.recordButton}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.recordButtonText}>Start Recording</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.promptsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Need inspiration?</Text>
            <Link href="/prompts" style={styles.seeAllLink}>
              <Text style={styles.seeAllText}>See all prompts</Text>
            </Link>
          </View>

          {PROMPTS.map((prompt) => (
            <Pressable
              key={prompt.id}
              style={[styles.promptCard, { backgroundColor: prompt.backgroundColor }]}
            >
              <Text style={styles.promptIcon}>{prompt.icon}</Text>
              <View>
                <Text style={styles.promptTitle}>{prompt.title}</Text>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <View style={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.acornSemibold,
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
  },
  sparkleContainer: {
    backgroundColor: '#FFE5EC',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    fontSize: 20,
  },
  recordCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  micContainer: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordTitle: {
    fontFamily: fonts.manropeBold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  recordSubtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  recordButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontFamily: fonts.manropeBold,
    color: '#fff',
    fontSize: 16,
  },
  promptsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.manropeBold,
    fontSize: 20,
  },
  seeAllLink: {
    padding: 4,
  },
  seeAllText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    color: '#FF69B4',
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  promptIcon: {
    fontSize: 24,
  },
  promptTitle: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    marginBottom: 4,
  },
  promptQuestion: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    paddingRight: 30,
    color: '#666',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  tipCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    width: '47%',
  },
  tipIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipTitle: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    marginBottom: 4,
  },
  tipDescription: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
  },
});
