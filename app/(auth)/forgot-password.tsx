import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeArea } from '../../src/components/SafeArea';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Reset Password' }} />
      <SafeArea className="flex-1 bg-white" edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8">
            {submitted ? (
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-secondary-100 items-center justify-center mb-4">
                  <Text className="text-4xl">📧</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Check Your Email
                </Text>
                <Text className="text-gray-500 text-center mb-8">
                  We've sent a password reset link to{'\n'}
                  <Text className="font-medium text-gray-700">{email}</Text>
                </Text>
                <Button
                  variant="primary"
                  onPress={() => router.replace('/login')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="mt-4"
                >
                  Try a different email
                </Button>
              </View>
            ) : (
              <>
                <View className="items-center mb-8">
                  <View className="w-20 h-20 rounded-full bg-accent-100 items-center justify-center mb-4">
                    <Text className="text-4xl">🔑</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-900">
                    Forgot Password?
                  </Text>
                  <Text className="text-gray-500 mt-1 text-center">
                    No worries! Enter your email and we'll send you a reset link
                  </Text>
                </View>

                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleResetPassword}
                  isLoading={isLoading}
                  className="mt-6"
                >
                  Send Reset Link
                </Button>

                <Button
                  variant="ghost"
                  onPress={() => router.back()}
                  className="mt-4"
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </SafeArea>
    </>
  );
}
