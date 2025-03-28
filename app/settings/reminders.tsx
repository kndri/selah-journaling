import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/constants/fonts';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { notificationService } from '@/services/notification.service';
import Toast from 'react-native-toast-message';

export default function RemindersScreen() {
  const [reflectionEnabled, setReflectionEnabled] = useState(true);
  const [reflectionTime, setReflectionTime] = useState(new Date().setHours(6, 0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await notificationService.getCurrentSettings();
      if (settings.time) {
        setReflectionTime(settings.time.getTime());
      }
      setReflectionEnabled(settings.enabled);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleToggleReminder = async (value: boolean) => {
    try {
      if (value) {
        const hasPermission = await notificationService.requestPermissions();
        if (!hasPermission) {
          Toast.show({
            type: 'info',
            text1: 'Notification Permission Required',
            text2: 'Please enable notifications to receive daily reminders',
          });
          return;
        }
      }

      await notificationService.scheduleReflectionReminder(
        new Date(reflectionTime),
        value
      );
      setReflectionEnabled(value);
      
      Toast.show({
        type: 'success',
        text1: value ? 'Reminders Enabled' : 'Reminders Disabled',
        text2: value 
          ? 'You will receive daily reflection reminders' 
          : 'Daily reminders have been turned off',
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update reminder settings',
      });
    }
  };

  const handleTimeSelect = async (date: Date) => {
    try {
      setReflectionTime(date.getTime());
      if (reflectionEnabled) {
        await notificationService.scheduleReflectionReminder(date, true);
        Toast.show({
          type: 'success',
          text1: 'Reminder Updated',
          text2: 'Your daily reminder time has been updated',
        });
      }
    } catch (error) {
      console.error('Error updating reminder time:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update reminder time',
      });
    }
    setShowTimePicker(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.title}>Reminders</Text>
        </View>

        <Text style={styles.description}>
          Set up a daily reminder to help make reflection a consistent practice.
        </Text>

        <View style={styles.reminderItem}>
          <View style={styles.reminderIcon}>
            <Ionicons name="book-outline" size={24} color="#000" />
          </View>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Daily Reflection</Text>
            <Pressable 
              style={styles.timeContainer}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.reminderTime}>{formatTime(reflectionTime)}</Text>
              <Switch
                value={reflectionEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: '#E5E5E5', true: '#FF3B30' }}
              />
            </Pressable>
          </View>
        </View>
        <View>
          <Text style={styles.reminderDescription}>
                Daily reminder to take a moment for yourself and reflect on your journey.
              </Text>
          </View>
 
        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          onConfirm={handleTimeSelect}
          onCancel={() => setShowTimePicker(false)}
          date={new Date(reflectionTime)}
        />

        <Pressable 
          style={styles.doneButton}
          onPress={() => router.back()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontFamily: fonts.manropeBold,
    fontSize: 28,
  },
  description: {
    fontFamily: fonts.manropeRegular,
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  reminderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderTime: {
    fontFamily: fonts.manropeMedium,
    fontSize: 14,
    color: '#666',
  },
  reminderTitle: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
  },
  reminderDescription: {
    fontFamily: fonts.manropeRegular,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  doneButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: fonts.manropeSemibold,
    fontSize: 16,
    color: '#fff',
  },
}); 