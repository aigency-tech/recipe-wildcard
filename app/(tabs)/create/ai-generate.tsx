import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeArea } from '../../../src/components/SafeArea';
import { Input, TextArea } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Badge, WildcardBadge } from '../../../src/components/ui/Badge';
import { RecipeCard } from '../../../src/components/recipe/RecipeCard';
import { generateRecipe } from '../../../src/lib/gemini';
import { useCreateRecipe, useSavedRecipes } from '../../../src/hooks/useRecipes';
import { CUISINE_OPTIONS, DIETARY_OPTIONS } from '../../../src/lib/constants';
import type { CreateRecipeInput } from '../../../src/types';

export default function AIGenerateScreen() {
  const router = useRouter();
  const { createRecipe, isLoading: isSaving } = useCreateRecipe();
  const { saveRecipe: bookmarkRecipe } = useSavedRecipes();

  const [prompt, setPrompt] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [includeWildcard, setIncludeWildcard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<CreateRecipeInput | null>(null);

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please describe what kind of recipe you want');
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);

    try {
      const recipe = await generateRecipe({
        prompt: prompt.trim(),
        cuisine: cuisine || undefined,
        dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
        include_wildcard: includeWildcard,
        difficulty: difficulty || undefined,
      });

      setGeneratedRecipe(recipe);
    } catch (error: any) {
      console.error('Generate error:', error);
      const errorMessage = error?.message || 'Failed to generate recipe. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedRecipe) return;

    try {
      const recipe = await createRecipe(generatedRecipe);
      // Also bookmark the recipe to user's saved list
      try {
        await bookmarkRecipe(recipe.id);
      } catch (bookmarkError) {
        // Silently fail if bookmarking fails (user might not be logged in)
        console.log('Could not bookmark recipe:', bookmarkError);
      }
      Alert.alert('Success', 'Recipe saved successfully!', [
        { text: 'View Recipe', onPress: () => router.push(`/home/${recipe.id}`) },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const handleRegenerate = () => {
    setGeneratedRecipe(null);
    handleGenerate();
  };

  return (
    <SafeArea className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1 p-4">
          {!generatedRecipe ? (
            <>
              <View className="mb-6">
                <TextArea
                  label="Describe your recipe"
                  placeholder="E.g., A creamy pasta dish with mushrooms and garlic, or a healthy breakfast bowl with fruits and nuts..."
                  value={prompt}
                  onChangeText={setPrompt}
                  rows={4}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Cuisine (optional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {CUISINE_OPTIONS.slice(0, 8).map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setCuisine(cuisine === c ? '' : c)}
                        className={`px-3 py-2 rounded-full ${
                          cuisine === c ? 'bg-secondary-500' : 'bg-gray-100'
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

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Difficulty (optional)
                </Text>
                <View className="flex-row gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDifficulty(difficulty === d ? '' : d)}
                      className={`px-4 py-2 rounded-full ${
                        difficulty === d ? 'bg-secondary-500' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={difficulty === d ? 'text-white' : 'text-gray-700'}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions (optional)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((restriction) => (
                    <TouchableOpacity
                      key={restriction}
                      onPress={() => toggleDietaryRestriction(restriction)}
                      className={`px-3 py-2 rounded-full ${
                        dietaryRestrictions.includes(restriction)
                          ? 'bg-secondary-500'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={
                          dietaryRestrictions.includes(restriction)
                            ? 'text-white'
                            : 'text-gray-700'
                        }
                      >
                        {restriction}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIncludeWildcard(!includeWildcard)}
                className="mb-6"
              >
                <Card
                  className={`border-2 ${
                    includeWildcard
                      ? 'bg-wildcard-50 border-wildcard-300'
                      : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                        includeWildcard
                          ? 'bg-wildcard-500 border-wildcard-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {includeWildcard && (
                        <Text className="text-white text-xs font-bold">✓</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-semibold text-gray-900 mr-2">
                          Include Wildcard Ingredient
                        </Text>
                        <WildcardBadge size="sm" />
                      </View>
                      <Text className="text-gray-500 text-sm mt-1">
                        Add an unexpected ingredient that elevates the dish
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>

              <Button
                variant="primary"
                size="lg"
                onPress={handleGenerate}
                isLoading={isGenerating}
                className="mb-4"
              >
                Generate Recipe
              </Button>
            </>
          ) : (
            <>
              <Card variant="elevated" className="mb-4">
                {generatedRecipe.source === 'wildcard_modified' && (
                  <WildcardBadge className="mb-2" />
                )}
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {generatedRecipe.title}
                </Text>
                <Text className="text-gray-600 mb-4">
                  {generatedRecipe.description}
                </Text>

                <View className="flex-row flex-wrap gap-2 mb-4">
                  {generatedRecipe.cuisine && (
                    <Badge variant="secondary">{generatedRecipe.cuisine}</Badge>
                  )}
                  {generatedRecipe.difficulty && (
                    <Badge variant="default">{generatedRecipe.difficulty}</Badge>
                  )}
                  {(generatedRecipe.prep_time_minutes || 0) +
                    (generatedRecipe.cook_time_minutes || 0) >
                    0 && (
                    <Badge variant="outline">
                      {(generatedRecipe.prep_time_minutes || 0) +
                        (generatedRecipe.cook_time_minutes || 0)}{' '}
                      min
                    </Badge>
                  )}
                </View>

                <Text className="font-semibold text-gray-900 mb-2">
                  Ingredients ({generatedRecipe.ingredients.length})
                </Text>
                {generatedRecipe.ingredients.map((ing, index) => (
                  <View
                    key={index}
                    className={`flex-row items-center py-2 px-3 rounded-lg mb-1 ${
                      ing.is_wildcard ? 'bg-wildcard-50' : 'bg-gray-50'
                    }`}
                  >
                    <Text className="text-gray-600 mr-1">
                      {ing.quantity} {ing.unit}
                    </Text>
                    <Text className="font-medium text-gray-900">{ing.name}</Text>
                    {ing.is_wildcard && <WildcardBadge size="sm" className="ml-2" />}
                  </View>
                ))}

                <Text className="font-semibold text-gray-900 mt-4 mb-2">
                  Instructions ({generatedRecipe.instructions.length} steps)
                </Text>
                {generatedRecipe.instructions.map((inst, index) => (
                  <View key={index} className="flex-row py-2">
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                      <Text className="text-white text-xs font-bold">
                        {inst.step_number}
                      </Text>
                    </View>
                    <Text className="flex-1 text-gray-700">{inst.content}</Text>
                  </View>
                ))}
              </Card>

              <View className="flex-row gap-3 mb-4">
                <Button
                  variant="outline"
                  onPress={handleRegenerate}
                  isLoading={isGenerating}
                  className="flex-1"
                >
                  Regenerate
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSave}
                  isLoading={isSaving}
                  className="flex-1"
                >
                  Save Recipe
                </Button>
              </View>

              <Button
                variant="ghost"
                onPress={() => setGeneratedRecipe(null)}
                className="mb-4"
              >
                Start Over
              </Button>
            </>
          )}
        </ScrollView>
    </SafeArea>
  );
}
