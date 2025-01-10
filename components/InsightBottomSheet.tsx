import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';

interface InsightBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  insight: {
    summary: string;
    suggestion: string;
    goal?: string;
  };
}

export function InsightBottomSheet({ isVisible, onClose, insight }: InsightBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['60%'];

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}
      index={0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Highlight</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.sectionText}>{insight.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestion</Text>
            <Text style={styles.sectionText}>{insight.suggestion}</Text>
          </View>

          {insight.goal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goal</Text>
              <Text style={styles.sectionText}>{insight.goal}</Text>
            </View>
          )}
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFDF7',
  },
  handleIndicator: {
    backgroundColor: '#E5E5E5',
    width: 40,
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
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionText: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
  },
}); 