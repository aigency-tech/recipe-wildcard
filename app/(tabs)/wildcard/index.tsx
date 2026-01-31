import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeArea } from '../../../src/components/SafeArea';
import { Card } from '../../../src/components/ui/Card';
import { Badge, WildcardBadge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import {
  WildcardSuggestionCard,
  WildcardCatalogItem,
  WildcardInput,
} from '../../../src/components/wildcard/WildcardSuggestion';
import { Modal } from '../../../src/components/ui/Modal';
import { useWildcard, useWildcardCategories } from '../../../src/hooks/useWildcard';
import { CUISINE_OPTIONS } from '../../../src/lib/constants';
import type { WildcardIngredient } from '../../../src/types';

export default function WildcardScreen() {
  const {
    catalog,
    currentSuggestion,
    isLoading,
    getSuggestion,
    clearSuggestion,
  } = useWildcard();
  const categories = useWildcardCategories();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WildcardIngredient | null>(null);
  const ingredientInputRef = useRef<TextInputType>(null);

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
      ingredientInputRef.current?.focus();
    } else if (!trimmed) {
      ingredientInputRef.current?.focus();
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGetSuggestion = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Add Ingredients', 'Please add at least one ingredient to get suggestions');
      return;
    }

    try {
      await getSuggestion(ingredients, cuisine || undefined);
    } catch (error) {
      Alert.alert('Error', 'Failed to get suggestion. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#FAF5FF', '#E9D5FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeArea className="flex-1" edges={['bottom']}>
        <ScrollView className="flex-1">
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold text-gray-900 mr-2">
                    Wildcard
                  </Text>
                  <Text className="text-2xl">✨</Text>
                </View>
                <Text className="text-wildcard-600 mt-1">
                  Discover unexpected ingredients
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCatalog(true)}
                className="bg-wildcard-500 px-3 py-2 rounded-full"
              >
                <Text className="text-white font-medium">Browse All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 py-4">
            {currentSuggestion ? (
              <WildcardSuggestionCard
                suggestion={currentSuggestion}
                onDismiss={() => {
                  clearSuggestion();
                }}
                onUse={() => {
                  Alert.alert(
                    'Add to Recipe',
                    `Add ${currentSuggestion.ingredient.name} to your recipe?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Copy Name',
                        onPress: () => {
                          Alert.alert('Copied', currentSuggestion.ingredient.name);
                        },
                      },
                    ]
                  );
                }}
              />
            ) : (
              <Card variant="elevated">
                <View className="items-center mb-4">
                  <View className="w-20 h-20 rounded-full bg-wildcard-100 items-center justify-center mb-3">
                    <Text className="text-4xl">✨</Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-900">
                    Get a Wildcard Suggestion
                  </Text>
                  <Text className="text-gray-500 text-center mt-1">
                    Enter your ingredients and we'll suggest something unexpected
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Your Ingredients
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {ingredients.map((ing, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => removeIngredient(index)}
                        className="bg-white px-3 py-2 rounded-full flex-row items-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                      >
                        <Text className="text-gray-700 mr-1">{ing}</Text>
                        <Text className="text-gray-400">×</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View className="flex-row">
                    <TextInput
                      ref={ingredientInputRef}
                      className="flex-1 bg-white rounded-xl px-4 py-3 mr-2"
                      placeholder="Add ingredient..."
                      value={newIngredient}
                      onChangeText={setNewIngredient}
                      onSubmitEditing={addIngredient}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={addIngredient}
                      className="bg-secondary-500 w-12 rounded-xl items-center justify-center"
                    >
                      <Text className="text-white text-xl">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Cuisine Style (optional)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {CUISINE_OPTIONS.slice(0, 6).map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setCuisine(cuisine === c ? '' : c)}
                          className={`px-3 py-2 rounded-full ${
                            cuisine === c ? 'bg-wildcard-500' : 'bg-white'
                          }`}
                        >
                          <Text
                            className={cuisine === c ? 'text-white' : 'text-gray-700'}
                          >
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <Button
                  variant="wildcard"
                  size="lg"
                  onPress={handleGetSuggestion}
                  isLoading={isLoading}
                  disabled={ingredients.length === 0}
                >
                  Get Wildcard Suggestion
                </Button>
              </Card>
            )}
          </View>

          <View className="px-4 py-4">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Popular Wildcards
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {catalog.slice(0, 5).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedItem(item)}
                    className="w-36"
                  >
                    <Card variant="outlined" padding="sm">
                      <Text className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </Text>
                      <View className="flex-row flex-wrap gap-1">
                        {item.flavor_profile.slice(0, 2).map((f) => (
                          <Badge key={f} variant="secondary" size="sm">
                            {f}
                          </Badge>
                        ))}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        <Modal
          isOpen={showCatalog}
          onClose={() => setShowCatalog(false)}
          title="Wildcard Catalog"
          size="full"
        >
          <ScrollView className="max-h-96">
            {categories.map((category) => (
              <View key={category.name} className="mb-4">
                <Text className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </Text>
                {category.items.map((item) => (
                  <WildcardCatalogItem
                    key={item.id}
                    ingredient={item}
                    onPress={() => {
                      setSelectedItem(item);
                      setShowCatalog(false);
                    }}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </Modal>

        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem?.name || ''}
          size="md"
        >
          {selectedItem && (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Badge variant="secondary">{selectedItem.category}</Badge>
                <Badge
                  variant={
                    selectedItem.intensity === 'bold'
                      ? 'primary'
                      : selectedItem.intensity === 'medium'
                      ? 'accent'
                      : 'default'
                  }
                >
                  {selectedItem.intensity}
                </Badge>
              </View>

              <Text className="text-gray-600 mb-4">{selectedItem.description}</Text>

              <View className="bg-secondary-50 rounded-xl p-3 mb-3">
                <Text className="text-sm font-medium text-secondary-700 mb-1">
                  Usage Tips
                </Text>
                <Text className="text-gray-800">{selectedItem.usage_tips}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Flavor Profile
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedItem.flavor_profile.map((f) => (
                    <Badge key={f} variant="secondary" size="sm">
                      {f}
                    </Badge>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Pairs Well With
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedItem.pairs_with.map((p) => (
                    <Badge key={p} variant="outline" size="sm">
                      {p}
                    </Badge>
                  ))}
                </View>
              </View>

              <Button variant="wildcard" onPress={() => setSelectedItem(null)}>
                Got It
              </Button>
            </View>
          )}
        </Modal>
      </SafeArea>
    </LinearGradient>
  );
}
