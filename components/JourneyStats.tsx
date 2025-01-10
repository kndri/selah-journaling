import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/constants/fonts';

interface JourneyStatsProps {
  streak: number;
}

export function JourneyStats({ streak }: JourneyStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color="#FF6B00" />
          <View>
            <Text style={styles.streakCount}>{streak} day streak</Text>
            <Text style={styles.streakSubtext}>Keep it up!</Text>
          </View>
        </View>
        <Link href="/progress" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>View Progress</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakCount: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    marginBottom: 2,
  },
  streakSubtext: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#000',
  },
}); 