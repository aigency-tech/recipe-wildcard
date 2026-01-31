import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeArea } from '../../../src/components/SafeArea';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Badge, WildcardBadge } from '../../../src/components/ui/Badge';
import { parseRecipeFromUrl, parseRecipeFromText, addWildcardToRecipe } from '../../../src/lib/gemini';
import { useCreateRecipe } from '../../../src/hooks/useRecipes';
import type { CreateRecipeInput } from '../../../src/types';

type Step = 'input' | 'preview' | 'wildcard' | 'final';
type InputMode = 'url' | 'text';

export default function ImportUrlScreen() {
  const router = useRouter();
  const { createRecipe, isLoading: isSaving } = useCreateRecipe();

  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<CreateRecipeInput | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAddingWildcard, setIsAddingWildcard] = useState(false);

  const isValidUrl = (text: string): boolean => {
    try {
      const urlObj = new URL(text);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleParseUrl = async () => {
    if (!url.trim()) {
      Alert.alert('Enter URL', 'Please enter a recipe URL to import');
      return;
    }

    if (!isValidUrl(url.trim())) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    Keyboard.dismiss();
    setIsParsing(true);

    try {
      const recipe = await parseRecipeFromUrl(url.trim());
      setParsedRecipe(recipe);
      setStep('preview');
    } catch (error: any) {
      console.error('Error parsing URL:', error);
      Alert.alert(
        'Could Not Extract Recipe',
        'This website may block automated access. Would you like to paste the recipe text instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Paste Text', onPress: () => setInputMode('text') },
        ]
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseText = async () => {
    if (!recipeText.trim()) {
      Alert.alert('Enter Recipe', 'Please paste the recipe text to import');
      return;
    }

    if (recipeText.trim().length < 50) {
      Alert.alert('More Content Needed', 'Please paste more of the recipe including ingredients and instructions');
      return;
    }

    Keyboard.dismiss();
    setIsParsing(true);

    try {
      const recipe = await parseRecipeFromText(recipeText.trim());
      setParsedRecipe(recipe);
      setStep('preview');
    } catch (error: any) {
      console.error('Error parsing text:', error);
      Alert.alert('Error', error?.message || 'Failed to parse the recipe. Please check the content and try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddWildcard = async () => {
    if (!parsedRecipe) return;

    setIsAddingWildcard(true);
    try {
      const enhancedRecipe = await addWildcardToRecipe(parsedRecipe);
      setParsedRecipe(enhancedRecipe);
      setStep('final');
    } catch (error: any) {
      console.error('Error adding wildcard:', error);
      Alert.alert('Error', error?.message || 'Failed to add wildcard ingredients. Please try again.');
    } finally {
      setIsAddingWildcard(false);
    }
  };

  const handleSkipWildcard = () => {
    setStep('final');
  };

  const handleSaveRecipe = async () => {
    if (!parsedRecipe) return;

    try {
      const recipe = await createRecipe(parsedRecipe);
      Alert.alert('Success', 'Recipe saved successfully!', [
        { text: 'View Recipe', onPress: () => router.push(`/(tabs)/home/${recipe.id}`) },
        { text: 'Import Another', onPress: () => resetForm() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const resetForm = () => {
    setStep('input');
    setInputMode('url');
    setUrl('');
    setRecipeText('');
    setParsedRecipe(null);
  };

  const renderInputStep = () => (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Import Recipe</Text>
      <Text className="text-gray-500 mb-4">
        Import a recipe from the web or paste the text directly
      </Text>

      {/* Mode Toggle */}
      <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setInputMode('url')}
          className={`flex-1 py-3 rounded-lg ${inputMode === 'url' ? 'bg-white' : ''}`}
          style={inputMode === 'url' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : {}}
        >
          <Text className={`text-center font-medium ${inputMode === 'url' ? 'text-primary-600' : 'text-gray-500'}`}>
            From URL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setInputMode('text')}
          className={`flex-1 py-3 rounded-lg ${inputMode === 'text' ? 'bg-white' : ''}`}
          style={inputMode === 'text' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : {}}
        >
          <Text className={`text-center font-medium ${inputMode === 'text' ? 'text-primary-600' : 'text-gray-500'}`}>
            Paste Text
          </Text>
        </TouchableOpacity>
      </View>

      {inputMode === 'url' ? (
        <>
          <Card variant="elevated" className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Recipe URL</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              placeholder="https://example.com/recipe..."
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleParseUrl}
            />
          </Card>

          <Button
            variant="primary"
            size="lg"
            onPress={handleParseUrl}
            isLoading={isParsing}
            disabled={!url.trim()}
          >
            {isParsing ? 'Extracting Recipe...' : 'Import from URL'}
          </Button>

          <View className="mt-6 p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            <Text className="text-sm font-medium text-secondary-800 mb-2">Supported Sites</Text>
            <Text className="text-sm text-secondary-700">
              Works with many recipe websites. If a site doesn't work, try the "Paste Text" option instead.
            </Text>
          </View>
        </>
      ) : (
        <>
          <Card variant="elevated" className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Recipe Text</Text>
            <Text className="text-xs text-gray-500 mb-2">
              Copy the recipe from the website and paste it below (including ingredients and instructions)
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 min-h-[200px]"
              placeholder="Paste your recipe here...

Example:
Chocolate Chip Cookies

Ingredients:
- 2 cups flour
- 1 cup sugar
- 1 cup butter
...

Instructions:
1. Preheat oven to 350°F
2. Mix dry ingredients
..."
              value={recipeText}
              onChangeText={setRecipeText}
              multiline
              textAlignVertical="top"
            />
          </Card>

          <Button
            variant="primary"
            size="lg"
            onPress={handleParseText}
            isLoading={isParsing}
            disabled={!recipeText.trim()}
          >
            {isParsing ? 'Processing Recipe...' : 'Import Recipe'}
          </Button>

          <View className="mt-6 p-4 bg-accent-50 rounded-xl border border-accent-200">
            <Text className="text-sm font-medium text-accent-700 mb-1">Tip</Text>
            <Text className="text-sm text-accent-800">
              Include the recipe title, all ingredients with amounts, and the cooking instructions. Our AI will organize everything automatically.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderPreviewStep = () => (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Recipe Preview</Text>
      <Text className="text-gray-500 mb-4">
        We've extracted your recipe. Review it below.
      </Text>

      {parsedRecipe && (
        <Card variant="elevated" className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {parsedRecipe.title}
          </Text>
          <Text className="text-gray-600 mb-4">{parsedRecipe.description}</Text>

          <View className="mb-4">
            <Badge variant="outline" size="sm">Imported</Badge>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {parsedRecipe.cuisine && (
              <Badge variant="secondary">{parsedRecipe.cuisine}</Badge>
            )}
            {parsedRecipe.difficulty && (
              <Badge variant="default">{parsedRecipe.difficulty}</Badge>
            )}
            {(parsedRecipe.prep_time_minutes || 0) + (parsedRecipe.cook_time_minutes || 0) > 0 && (
              <Badge variant="outline">
                {(parsedRecipe.prep_time_minutes || 0) + (parsedRecipe.cook_time_minutes || 0)} min
              </Badge>
            )}
          </View>

          <Text className="font-semibold text-gray-900 mb-2">
            Ingredients ({parsedRecipe.ingredients.length})
          </Text>
          {parsedRecipe.ingredients.map((ing, index) => (
            <View key={index} className="flex-row items-center py-2 px-3 rounded-lg mb-1 bg-gray-50">
              <Text className="text-gray-600 mr-1">
                {ing.quantity} {ing.unit}
              </Text>
              <Text className="font-medium text-gray-900">{ing.name}</Text>
            </View>
          ))}

          <Text className="font-semibold text-gray-900 mt-4 mb-2">
            Instructions ({parsedRecipe.instructions.length} steps)
          </Text>
          {parsedRecipe.instructions.map((inst, index) => (
            <View key={index} className="flex-row py-2">
              <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">{inst.step_number}</Text>
              </View>
              <Text className="flex-1 text-gray-700">{inst.content}</Text>
            </View>
          ))}
        </Card>
      )}

      <View className="mb-6">
        <Button
          variant="primary"
          size="lg"
          onPress={() => setStep('wildcard')}
          className="mb-3"
        >
          Continue
        </Button>
        <Button variant="outline" onPress={resetForm}>
          Start Over
        </Button>
      </View>
    </ScrollView>
  );

  const renderWildcardStep = () => (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Add a Wildcard?</Text>
      <Text className="text-gray-500 mb-6">
        Make this recipe unique with an unexpected ingredient
      </Text>

      <Card className="bg-wildcard-50 border-2 border-wildcard-200 mb-6">
        <View className="items-center py-6">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-lg font-semibold text-wildcard-900 mb-2 text-center">
            Wildcard Ingredients
          </Text>
          <Text className="text-wildcard-700 text-center px-4">
            Our AI will suggest 1-2 unexpected ingredients backed by food science that will elevate this dish and make it truly unique.
          </Text>
        </View>
      </Card>

      <Button
        variant="wildcard"
        size="lg"
        onPress={handleAddWildcard}
        isLoading={isAddingWildcard}
        className="mb-3"
      >
        Add Wildcard Ingredients
      </Button>

      <Button variant="outline" size="lg" onPress={handleSkipWildcard}>
        Skip - Keep Original Recipe
      </Button>
    </View>
  );

  const renderFinalStep = () => (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Final Recipe</Text>
      <Text className="text-gray-500 mb-4">
        Your recipe is ready to save!
      </Text>

      {parsedRecipe && (
        <Card variant="elevated" className="mb-4">
          {parsedRecipe.source === 'wildcard_modified' && (
            <WildcardBadge className="mb-2" />
          )}

          <Text className="text-xl font-bold text-gray-900 mb-2">
            {parsedRecipe.title}
          </Text>
          <Text className="text-gray-600 mb-4">{parsedRecipe.description}</Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {parsedRecipe.cuisine && (
              <Badge variant="secondary">{parsedRecipe.cuisine}</Badge>
            )}
            {parsedRecipe.difficulty && (
              <Badge variant="default">{parsedRecipe.difficulty}</Badge>
            )}
          </View>

          <Text className="font-semibold text-gray-900 mb-2">
            Ingredients ({parsedRecipe.ingredients.length})
          </Text>
          {parsedRecipe.ingredients.map((ing, index) => (
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
            Instructions ({parsedRecipe.instructions.length} steps)
          </Text>
          {parsedRecipe.instructions.map((inst, index) => (
            <View key={index} className="flex-row py-2">
              <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">{inst.step_number}</Text>
              </View>
              <Text className="flex-1 text-gray-700">{inst.content}</Text>
            </View>
          ))}
        </Card>
      )}

      <View className="mb-6">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSaveRecipe}
          isLoading={isSaving}
          className="mb-3"
        >
          Save Recipe
        </Button>
        <Button variant="outline" onPress={() => setStep('wildcard')}>
          Go Back
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <SafeArea className="flex-1 bg-white" edges={['bottom']}>
      {/* Progress indicator */}
      <View className="flex-row px-4 py-3 border-b border-gray-100">
        {['input', 'preview', 'wildcard', 'final'].map((s, index) => (
          <View key={s} className="flex-1 flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step === s
                  ? 'bg-primary-500'
                  : ['input', 'preview', 'wildcard', 'final'].indexOf(step) > index
                  ? 'bg-primary-200'
                  : 'bg-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  step === s ? 'text-white' : 'text-gray-500'
                }`}
              >
                {index + 1}
              </Text>
            </View>
            {index < 3 && (
              <View
                className={`flex-1 h-1 mx-1 ${
                  ['input', 'preview', 'wildcard', 'final'].indexOf(step) > index
                    ? 'bg-primary-200'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {step === 'input' && renderInputStep()}
      {step === 'preview' && renderPreviewStep()}
      {step === 'wildcard' && renderWildcardStep()}
      {step === 'final' && renderFinalStep()}
    </SafeArea>
  );
}
