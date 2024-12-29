import { StyleSheet, View, Text, Pressable } from 'react-native';
import { fonts } from '@/constants/fonts';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface RecordingVisualizerProps {
  duration: number;
  isRecording: boolean;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onDelete?: () => void;
}

export function RecordingVisualizer({ 
  duration, 
  isRecording,
  isPlaying,
  onPlayPause,
  onDelete,
}: RecordingVisualizerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simpler animation for the bars
  const bars = Array.from({ length: 30 }).map((_, i) => {
    const animatedStyle = useAnimatedStyle(() => ({
      height: withRepeat(
        withSequence(
          withTiming(Math.random() * 30 + 10, {
            duration: 500,
            easing: Easing.ease,
          }),
          withTiming(Math.random() * 30 + 10, {
            duration: 500,
            easing: Easing.ease,
          })
        ),
        -1
      ),
    }));

    return (
      <Animated.View 
        key={i}
        style={[
          styles.bar, 
          animatedStyle,
          !isRecording && !isPlaying && styles.barInactive
        ]}
      />
    );
  });

  return (
    <View style={[
      styles.container,
      !isRecording && styles.containerCompleted
    ]}>
      <View style={styles.visualizer}>
        {bars}
      </View>
      <View style={styles.controls}>
        <Text style={styles.timer}>
          {isRecording ? 'Recording: ' : 'Audio: '}
          {formatTime(duration)}
        </Text>
        {!isRecording && onPlayPause && (
          <Pressable onPress={onPlayPause} style={styles.playButton}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color="#007AFF" 
            />
          </Pressable>
        )}
      </View>
      {onDelete && (
        <Pressable 
          onPress={onDelete} 
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  containerCompleted: {
    backgroundColor: '#F3F3F3',
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  bar: {
    width: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
  },
  barInactive: {
    backgroundColor: '#666',
  },
  timer: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  playButton: {
    padding: 4,
  },
}); 