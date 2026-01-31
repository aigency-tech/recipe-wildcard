import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeArea } from '../../../src/components/SafeArea';
import { RecipeCard } from '../../../src/components/recipe/RecipeCard';
import { Button } from '../../../src/components/ui/Button';
import { useSavedRecipes } from '../../../src/hooks/useRecipes';
import { useAuth } from '../../../src/hooks/useAuth';

export default function SavedScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { savedRecipes, isLoading, refresh } = useSavedRecipes();

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#FFF8EB', '#FFEFD1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeArea className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-accent-100 items-center justify-center mb-4">
            <Text className="text-5xl">💾</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Sign in to Save Recipes
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Create an account to save your favorite recipes and access them anytime
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
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FFF8EB', '#E0FAF7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeArea className="flex-1" edges={['bottom']}>
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Saved Recipes</Text>
          <Text className="text-accent-700 mt-1">
            {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
          </Text>
        </View>

        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.recipe ? (
              <View className="px-4 mb-4">
                <RecipeCard recipe={item.recipe} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor="#FFB347"
              colors={['#FFB347', '#00C9B7']}
            />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              {isLoading ? (
                <Text className="text-accent-600">Loading saved recipes...</Text>
              ) : (
                <>
                  <Text className="text-5xl mb-4">📚</Text>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    No Saved Recipes Yet
                  </Text>
                  <Text className="text-gray-500 text-center px-8 mb-6">
                    Browse recipes and tap the heart to save them for later
                  </Text>
                  <Button
                    variant="secondary"
                    onPress={() => router.push('/home')}
                  >
                    Explore Recipes
                  </Button>
                </>
              )}
            </View>
          }
        />
      </SafeArea>
    </LinearGradient>
  );
}
