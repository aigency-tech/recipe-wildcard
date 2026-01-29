import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeArea } from '../../../src/components/SafeArea';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Modal } from '../../../src/components/ui/Modal';
import { useAuth } from '../../../src/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    updateProfile,
  } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editDisplayName, setEditDisplayName] = useState(
    profile?.display_name || ''
  );
  const [editBio, setEditBio] = useState(profile?.bio || '');

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/home');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        username: editUsername.trim() || undefined,
        display_name: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeArea className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-6">
          <Text className="text-4xl">👤</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">
          Join Recipe Wildcard
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Create an account to save recipes, share your creations, and more
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push('/login')}
          className="w-full mb-3"
        >
          Sign In
        </Button>
        <Button
          variant="outline"
          size="lg"
          onPress={() => router.push('/register')}
          className="w-full"
        >
          Create Account
        </Button>
      </SafeArea>
    );
  }

  return (
    <SafeArea className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-4">Profile</Text>

          <Card variant="elevated" className="mb-4">
            <View className="items-center">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-20 h-20 rounded-full mb-3"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
                  <Text className="text-3xl">
                    {(profile?.display_name || profile?.username || user?.email || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="text-xl font-bold text-gray-900">
                {profile?.display_name || profile?.username || 'User'}
              </Text>
              {profile?.username && profile?.display_name && (
                <Text className="text-gray-500">@{profile.username}</Text>
              )}
              <Text className="text-gray-500 text-sm mt-1">{user?.email}</Text>
              {profile?.bio && (
                <Text className="text-gray-600 text-center mt-3">
                  {profile.bio}
                </Text>
              )}
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  setEditUsername(profile?.username || '');
                  setEditDisplayName(profile?.display_name || '');
                  setEditBio(profile?.bio || '');
                  setShowEditModal(true);
                }}
                className="mt-4"
              >
                Edit Profile
              </Button>
            </View>
          </Card>

          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Settings
            </Text>

            <TouchableOpacity className="bg-gray-50 rounded-xl px-4 py-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">🔔</Text>
                <Text className="text-gray-900">Notifications</Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-50 rounded-xl px-4 py-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">🎨</Text>
                <Text className="text-gray-900">Appearance</Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-50 rounded-xl px-4 py-4 mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">🔒</Text>
                <Text className="text-gray-900">Privacy</Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-50 rounded-xl px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">❓</Text>
                <Text className="text-gray-900">Help & Support</Text>
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>
          </View>

          <Button
            variant="outline"
            onPress={handleSignOut}
            className="mb-8"
          >
            Sign Out
          </Button>

          <View className="items-center pb-8">
            <Text className="text-gray-400 text-sm">Recipe Wildcard v1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <View className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={editUsername}
            onChangeText={setEditUsername}
            autoCapitalize="none"
          />
          <Input
            label="Display Name"
            placeholder="Enter display name"
            value={editDisplayName}
            onChangeText={setEditDisplayName}
          />
          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={editBio}
            onChangeText={setEditBio}
            multiline
          />
          <Button
            variant="primary"
            onPress={handleUpdateProfile}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </View>
      </Modal>
    </SafeArea>
  );
}
