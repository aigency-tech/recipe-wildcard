import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>
        {icon}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary.DEFAULT,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarPosition: 'top',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderBottomWidth: 0,
          paddingTop: insets.top + 4,
          paddingBottom: 8,
          height: insets.top + 56,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Main visible tabs */}
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wildcard/index"
        options={{
          title: 'Wildcard',
          tabBarIcon: ({ focused }) => <TabIcon icon="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved/index"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon icon="💾" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="home/[recipeId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="create/upload"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Upload Recipe',
        }}
      />
      <Tabs.Screen
        name="create/ai-generate"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'AI Recipe Generator',
        }}
      />
      <Tabs.Screen
        name="create/import-url"
        options={{
          href: null,
          headerShown: true,
          headerTitle: 'Import from URL',
        }}
      />
    </Tabs>
  );
}
