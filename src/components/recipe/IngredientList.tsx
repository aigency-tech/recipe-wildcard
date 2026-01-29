import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { clsx } from 'clsx';
import { WildcardBadge } from '../ui/Badge';
import type { Ingredient } from '../../types';

interface IngredientListProps {
  ingredients: Ingredient[];
  onWildcardPress?: (ingredient: Ingredient) => void;
}

export function IngredientList({ ingredients, onWildcardPress }: IngredientListProps) {
  return (
    <View className="space-y-2">
      {ingredients.map((ingredient) => (
        <IngredientItem
          key={ingredient.id}
          ingredient={ingredient}
          onWildcardPress={onWildcardPress}
        />
      ))}
    </View>
  );
}

interface IngredientItemProps {
  ingredient: Ingredient;
  onWildcardPress?: (ingredient: Ingredient) => void;
}

function IngredientItem({ ingredient, onWildcardPress }: IngredientItemProps) {
  const content = (
    <View
      className={clsx(
        'flex-row items-center py-2 px-3 rounded-xl',
        ingredient.is_wildcard ? 'bg-wildcard-50' : 'bg-gray-50'
      )}
    >
      <View
        className={clsx(
          'w-2 h-2 rounded-full mr-3',
          ingredient.is_wildcard ? 'bg-wildcard-400' : 'bg-gray-400'
        )}
      />
      <View className="flex-1">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-gray-600 mr-1">
            {ingredient.quantity} {ingredient.unit}
          </Text>
          <Text className="font-medium text-gray-900">{ingredient.name}</Text>
          {ingredient.is_wildcard && (
            <WildcardBadge size="sm" className="ml-2" />
          )}
        </View>
        {ingredient.is_wildcard && ingredient.wildcard_reason && (
          <Text className="text-sm text-wildcard-600 mt-1">
            {ingredient.wildcard_reason}
          </Text>
        )}
      </View>
    </View>
  );

  if (ingredient.is_wildcard && onWildcardPress) {
    return (
      <TouchableOpacity
        onPress={() => onWildcardPress(ingredient)}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

interface EditableIngredientListProps {
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    is_wildcard: boolean;
  }>;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

export function EditableIngredientList({
  ingredients,
  onRemove,
  onEdit,
}: EditableIngredientListProps) {
  return (
    <View className="space-y-2">
      {ingredients.map((ingredient, index) => (
        <View
          key={index}
          className={clsx(
            'flex-row items-center py-2 px-3 rounded-xl',
            ingredient.is_wildcard ? 'bg-wildcard-50' : 'bg-gray-50'
          )}
        >
          <TouchableOpacity onPress={() => onEdit(index)} className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-gray-600 mr-1">
                {ingredient.quantity} {ingredient.unit}
              </Text>
              <Text className="font-medium text-gray-900">{ingredient.name}</Text>
              {ingredient.is_wildcard && (
                <WildcardBadge size="sm" className="ml-2" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(index)}
            className="ml-2 p-1"
          >
            <Text className="text-gray-400 text-lg">x</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
