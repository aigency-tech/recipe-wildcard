import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeArea } from '../../../src/components/SafeArea';
import { RecipeCard } from '../../../src/components/recipe/RecipeCard';
import { GuestBanner } from '../../../src/components/auth/EmailAuthForm';
import { useRecipes } from '../../../src/hooks/useRecipes';
import { CUISINE_OPTIONS } from '../../../src/lib/constants';

export default function HomeScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | undefined>();
  const { recipes, isLoading, refresh } = useRecipes({
    cuisine: selectedCuisine,
    limit: 20,
  });

  const cuisineFilters = ['All', ...CUISINE_OPTIONS];

  return (
    <SafeArea className="flex-1 bg-white" edges={['bottom']}>
      <GuestBanner />

      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          Discover Recipes
        </Text>
        <Text className="text-gray-500 mt-1">
          Find your next culinary adventure
        </Text>
      </View>

      <View className="h-12 mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {cuisineFilters.map((cuisine) => {
            const isSelected =
              cuisine === 'All' ? !selectedCuisine : selectedCuisine === cuisine;

            return (
              <TouchableOpacity
                key={cuisine}
                onPress={() =>
                  setSelectedCuisine(cuisine === 'All' ? undefined : cuisine)
                }
                className={`mr-2 px-4 py-2 rounded-full ${
                  isSelected ? 'bg-primary-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`font-medium ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="px-4 mb-4">
            <RecipeCard
              recipe={item}
              variant={index === 0 ? 'featured' : 'default'}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            {isLoading ? (
              <Text className="text-gray-500">Loading recipes...</Text>
            ) : (
              <>
                <Text className="text-5xl mb-4">🍽️</Text>
                <Text className="text-gray-500 text-center">
                  No recipes found.{'\n'}Be the first to create one!
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeArea>
  );
}
