import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';

interface EmailAuthFormProps {
  mode: 'login' | 'register';
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async () => {
    clearError();

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      try {
        await signUp({ email, password, username: username.trim() || undefined });
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/home') }]
        );
      } catch {
        Alert.alert('Error', error || 'Failed to create account');
      }
    } else {
      try {
        await signIn({ email, password });
        router.replace('/home');
      } catch {
        Alert.alert('Error', error || 'Failed to sign in');
      }
    }
  };

  return (
    <View className="space-y-4">
      {mode === 'register' && (
        <Input
          label="Username (optional)"
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />

      <Input
        label="Password"
        placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === 'register' ? 'password-new' : 'password'}
      />

      {mode === 'register' && (
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
        />
      )}

      <Button
        variant="primary"
        size="lg"
        onPress={handleSubmit}
        isLoading={isLoading}
        className="mt-2"
      >
        {mode === 'register' ? 'Create Account' : 'Sign In'}
      </Button>

      {mode === 'login' && (
        <TouchableOpacity
          onPress={() => router.push('/forgot-password')}
          className="py-2"
        >
          <Text className="text-center text-primary-500 font-medium">
            Forgot password?
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface GuestBannerProps {
  message?: string;
}

export function GuestBanner({ message }: GuestBannerProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  if (user) return null;

  return (
    <View className="bg-accent-100 px-4 py-3">
      <Text className="text-accent-800 text-center mb-2">
        {message || 'Sign in to save recipes and unlock all features'}
      </Text>
      <View className="flex-row justify-center space-x-3">
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="bg-accent-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/register')}
          className="bg-white px-4 py-2 rounded-full border border-accent-500"
        >
          <Text className="text-accent-700 font-medium">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
