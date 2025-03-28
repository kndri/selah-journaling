import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#FFFDF7',
          },
          default: {
            backgroundColor: '#FFFDF7',
          },
        }),
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Foundation name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="journal" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
