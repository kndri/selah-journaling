import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { reflectionService } from '@/services/reflection.service';
import { useState, useEffect } from 'react';

type ThemeColor = 'Red' | 'Blue' | 'Green' | 'Purple';

const themeColorMap: Record<ThemeColor, string> = {
  Red: '#FF6B6B',    // A soft, warm red
  Blue: '#4ECDC4',   // A calming teal-blue
  Green: '#45B7A0',  // A soothing sage green
  Purple: '#9D80CB', // A gentle lavender purple
};

interface ReflectionEntry {
  id: string;
  title: string;
  transcript: string;
  transcript_summary: string;
  highlight: string;
  challenge: string;
  goal: string;
  scripture_verse?: string;
  scripture_reference?: string;
  theme: string;
  sub_theme: string;
  color: string;
  shape: string;
  created_at: string;
}

export default function ReflectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [entry, setEntry] = useState<ReflectionEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflection();
  }, [id]);

  const loadReflection = async () => {
    try {
      const reflection = await reflectionService.getEntryById(id as string);
      setEntry(reflection);
    } catch (error) {
      console.error('Failed to load reflection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safely parse goal - handle both string and object formats
  const renderGoal = () => {
    try {
      if (!entry?.goal) return null;
      const parsed = JSON.parse(entry.goal);

      // If it's already an object with first/second/third
      if (typeof parsed === 'object' && parsed.first) {
        return (
          <>
            <Text style={styles.insightText}>{parsed.first}</Text>
            <Text style={styles.insightText}>{parsed.second}</Text>
            <Text style={styles.insightText}>{parsed.third}</Text>
          </>
        );
      }

      // If it's a string, just render it directly
      return <Text style={styles.insightText}>{parsed}</Text>;
    } catch (e) {
      console.error('Failed to parse goal:', e);
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Reflection not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
            <Text style={styles.title}>{entry.title}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#fff7ed', '#fdf2f8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryIcon, { backgroundColor: themeColorMap[entry.color as ThemeColor] }]}>
              {entry.shape === 'Circle' && <Ionicons name="ellipse-outline" size={24} color={themeColorMap[entry.color as ThemeColor]} />}
              {entry.shape === 'Square' && <Ionicons name="square-outline" size={24} color={themeColorMap[entry.color as ThemeColor]} />}
              {entry.shape === 'Triangle' && <Ionicons name="triangle-outline" size={24} color={themeColorMap[entry.color as ThemeColor]} />}
              {entry.shape === 'Star' && <Ionicons name="star-outline" size={24} color={themeColorMap[entry.color as ThemeColor]} />}
            </View>
            <Text style={styles.summaryText}>{entry.transcript_summary}</Text>
          </View>
          <View style={styles.moodContainer}>
            <Text style={styles.moodText}>{entry.theme}</Text>
            <Ionicons name="arrow-forward" size={16} color="#6B7280" />
            <Text style={[styles.moodText, styles.moodHighlight]}>{entry.sub_theme}</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="bulb-outline" size={24} color="#FFB800" />
            <Text style={styles.insightLabel}>Your Highlight</Text>
          </View>
          <Text style={styles.insightText}>{entry.highlight}</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="trending-up" size={24} color="#FF3B30" />
            <Text style={styles.insightLabel}>Your Challenge</Text>
          </View>
          <Text style={styles.insightText}>{entry.challenge}</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="flag-outline" size={24} color="#34C759" />
            <Text style={styles.insightLabel}>Your Goals</Text>
          </View>
          {renderGoal()}
        </View>

        {entry.scripture_verse && (
          <View style={styles.scriptureCard}>
            <Text style={styles.scriptureVerse}>
              {entry.scripture_verse}
            </Text>
            <Text style={styles.scriptureReference}>
              — {entry.scripture_reference}
            </Text>
          </View>
        )}
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    marginTop: 4,
  },
  date: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 24,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightLabel: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  insightText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 8,
  },
  scriptureCard: {
    backgroundColor: '#F0F0F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  scriptureVerse: {
    fontFamily: fonts.acornRegular,
    fontSize: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  scriptureReference: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  moodText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#6B7280',
  },
  moodHighlight: {
    color: '#FF3B30',
  },
}); 