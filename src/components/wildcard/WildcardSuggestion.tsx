import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { Badge, WildcardBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { WildcardSuggestion as WildcardSuggestionType, WildcardIngredient } from '../../types';

interface WildcardSuggestionCardProps {
  suggestion: WildcardSuggestionType;
  onUse?: () => void;
  onDismiss?: () => void;
}

export function WildcardSuggestionCard({
  suggestion,
  onUse,
  onDismiss,
}: WildcardSuggestionCardProps) {
  const { ingredient, reason, how_to_use, quantity_suggestion } = suggestion;

  return (
    <Card variant="elevated" className="border-2 border-wildcard-200">
      <View className="flex-row items-center justify-between mb-3">
        <WildcardBadge size="md" />
        <Badge variant="outline" size="sm">
          {ingredient.intensity}
        </Badge>
      </View>

      <Text className="text-xl font-bold text-gray-900 mb-1">
        {ingredient.name}
      </Text>

      <Text className="text-gray-600 mb-3">{ingredient.description}</Text>

      <View className="bg-wildcard-50 rounded-xl p-3 mb-3">
        <Text className="text-sm font-medium text-wildcard-700 mb-1">
          Why it works:
        </Text>
        <Text className="text-wildcard-900">{reason}</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-3 mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-1">
          How to use:
        </Text>
        <Text className="text-gray-800">{how_to_use}</Text>
      </View>

      <View className="flex-row items-center mb-4">
        <Text className="text-sm text-gray-500 mr-2">Suggested amount:</Text>
        <Text className="font-medium text-gray-900">{quantity_suggestion}</Text>
      </View>

      <View className="flex-row flex-wrap gap-2 mb-4">
        {ingredient.flavor_profile.map((flavor) => (
          <Badge key={flavor} variant="secondary" size="sm">
            {flavor}
          </Badge>
        ))}
      </View>

      <View className="flex-row space-x-3">
        {onDismiss && (
          <Button variant="outline" onPress={onDismiss} className="flex-1">
            Try Another
          </Button>
        )}
        {onUse && (
          <Button variant="wildcard" onPress={onUse} className="flex-1">
            Use This
          </Button>
        )}
      </View>
    </Card>
  );
}

interface WildcardCatalogItemProps {
  ingredient: WildcardIngredient;
  onPress: () => void;
}

export function WildcardCatalogItem({
  ingredient,
  onPress,
}: WildcardCatalogItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-900">
            {ingredient.name}
          </Text>
          <Badge
            variant={
              ingredient.intensity === 'bold'
                ? 'primary'
                : ingredient.intensity === 'medium'
                ? 'accent'
                : 'default'
            }
            size="sm"
          >
            {ingredient.intensity}
          </Badge>
        </View>

        <Text className="text-gray-600 mb-2" numberOfLines={2}>
          {ingredient.description}
        </Text>

        <View className="flex-row flex-wrap gap-1">
          {ingredient.flavor_profile.slice(0, 3).map((flavor) => (
            <Badge key={flavor} variant="secondary" size="sm">
              {flavor}
            </Badge>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

interface WildcardInputProps {
  ingredients: string[];
  onGetSuggestion: () => void;
  isLoading: boolean;
}

export function WildcardInput({
  ingredients,
  onGetSuggestion,
  isLoading,
}: WildcardInputProps) {
  return (
    <Card variant="elevated" className="items-center">
      <View className="w-16 h-16 rounded-full bg-wildcard-100 items-center justify-center mb-4">
        <Text className="text-3xl">*</Text>
      </View>

      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        Get a Wildcard Ingredient
      </Text>

      <Text className="text-gray-600 text-center mb-4">
        {ingredients.length > 0
          ? `Based on your ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''}, we'll suggest something unexpected.`
          : 'Enter some ingredients to get a surprising suggestion that will elevate your dish.'}
      </Text>

      <Button
        variant="wildcard"
        size="lg"
        onPress={onGetSuggestion}
        isLoading={isLoading}
        disabled={ingredients.length === 0}
        className="w-full"
      >
        Suggest Wildcard
      </Button>
    </Card>
  );
}
