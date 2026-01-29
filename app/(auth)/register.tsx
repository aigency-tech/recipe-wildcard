import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeArea } from '../../src/components/SafeArea';
import { EmailAuthForm } from '../../src/components/auth/EmailAuthForm';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Create Account' }} />
      <SafeArea className="flex-1 bg-white" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8">
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-secondary-100 items-center justify-center mb-4">
                <Text className="text-4xl">✨</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                Join Recipe Wildcard
              </Text>
              <Text className="text-gray-500 mt-1 text-center">
                Create an account to save recipes and share your creations
              </Text>
            </View>

            <EmailAuthForm mode="register" />

            <View className="flex-row items-center justify-center mt-8">
              <Text className="text-gray-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text className="text-primary-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.replace('/home')}
              className="mt-6 py-3"
            >
              <Text className="text-center text-gray-500">
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeArea>
    </>
  );
}
