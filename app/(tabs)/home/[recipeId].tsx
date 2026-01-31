import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeArea } from '../../../src/components/SafeArea';
import { Card } from '../../../src/components/ui/Card';
import { Badge, WildcardBadge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { IngredientList } from '../../../src/components/recipe/IngredientList';
import { InstructionList } from '../../../src/components/recipe/InstructionList';
import { useRecipe } from '../../../src/hooks/useRecipes';
import { useAuthStore } from '../../../src/stores/authStore';
import { useRecipeStore } from '../../../src/stores/recipeStore';
import { DIFFICULTY_LABELS } from '../../../src/lib/constants';

export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const { recipe, isLoading } = useRecipe(recipeId);
  const { user } = useAuthStore();
  const { saveRecipe, unsaveRecipe, checkIfSaved } = useRecipeStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && recipeId) {
      checkIfSaved(recipeId)
        .then(setIsSaved)
        .catch((err) => {
          console.error('Error checking saved status:', err);
          setIsSaved(false);
        });
    }
  }, [user, recipeId]);

  const handleSaveToggle = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save recipes', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!recipeId) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveRecipe(recipeId);
        setIsSaved(false);
      } else {
        await saveRecipe(recipeId);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    try {
      await Share.share({
        title: recipe.title,
        message: `Check out this recipe: ${recipe.title}\n\n${recipe.description}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading || !recipe) {
    return (
      <SafeArea className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading recipe...</Text>
      </SafeArea>
    );
  }

  const totalTime =
    (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
  const hasWildcard = recipe.source === 'wildcard_modified';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
            >
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={handleSaveToggle}
                disabled={isSaving}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
              >
                <Text className="text-xl">{isSaved ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
              >
                <Text className="text-xl">↗️</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-white">
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-72"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-72 bg-gray-100 items-center justify-center">
            <Text className="text-6xl">🍽️</Text>
          </View>
        )}

        <View className="p-4 -mt-6">
          <Card variant="elevated" className="mb-4">
            {hasWildcard && <WildcardBadge className="mb-2" />}

            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </Text>

            <Text className="text-gray-600 mb-4">{recipe.description}</Text>

            <View className="flex-row flex-wrap gap-2 mb-4">
              {recipe.cuisine && (
                <Badge variant="secondary">{recipe.cuisine}</Badge>
              )}
              {recipe.difficulty && (
                <Badge variant="default">
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </Badge>
              )}
            </View>

            <View className="flex-row justify-between border-t border-gray-100 pt-4">
              {recipe.prep_time_minutes && (
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Prep</Text>
                  <Text className="font-semibold text-gray-900">
                    {recipe.prep_time_minutes}m
                  </Text>
                </View>
              )}
              {recipe.cook_time_minutes && (
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Cook</Text>
                  <Text className="font-semibold text-gray-900">
                    {recipe.cook_time_minutes}m
                  </Text>
                </View>
              )}
              {totalTime > 0 && (
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Total</Text>
                  <Text className="font-semibold text-gray-900">
                    {totalTime}m
                  </Text>
                </View>
              )}
              {recipe.servings && (
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Servings</Text>
                  <Text className="font-semibold text-gray-900">
                    {recipe.servings}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-3">
              Ingredients
            </Text>
            <IngredientList ingredients={recipe.ingredients || []} />
          </View>

          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-3">
              Instructions
            </Text>
            <InstructionList instructions={recipe.instructions || []} />
          </View>

          {recipe.author && (
            <View className="flex-row items-center py-4 border-t border-gray-100">
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                {recipe.author.avatar_url ? (
                  <Image
                    source={{ uri: recipe.author.avatar_url }}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <Text className="text-lg">👤</Text>
                )}
              </View>
              <View>
                <Text className="text-sm text-gray-500">Created by</Text>
                <Text className="font-medium text-gray-900">
                  {recipe.author.username || 'Anonymous'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
