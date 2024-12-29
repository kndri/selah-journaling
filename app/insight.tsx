import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { reflectionService } from '@/services/reflection.service';
import { useState } from 'react';
import { Alert } from 'react-native';


export default function InsightScreen() {
  const { reflection, insights } = useLocalSearchParams<{
    reflection: string;
    insights: string;
  }>();

  const parsedInsights = JSON.parse(insights);

  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    try {
      setIsSaving(true);

      await reflectionService.createReflection({
        content: reflection,
        insight: parsedInsights.insight,
        scripture_verse: parsedInsights.scripture.verse,
        scripture_reference: parsedInsights.scripture.reference,
        explanation: parsedInsights.reflection,
      });

      // Navigate back to home
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.reflection}>{reflection}</Text>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="flash" size={24} color="#007AFF" />
            <Text style={styles.insightTitle}>Reflection Insight</Text>
          </View>
          <Text style={styles.insightText}>{parsedInsights.insight}</Text>
        </View>

        <View style={styles.scriptureCard}>
          <Text style={styles.scriptureText}>
            "{parsedInsights.scripture.verse}"
          </Text>
          <Text style={styles.scriptureReference}>
            — {parsedInsights.scripture.reference}
          </Text>
        </View>

        <Text style={styles.explanation}>
          {parsedInsights.reflection}
        </Text>
      </ScrollView>
      
      <View style={styles.finishButtonContainer}>
        <Pressable 
          style={[styles.finishButton, isSaving && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>Finish Reflection</Text>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </>
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
    padding: 20,
  },
  reflection: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: '#EDF4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    color: '#007AFF',
  },
  insightText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  scriptureCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    paddingLeft: 16,
    marginBottom: 24,
  },
  scriptureText: {
    fontFamily: fonts.acornRegular,
    fontSize: 20,
    marginBottom: 8,
  },
  scriptureReference: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#666',
  },
  explanation: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Add padding for the button
  },
  finishButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40, // Extra padding for bottom safe area
  },
  finishButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    color: '#fff',
  },
  finishButtonDisabled: {
    opacity: 0.7,
  },
}); 