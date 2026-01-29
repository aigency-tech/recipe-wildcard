import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Badge, WildcardBadge } from '../ui/Badge';
import type { Recipe } from '../../types';
import { DIFFICULTY_LABELS } from '../../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'default' | 'compact' | 'featured';
  onPress?: () => void;
}

export function RecipeCard({ recipe, variant = 'default', onPress }: RecipeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/home/${recipe.id}`);
    }
  };

  const hasWildcard = recipe.source === 'wildcard_modified';
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card variant="outlined" padding="sm" className="flex-row">
          {recipe.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
              <Text className="text-2xl">🍽️</Text>
            </View>
          )}
          <View className="flex-1 ml-3 justify-center">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {recipe.title}
            </Text>
            <View className="flex-row items-center mt-1">
              {hasWildcard && <WildcardBadge size="sm" className="mr-2" />}
              {totalTime > 0 && (
                <Text className="text-sm text-gray-500">{totalTime} min</Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card variant="elevated" padding="none" className="overflow-hidden">
          {recipe.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 items-center justify-center">
              <Text className="text-5xl">🍽️</Text>
            </View>
          )}
          <View className="p-4">
            {hasWildcard && <WildcardBadge size="sm" className="mb-2" />}
            <Text className="text-xl font-bold text-gray-900">{recipe.title}</Text>
            <Text className="text-gray-600 mt-1" numberOfLines={2}>
              {recipe.description}
            </Text>
            <View className="flex-row items-center mt-3 flex-wrap gap-2">
              {recipe.cuisine && (
                <Badge variant="secondary" size="sm">
                  {recipe.cuisine}
                </Badge>
              )}
              {recipe.difficulty && (
                <Badge variant="default" size="sm">
                  {DIFFICULTY_LABELS[recipe.difficulty]}
                </Badge>
              )}
              {totalTime > 0 && (
                <Badge variant="outline" size="sm">
                  {totalTime} min
                </Badge>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card variant="elevated" padding="none" className="overflow-hidden">
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-100 items-center justify-center">
            <Text className="text-4xl">🍽️</Text>
          </View>
        )}
        <View className="p-3">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-semibold text-gray-900 flex-1"
              numberOfLines={1}
            >
              {recipe.title}
            </Text>
            {hasWildcard && <WildcardBadge size="sm" className="ml-2" />}
          </View>
          <View className="flex-row items-center mt-2 gap-2">
            {recipe.cuisine && (
              <Badge variant="secondary" size="sm">
                {recipe.cuisine}
              </Badge>
            )}
            {totalTime > 0 && (
              <Text className="text-sm text-gray-500">{totalTime} min</Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
