import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/constants/fonts';
import { JourneyStats } from '@/components/JourneyStats';
import { reflectionService } from '@/services/reflection.service';

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
  const [hasReflections, setHasReflections] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkReflections();
  }, []);

  const checkReflections = async () => {
    try {
      const entries = await reflectionService.getAllEntriesWithInsights();
      setHasReflections(entries.length > 0);
      
      if (entries.length > 0) {
        const today = new Date();
        let currentStreak = 0;
        let lastDate = today;

        for (const entry of entries) {
          const entryDate = new Date(entry.created_at);
          const diffDays = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            currentStreak++;
            lastDate = entryDate;
          } else {
            break;
          }
        }

        setStreak(currentStreak);
      }
    } catch (error) {
      console.error('Failed to check reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome back</Text>
        
        {hasReflections && <JourneyStats streak={streak} />}

        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>
            {hasReflections 
              ? `Ready for today's reflection?`
              : 'Start your reflection journey'}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {hasReflections
              ? 'Take a moment to reflect on your day.'
              : 'Begin your journey of self-discovery through guided reflections.'}
          </Text>
          <Link href="/create" asChild>
            <Pressable style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>
                {hasReflections ? 'New Reflection' : 'Start Now'}
              </Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.promptsSection}>
          <Text style={styles.sectionTitle}>Need inspiration?</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontFamily: fonts.acornSemibold,
    fontSize: 24,
    marginBottom: 24,
  },
  ctaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 20,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    color: '#fff',
  },
  promptsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 20,
    marginBottom: 16,
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
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    marginBottom: 4,
  },
  promptQuestion: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
    paddingRight: 20
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    marginBottom: 4,
  },
  tipDescription: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
  },
});
