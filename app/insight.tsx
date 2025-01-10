import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { reflectionService } from '@/services/reflection.service';
import { useState } from 'react';
import { Alert } from 'react-native';

interface Goal {
  first: string;
  second: string;
  third: string;
}

export default function InsightScreen() {
  const params = useLocalSearchParams<{
    title: string;
    transcript: string;
    highlight: string;
    challenge: string;
    goal: string;
    scripture?: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);

  // Safely parse goal - handle both string and object formats
  const renderGoal = () => {
    try {
      if (!params.goal) return null;
      const parsed = JSON.parse(params.goal);
      
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

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      
      let scriptureData = { verse: '', reference: '' };
      try {
        if (params.scripture) {
          scriptureData = JSON.parse(params.scripture);
        }
      } catch (e) {
        console.error('Failed to parse scripture:', e);
      }

      await reflectionService.createEntryWithInsights({
        title: params.title,
        transcript: params.transcript,
        highlight: params.highlight,
        challenge: params.challenge,
        goal: params.goal,
        scripture_verse: scriptureData.verse,
        scripture_reference: scriptureData.reference
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save reflection:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save your reflection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!params.goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Invalid reflection data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.date}>Saturday, December 28, 2024</Text>
          <Text style={styles.title}>{params.title}</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="bulb-outline" size={24} color="#FFB800" />
            <Text style={styles.insightLabel}>Your Highlight</Text>
          </View>
          <Text style={styles.insightText}>{params.highlight}</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="trending-up" size={24} color="#FF3B30" />
            <Text style={styles.insightLabel}>Your Challenge</Text>
          </View>
          <Text style={styles.insightText}>{params.challenge}</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="flag-outline" size={24} color="#34C759" />
            <Text style={styles.insightLabel}>Your Goals</Text>
          </View>
          {renderGoal()}
        </View>

        {params.scripture && (
          <View style={styles.scriptureCard}>
            <Text style={styles.scriptureVerse}>
              {JSON.parse(params.scripture).verse}
            </Text>
            <Text style={styles.scriptureReference}>
              — {JSON.parse(params.scripture).reference}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.finishContainer}>
        <Pressable 
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={isSaving}
        >
          <Text style={styles.finishButtonText}>
            Finish Reflection
          </Text>
          {isSaving ? (
            <ActivityIndicator color="#fff" style={styles.finishIcon} />
          ) : (
            <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.finishIcon} />
          )}
        </Pressable>
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for fixed button
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 100,
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
  finishContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#FFFDF7',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  finishButton: {
    backgroundColor: '#007AFF',
    borderRadius: 100,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  finishIcon: {
    marginLeft: 4,
  },
}); 