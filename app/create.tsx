import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';

import { fonts } from '@/constants/fonts';
import { RecordingVisualizer } from '@/components/RecordingVisualizer';
import { aiService } from '@/services/ai.service';
import { transcriptionService } from '@/services/transcription.service';
import { reflectionService } from '@/services/reflection.service';
import { ProcessingScreen } from '@/components/ProcessingScreen';

interface Recording {
  id: string;
  uri: string;
  duration: number;
}

export default function CreateReflectionScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  
  const recording = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const soundRef = useRef<{ [key: string]: Audio.Sound | null }>({});

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Set up audio mode once
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    })();

    // Cleanup audio when component unmounts
    return () => {
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        console.log('No permission to record');
        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      recording.current = newRecording;
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      // TODO: Show error toast
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording.current) return;

      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      
      if (uri) {
        const newRecording: Recording = {
          id: Date.now().toString(),
          uri,
          duration: recordingDuration,
        };
        setRecordings(prev => [...prev, newRecording]);
      }

      recording.current = null;
      setIsRecording(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to stop recording', err);
      // TODO: Show error toast
    }
  };

  const handlePlayPause = async (recordingId: string) => {
    const recordingToPlay = recordings.find(r => r.id === recordingId);
    if (!recordingToPlay) return;

    try {
      if (playingId === recordingId) {
        // Pause current recording
        await soundRef.current[recordingId]?.pauseAsync();
        setPlayingId(null);
      } else {
        // Stop any currently playing audio
        if (playingId) {
          await soundRef.current[playingId]?.stopAsync();
        }

        // Play selected recording
        if (!soundRef.current[recordingId]) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: recordingToPlay.uri },
            { shouldPlay: true },
            (status) => {
              if (status.didJustFinish) {
                setPlayingId(null);
              }
            }
          );
          soundRef.current[recordingId] = sound;
        } else {
          await soundRef.current[recordingId]?.playAsync();
        }
        setPlayingId(recordingId);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleDelete = (recordingId: string) => {
    soundRef.current[recordingId]?.unloadAsync();
    delete soundRef.current[recordingId];
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
    if (playingId === recordingId) {
      setPlayingId(null);
    }
  };

  const handleDone = async () => {
    try {
      setShowProcessing(true);
      setIsProcessing(true);

      // Wait for processing animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to save reflections');
      }

      // Process recordings and get transcriptions
      const transcriptions = [];
      for (const rec of recordings) {
        try {
          const result = await transcriptionService.transcribeAudio(rec.uri);
          if (result) {
            transcriptions.push(result);
          }
        } catch (error) {
          console.error(`Failed to transcribe recording ${rec.id}:`, error);
        }
      }

      // Combine transcriptions and text
      const fullText = [
        ...transcriptions,
        text
      ].filter(Boolean).join('\n\n');

      if (!fullText.trim()) {
        throw new Error('No content to process after transcription');
      }

      console.log('Generating insights for text:', { textLength: fullText.length });
      
      // Generate insights with new format
      const insights = await aiService.generateInsights(fullText);
      console.log('Got insights:', insights);

      // Close the modal first
      router.back();

      // Then navigate to insights screen with new data structure
      setTimeout(() => {
        router.push({
          pathname: '/insight',
          params: {
            title: insights.title,
            transcript: fullText,
            highlight: insights.highlight,
            challenge: insights.challenge,
            goal: JSON.stringify(insights.goal),
            scripture: JSON.stringify(insights.scripture)
          }
        });
      }, 100);

    } catch (error) {
      console.error('Processing failed:', error);
      Alert.alert(
        'Processing Failed',
        error instanceof Error ? 
          error.message : 
          'Failed to process your reflection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
      setShowProcessing(false);
    }
  };

  // Show message if no permission
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>
            Please enable microphone permissions to record audio.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={router.back} hitSlop={8}>
            <Ionicons name="close" size={24} />
          </Pressable>
          <Text style={styles.date}>{formatDate()}</Text>
          <Pressable 
            onPress={handleDone}
            disabled={isProcessing || (!recordings.length && !text)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={[
                styles.doneButton,
                (!recordings.length && !text) && styles.doneButtonDisabled
              ]}>Done</Text>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {recordings.map(rec => (
            <RecordingVisualizer
              key={rec.id}
              duration={rec.duration}
              isRecording={false}
              isPlaying={playingId === rec.id}
              onPlayPause={() => handlePlayPause(rec.id)}
              onDelete={() => handleDelete(rec.id)}
            />
          ))}

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Start writing..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
          />
        </ScrollView>

        <View style={styles.recordingContainer}>
          {isRecording && (
            <RecordingVisualizer
              duration={recordingDuration}
              isRecording={true}
              isPlaying={false}
            />
          )}
          <Text style={styles.recordingText}>
            {isRecording ? formatTime(recordingDuration) : 'Tap to record'}
          </Text>
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          >
            <Ionicons 
              name="mic" 
              size={32} 
              color={isRecording ? '#fff' : '#FF69B4'} 
            />
          </Pressable>
        </View>
      </View>
      {showProcessing && (
        <View style={StyleSheet.absoluteFill}>
          <ProcessingScreen />
        </View>
      )}
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
  date: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    color: '#000',
  },
  doneButton: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    color: '#007AFF',
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    padding: 0,
    marginBottom: 20,
  },
  recordingContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  recordingText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButtonActive: {
    backgroundColor: '#FF69B4',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  visualizerContainer: {
    marginBottom: 16,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
}); 