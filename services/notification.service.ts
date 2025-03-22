import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { NotificationTriggerInput } from 'expo-notifications';

// Configure notifications for iOS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private notificationIdentifier: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleReflectionReminder(time: Date, enabled: boolean): Promise<void> {
    try {
      // Cancel any existing notification
      if (this.notificationIdentifier) {
        await this.cancelNotification(this.notificationIdentifier);
      }
  
      if (!enabled) return;
  
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }
  
      // Calculate the next occurrence of the selected time
      const now = new Date();
      const nextTrigger = new Date();
      nextTrigger.setHours(time.getHours(), time.getMinutes(), 0, 0);
  
      // If the selected time has already passed for today, schedule for tomorrow
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 1);
      }
  
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.getHours(),
        minute: time.getMinutes(),
      };
  
      // Schedule the notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for Your Daily Reflection",
          body: "Take a moment to reflect on your journey today.",
          data: { screen: 'create' },
        },
        trigger,
      });
  
      this.notificationIdentifier = identifier;
  
      // Save user settings in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          reminder_enabled: enabled,
          reminder_time: time.toISOString(),
          notification_id: identifier,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });
  
      if (error) throw error;
  
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }
  
  

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      this.notificationIdentifier = null;
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIdentifier = null;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getCurrentSettings(): Promise<{
    enabled: boolean;
    time: Date | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('reminder_enabled, reminder_time')
        .single();

      if (error) throw error;

      return {
        enabled: data?.reminder_enabled ?? false,
        time: data?.reminder_time ? new Date(data.reminder_time) : null,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { enabled: false, time: null };
    }
  }
}

export const notificationService = NotificationService.getInstance(); 