import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/constants/fonts';
import { reflectionService } from '@/services/reflection.service';
import { SafeAreaView } from 'react-native-safe-area-context';


interface ReflectionEntry {
  id: string;
  content: string;
  created_at: string;
  reflection_insights: Array<{
    insight: string;
    scripture_verse: string;
    scripture_reference: string;
    explanation: string;
    theme?: string;
  }>;
}

export default function ArchiveScreen() {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    try {
      const entries = await reflectionService.getAllEntriesWithInsights();
      setReflections(entries);
    } catch (error) {
      console.error('Failed to load reflections:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReflectionDuration = (content: string): string => {
    // Estimate reading time based on content length
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200); // Assuming 200 words per minute
    return `${minutes}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
  };

  const renderReflectionItem = ({ item }: { item: ReflectionEntry }) => (
    <Pressable
      style={styles.reflectionCard}
      onPress={() => router.push({
        pathname: '/reflection/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.reflectionHeader}>
        <View>
          <Text style={styles.reflectionTitle}>
            {item.reflection_insights[0]?.insight || 'Untitled Reflection'}
          </Text>
          <Text style={styles.reflectionDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.reflectionMeta}>
          <Ionicons name="mic-outline" size={16} color="#666" />
          <Text style={styles.reflectionDuration}>
            {getReflectionDuration(item.content)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </View>
      {item.reflection_insights[0]?.theme && (
        <View style={[
          styles.reflectionTag,
          { backgroundColor: getThemeColor(item.reflection_insights[0].theme) }
        ]}>
          <Text style={styles.reflectionTagText}>
            {item.reflection_insights[0].theme}
          </Text>
        </View>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Reflections</Text>
        <Text style={styles.subtitle}>Track your journey of self-discovery</Text>
      </View>

      <FlatList
        data={reflections}
        renderItem={renderReflectionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.reflectionsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reflectionsList: {
    paddingBottom: 100,
  },
  reflectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reflectionTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    marginBottom: 4,
    flex: 1,
  },
  reflectionDate: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
  },
  reflectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reflectionDuration: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
  },
  reflectionTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 12,
  },
  reflectionTagText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#fff',
  },
  newButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: {
    fontFamily: fonts.manropeBold,
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  newButtonIcon: {
    fontFamily: fonts.manropeBold,
    fontSize: 20,
    color: '#fff',
  },
});

// Helper function to get theme colors
const getThemeColor = (theme: string): string => {
  const colors = [
    '#7BB4E3', // Calm blue
    '#90D4B0', // Serene green
    '#B784E0', // Gentle purple
    '#FFB6C1', // Light pink
    '#FFD700', // Warm yellow
    '#98FB98', // Pale green
    '#DDA0DD', // Soft purple
    '#F0E68C', // Khaki
    '#E6E6FA', // Lavender
  ];
  
  // Use the theme string to consistently get the same color for the same theme
  const index = theme.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};
