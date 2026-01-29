import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeArea } from '../../../src/components/SafeArea';
import { Card } from '../../../src/components/ui/Card';

export default function CreateScreen() {
  return (
    <SafeArea className="flex-1 bg-white" edges={['bottom']}>
      <View className="px-4 pt-4 pb-6">
        <Text className="text-2xl font-bold text-gray-900">Create Recipe</Text>
        <Text className="text-gray-500 mt-1">
          Share your culinary creations with the world
        </Text>
      </View>

      <View className="px-4" style={{ gap: 16 }}>
        <Link href="/(tabs)/create/upload" asChild>
          <Pressable>
            <Card variant="elevated">
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mr-4">
                  <Text className="text-3xl">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    Upload Recipe File
                  </Text>
                  <Text className="text-gray-500 mt-1">
                    Upload a text file and optionally add wildcard ingredients
                  </Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
              </View>
            </Card>
          </Pressable>
        </Link>

        <Link href="/(tabs)/create/ai-generate" asChild>
          <Pressable>
            <Card variant="elevated">
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl bg-secondary-100 items-center justify-center mr-4">
                  <Text className="text-3xl">🤖</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    AI Generate
                  </Text>
                  <Text className="text-gray-500 mt-1">
                    Describe what you want and let AI create the recipe
                  </Text>
                </View>
                <Text className="text-gray-400 text-xl">→</Text>
              </View>
            </Card>
          </Pressable>
        </Link>

      </View>

      <View className="px-4 mt-8">
        <View className="bg-gray-50 rounded-2xl p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            💡 Pro Tip
          </Text>
          <Text className="text-gray-600 text-sm">
            Try adding a Wildcard ingredient to make your recipes stand out!
            Our AI suggests unexpected ingredients backed by food science that
            add unique flavor dimensions.
          </Text>
        </View>
      </View>
    </SafeArea>
  );
}
