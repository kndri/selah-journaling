import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { fonts } from '@/constants/fonts';

const quotes = [
  "Be still, and know that I am God. - Psalm 46:10",
  "For I know the plans I have for you. - Jeremiah 29:11",
  "In quietness and trust is your strength. - Isaiah 30:15",
  "Cast your cares on the Lord and he will sustain you. - Psalm 55:22",
  "The Lord is my shepherd, I lack nothing. - Psalm 23:1",
  "Trust in the Lord with all your heart. - Proverbs 3:5",
  "I can do all things through Christ who strengthens me. - Philippians 4:13",
  "The joy of the Lord is your strength. - Nehemiah 8:10",
  "Peace I leave with you; my peace I give you. - John 14:27",
  "Let all that you do be done in love. - 1 Corinthians 16:14",
  "Give thanks in all circumstances. - 1 Thessalonians 5:18",
  "The Lord is near to all who call on him. - Psalm 145:18",
  "Let your light shine before others. - Matthew 5:16"
];

export function ProcessingScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Floating shapes animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Quote rotation animation
    const rotateQuotes = () => {
      Animated.sequence([
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(quoteAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      });
    };

    const quoteInterval = setInterval(rotateQuotes, 3000);
    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Processing Reflection...</Text>
        <Animated.Text 
          style={[
            styles.quote,
            {
              opacity: quoteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [{
                translateY: quoteAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }],
            },
          ]}
        >
          {quotes[currentQuoteIndex]}
        </Animated.Text>
      </View>

      {/* Floating shapes */}
      <View style={styles.shapesContainer}>
        {['pentagon', 'star', 'hexagon', 'circle'].map((shape, i) => (
          <Animated.View
            key={shape}
            style={[
              styles.shape,
              styles[shape as keyof typeof styles],
              {
                transform: [{
                  translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20 * (i % 2 ? 1 : -1)],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 28,
    color: '#000000',
    marginBottom: 24,
  },
  quote: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E5E5E5',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000000',
  },
  shapesContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  shape: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 20,
  },
  pentagon: {
    top: '20%',
    left: '20%',
  },
  star: {
    top: '30%',
    right: '25%',
  },
  hexagon: {
    bottom: '35%',
    left: '30%',
  },
  circle: {
    bottom: '25%',
    right: '20%',
  },
}); 