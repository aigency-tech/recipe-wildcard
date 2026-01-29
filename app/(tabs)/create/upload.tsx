import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeArea } from '../../../src/components/SafeArea';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Badge, WildcardBadge } from '../../../src/components/ui/Badge';
import { parseRecipeFromText, addWildcardToRecipe } from '../../../src/lib/gemini';
import { useCreateRecipe } from '../../../src/hooks/useRecipes';
import type { CreateRecipeInput } from '../../../src/types';

type Step = 'upload' | 'preview' | 'wildcard' | 'final';

export default function UploadScreen() {
  const router = useRouter();
  const { createRecipe, isLoading: isSaving } = useCreateRecipe();

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<CreateRecipeInput | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAddingWildcard, setIsAddingWildcard] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/*', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);

      // Read file content
      const content = await FileSystem.readAsStringAsync(file.uri);
      setFileContent(content);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to read the file. Please try again.');
    }
  };

  const handleParseRecipe = async () => {
    if (!fileContent) return;

    setIsParsing(true);
    try {
      const recipe = await parseRecipeFromText(fileContent);
      setParsedRecipe(recipe);
      setStep('preview');
    } catch (error: any) {
      console.error('Error parsing recipe:', error);
      const errorMessage = error?.message || 'Failed to parse the recipe. Please check the file format and try again.';
      Alert.alert('Error', errorMessage);
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
      const errorMessage = error?.message || 'Failed to add wildcard ingredients. Please try again.';
      Alert.alert('Error', errorMessage);
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
        { text: 'Upload Another', onPress: () => resetForm() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const resetForm = () => {
    setStep('upload');
    setFileName(null);
    setFileContent(null);
    setParsedRecipe(null);
  };

  const renderUploadStep = () => (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Upload Recipe</Text>
      <Text className="text-gray-500 mb-6">
        Upload a text file containing your recipe and we'll parse it automatically
      </Text>

      <TouchableOpacity onPress={handlePickDocument}>
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <View className="items-center py-8">
            <Text className="text-5xl mb-4">📄</Text>
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {fileName || 'Select a text file'}
            </Text>
            <Text className="text-gray-500 text-center">
              Tap to browse your files
            </Text>
          </View>
        </Card>
      </TouchableOpacity>

      {fileContent && (
        <View className="mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Preview:</Text>
          <Card className="bg-gray-50 max-h-48">
            <ScrollView>
              <Text className="text-gray-600 text-sm">
                {fileContent.substring(0, 500)}
                {fileContent.length > 500 ? '...' : ''}
              </Text>
            </ScrollView>
          </Card>
        </View>
      )}

      <View className="mt-6">
        <Button
          variant="primary"
          size="lg"
          onPress={handleParseRecipe}
          isLoading={isParsing}
          disabled={!fileContent}
        >
          Parse Recipe
        </Button>
      </View>

      <View className="mt-4 p-4 bg-blue-50 rounded-xl">
        <Text className="text-sm font-medium text-blue-800 mb-1">Tip</Text>
        <Text className="text-sm text-blue-700">
          Your text file should include the recipe title, ingredients list, and cooking instructions. Our AI will automatically organize everything.
        </Text>
      </View>
    </View>
  );

  const renderPreviewStep = () => (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Recipe Preview</Text>
      <Text className="text-gray-500 mb-4">
        We've parsed your recipe. Review it below.
      </Text>

      {parsedRecipe && (
        <Card variant="elevated" className="mb-4">
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
        Make your recipe unique with an unexpected ingredient
      </Text>

      <Card className="bg-wildcard-50 border-2 border-wildcard-200 mb-6">
        <View className="items-center py-6">
          <Text className="text-5xl mb-4">✨</Text>
          <Text className="text-lg font-semibold text-wildcard-900 mb-2 text-center">
            Wildcard Ingredients
          </Text>
          <Text className="text-wildcard-700 text-center px-4">
            Our AI will suggest 1-2 unexpected ingredients backed by food science that will elevate your dish and make it truly unique.
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
        {['upload', 'preview', 'wildcard', 'final'].map((s, index) => (
          <View key={s} className="flex-1 flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step === s
                  ? 'bg-primary-500'
                  : ['upload', 'preview', 'wildcard', 'final'].indexOf(step) > index
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
                  ['upload', 'preview', 'wildcard', 'final'].indexOf(step) > index
                    ? 'bg-primary-200'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {step === 'upload' && renderUploadStep()}
      {step === 'preview' && renderPreviewStep()}
      {step === 'wildcard' && renderWildcardStep()}
      {step === 'final' && renderFinalStep()}
    </SafeArea>
  );
}
