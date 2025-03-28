import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/constants/fonts';
import { reflectionService } from '@/services/reflection.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeableRow } from '@/components/SwipeableRow';

type ThemeColor = 'Red' | 'Blue' | 'Green' | 'Purple';

const themeColorMap: Record<ThemeColor, string> = {
  Red: '#FF6B6B',    // A soft, warm red
  Blue: '#4ECDC4',   // A calming teal-blue
  Green: '#45B7A0',  // A soothing sage green
  Purple: '#9D80CB', // A gentle lavender purple
};

interface ReflectionEntry {
  id: string;
  title: string; // Added title
  content: string | null; // Updated to allow null
  created_at: string;
  transcript: string; // Added transcript
  transcript_summary: string; // Added transcript_summary
  highlight: string; // Added highlight
  goal: string; // Added goal
  challenge: string; // Added challenge
  scripture_verse: string; // Added scripture_verse
  scripture_reference: string; // Added scripture_reference
  explanation: string | null; // Updated to allow null
  theme: string; // Added theme
  sub_theme: string; // Added sub_theme
  color: string; // Added color
  shape: string; // Added shape
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

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await reflectionService.deleteEntry(id);
              
              // Force refresh from server instead of optimistic update
              const updatedEntries = await reflectionService.getAllEntriesWithInsights();
              console.log('Fetched entries after delete:', updatedEntries.map(e => e.id));
              setReflections(updatedEntries);
              
            } catch (error) {
              console.error('Failed to delete reflection:', error);
              Alert.alert(
                'Error',
                'Failed to delete reflection. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderReflectionItem = ({ item }: { item: ReflectionEntry }) => {
    console.log('reflection: ', item)
    return (
      <SwipeableRow onDelete={() => handleDelete(item.id)}>
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
                {item.title || 'Untitled Reflection'}
              </Text>
              <Text style={styles.reflectionDate}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.reflectionActions}>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
            <View style={[styles.reflectionTag, { backgroundColor: themeColorMap[item.color as ThemeColor] + '20' }]}>
              <Text style={[styles.reflectionTagText, { color: themeColorMap[item.color as ThemeColor] }]}>
                {item.theme}
              </Text>
            </View>
            <View style={[styles.reflectionTag, { backgroundColor: themeColorMap[item.color as ThemeColor] + '20' }]}>
              <Text style={[styles.reflectionTagText, { color: themeColorMap[item.color as ThemeColor] }]}>
                {item.sub_theme}
              </Text>
            </View>
          </View>
  
        </Pressable>
      </SwipeableRow>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!reflections.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Reflections</Text>
          <Text style={styles.subtitle}>Track your journey of self-discovery</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={48} color="#666" />
          <Text style={styles.emptyTitle}>No reflections yet</Text>
          <Text style={styles.emptyText}>
            Your reflections will appear here after you create them
          </Text>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  reflectionTagText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 12,
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
  reflectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    gap: 4,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.manropeMedium,
  },
  deleteActionContainer: {
    width: 80,
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
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
