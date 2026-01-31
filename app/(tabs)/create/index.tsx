import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeArea } from '../../../src/components/SafeArea';
import { RecipeCard } from '../../../src/components/recipe/RecipeCard';
import { GuestBanner } from '../../../src/components/auth/EmailAuthForm';
import { useRecipes } from '../../../src/hooks/useRecipes';
import { CUISINE_OPTIONS } from '../../../src/lib/constants';

export default function DiscoverScreen() {
  const [selectedCuisine, setSelectedCuisine] = useState<string | undefined>();
  const { recipes, isLoading, refresh } = useRecipes({
    cuisine: selectedCuisine,
    limit: 20,
  });

  const cuisineFilters = ['All', ...CUISINE_OPTIONS];

  return (
    <LinearGradient
      colors={['#FFF5F4', '#E0FAF7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeArea className="flex-1" edges={['bottom']}>
        <GuestBanner />

        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">
            Discover Recipes
          </Text>
          <Text className="text-primary-600 mt-1">
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
                    isSelected ? 'bg-secondary-500' : 'bg-white'
                  }`}
                  style={!isSelected ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : {}}
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
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor="#00C9B7"
              colors={['#00C9B7', '#FF6F61']}
            />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              {isLoading ? (
                <Text className="text-secondary-600">Loading recipes...</Text>
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
    </LinearGradient>
  );
}
