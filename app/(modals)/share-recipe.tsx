import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeArea } from '../../src/components/SafeArea';
import { Button } from '../../src/components/ui/Button';

export default function ShareRecipeModal() {
  const router = useRouter();
  const { recipeId, title } = useLocalSearchParams<{
    recipeId: string;
    title: string;
  }>();

  const handleShare = async (platform: string) => {
    try {
      const message = `Check out this recipe: ${title || 'Amazing Recipe'}\n\nDiscover more at Recipe Wildcard!`;

      await Share.share({
        message,
        title: title || 'Recipe',
      });

      router.back();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Share Recipe',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeArea className="flex-1 bg-white" edges={['bottom']}>
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Share "{title || 'Recipe'}"
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => handleShare('copy')}
              className="flex-row items-center bg-gray-50 rounded-xl p-4"
            >
              <Text className="text-2xl mr-4">📋</Text>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Copy Link</Text>
                <Text className="text-gray-500 text-sm">
                  Copy recipe link to clipboard
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare('message')}
              className="flex-row items-center bg-gray-50 rounded-xl p-4"
            >
              <Text className="text-2xl mr-4">💬</Text>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Messages</Text>
                <Text className="text-gray-500 text-sm">
                  Share via text message
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare('more')}
              className="flex-row items-center bg-gray-50 rounded-xl p-4"
            >
              <Text className="text-2xl mr-4">↗️</Text>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">More Options</Text>
                <Text className="text-gray-500 text-sm">
                  Share via other apps
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Button variant="outline" onPress={() => router.back()} className="mt-6">
            Cancel
          </Button>
        </View>
      </SafeArea>
    </>
  );
}
