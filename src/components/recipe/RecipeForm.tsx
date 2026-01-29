import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EditableIngredientList } from './IngredientList';
import { EditableInstructionList } from './InstructionList';
import { CUISINE_OPTIONS, DIFFICULTY_LABELS } from '../../lib/constants';
import type { CreateRecipeInput, RecipeSource } from '../../types';

interface IngredientInput {
  name: string;
  quantity: string;
  unit: string;
  is_wildcard: boolean;
}

interface InstructionInput {
  step_number: number;
  content: string;
}

interface RecipeFormProps {
  initialValues?: Partial<CreateRecipeInput>;
  source: RecipeSource;
  onSubmit: (values: CreateRecipeInput) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({
  initialValues,
  source,
  onSubmit,
  isLoading = false,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [cuisine, setCuisine] = useState(initialValues?.cuisine || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>(
    initialValues?.difficulty || ''
  );
  const [prepTime, setPrepTime] = useState(
    initialValues?.prep_time_minutes?.toString() || ''
  );
  const [cookTime, setCookTime] = useState(
    initialValues?.cook_time_minutes?.toString() || ''
  );
  const [servings, setServings] = useState(
    initialValues?.servings?.toString() || ''
  );
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialValues?.ingredients?.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      is_wildcard: i.is_wildcard,
    })) || []
  );
  const [instructions, setInstructions] = useState<InstructionInput[]>(
    initialValues?.instructions?.map((i) => ({
      step_number: i.step_number,
      content: i.content,
    })) || []
  );

  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showCuisineModal, setShowCuisineModal] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);

  const [newIngredient, setNewIngredient] = useState<IngredientInput>({
    name: '',
    quantity: '',
    unit: '',
    is_wildcard: false,
  });
  const [newInstruction, setNewInstruction] = useState('');

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return;

    if (editingIngredientIndex !== null) {
      const updated = [...ingredients];
      updated[editingIngredientIndex] = newIngredient;
      setIngredients(updated);
      setEditingIngredientIndex(null);
    } else {
      setIngredients([...ingredients, newIngredient]);
    }

    setNewIngredient({ name: '', quantity: '', unit: '', is_wildcard: false });
    setShowIngredientModal(false);
  };

  const handleEditIngredient = (index: number) => {
    setNewIngredient(ingredients[index]);
    setEditingIngredientIndex(index);
    setShowIngredientModal(true);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;

    if (editingInstructionIndex !== null) {
      const updated = [...instructions];
      updated[editingInstructionIndex] = {
        step_number: editingInstructionIndex + 1,
        content: newInstruction,
      };
      setInstructions(updated);
      setEditingInstructionIndex(null);
    } else {
      setInstructions([
        ...instructions,
        { step_number: instructions.length + 1, content: newInstruction },
      ]);
    }

    setNewInstruction('');
    setShowInstructionModal(false);
  };

  const handleEditInstruction = (index: number) => {
    setNewInstruction(instructions[index].content);
    setEditingInstructionIndex(index);
    setShowInstructionModal(true);
  };

  const handleRemoveInstruction = (index: number) => {
    const updated = instructions
      .filter((_, i) => i !== index)
      .map((inst, i) => ({ ...inst, step_number: i + 1 }));
    setInstructions(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    if (instructions.length === 0) {
      Alert.alert('Error', 'Please add at least one instruction');
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      source,
      cuisine: cuisine || undefined,
      difficulty: difficulty || undefined,
      prep_time_minutes: prepTime ? parseInt(prepTime, 10) : undefined,
      cook_time_minutes: cookTime ? parseInt(cookTime, 10) : undefined,
      servings: servings ? parseInt(servings, 10) : undefined,
      is_public: true,
      ingredients: ingredients.map((ing, index) => ({
        ...ing,
        order_index: index,
      })),
      instructions: instructions.map((inst, index) => ({
        step_number: index + 1,
        content: inst.content,
      })),
    });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 space-y-4">
        <Input
          label="Recipe Title"
          placeholder="Enter recipe name"
          value={title}
          onChangeText={setTitle}
        />

        <TextArea
          label="Description"
          placeholder="Describe your recipe"
          value={description}
          onChangeText={setDescription}
          rows={3}
        />

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setShowCuisineModal(true)}
              className="bg-gray-50 rounded-xl px-4 py-3"
            >
              <Text className="text-sm text-gray-500 mb-1">Cuisine</Text>
              <Text className="text-gray-900">
                {cuisine || 'Select cuisine'}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => {
                const options = ['easy', 'medium', 'hard'] as const;
                const currentIndex = difficulty ? options.indexOf(difficulty) : -1;
                const nextIndex = (currentIndex + 1) % 4;
                setDifficulty(nextIndex === 3 ? '' : options[nextIndex]);
              }}
              className="bg-gray-50 rounded-xl px-4 py-3"
            >
              <Text className="text-sm text-gray-500 mb-1">Difficulty</Text>
              <Text className="text-gray-900">
                {difficulty ? DIFFICULTY_LABELS[difficulty] : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Input
              label="Prep Time (min)"
              placeholder="15"
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Cook Time (min)"
              placeholder="30"
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Servings"
              placeholder="4"
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">
              Ingredients
            </Text>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setShowIngredientModal(true)}
            >
              + Add
            </Button>
          </View>
          {ingredients.length > 0 ? (
            <EditableIngredientList
              ingredients={ingredients}
              onRemove={handleRemoveIngredient}
              onEdit={handleEditIngredient}
            />
          ) : (
            <View className="bg-gray-50 rounded-xl p-4 items-center">
              <Text className="text-gray-500">No ingredients added yet</Text>
            </View>
          )}
        </View>

        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">
              Instructions
            </Text>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setShowInstructionModal(true)}
            >
              + Add
            </Button>
          </View>
          {instructions.length > 0 ? (
            <EditableInstructionList
              instructions={instructions}
              onRemove={handleRemoveInstruction}
              onEdit={handleEditInstruction}
            />
          ) : (
            <View className="bg-gray-50 rounded-xl p-4 items-center">
              <Text className="text-gray-500">No instructions added yet</Text>
            </View>
          )}
        </View>

        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isLoading={isLoading}
          className="mt-4"
        >
          Save Recipe
        </Button>
      </View>

      <Modal
        isOpen={showIngredientModal}
        onClose={() => {
          setShowIngredientModal(false);
          setNewIngredient({ name: '', quantity: '', unit: '', is_wildcard: false });
          setEditingIngredientIndex(null);
        }}
        title={editingIngredientIndex !== null ? 'Edit Ingredient' : 'Add Ingredient'}
      >
        <View className="space-y-3">
          <Input
            label="Ingredient Name"
            placeholder="e.g., Flour"
            value={newIngredient.name}
            onChangeText={(text) => setNewIngredient({ ...newIngredient, name: text })}
          />
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Input
                label="Quantity"
                placeholder="1"
                value={newIngredient.quantity}
                onChangeText={(text) =>
                  setNewIngredient({ ...newIngredient, quantity: text })
                }
              />
            </View>
            <View className="flex-1">
              <Input
                label="Unit"
                placeholder="cup"
                value={newIngredient.unit}
                onChangeText={(text) =>
                  setNewIngredient({ ...newIngredient, unit: text })
                }
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              setNewIngredient({
                ...newIngredient,
                is_wildcard: !newIngredient.is_wildcard,
              })
            }
            className="flex-row items-center py-2"
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                newIngredient.is_wildcard
                  ? 'bg-wildcard-400 border-wildcard-400'
                  : 'border-gray-300'
              }`}
            >
              {newIngredient.is_wildcard && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="text-gray-700">Mark as Wildcard ingredient</Text>
          </TouchableOpacity>
          <Button variant="primary" onPress={handleAddIngredient}>
            {editingIngredientIndex !== null ? 'Update' : 'Add Ingredient'}
          </Button>
        </View>
      </Modal>

      <Modal
        isOpen={showInstructionModal}
        onClose={() => {
          setShowInstructionModal(false);
          setNewInstruction('');
          setEditingInstructionIndex(null);
        }}
        title={editingInstructionIndex !== null ? 'Edit Step' : 'Add Step'}
      >
        <View className="space-y-3">
          <TextArea
            label={`Step ${editingInstructionIndex !== null ? editingInstructionIndex + 1 : instructions.length + 1}`}
            placeholder="Describe this step..."
            value={newInstruction}
            onChangeText={setNewInstruction}
            rows={4}
          />
          <Button variant="primary" onPress={handleAddInstruction}>
            {editingInstructionIndex !== null ? 'Update' : 'Add Step'}
          </Button>
        </View>
      </Modal>

      <Modal
        isOpen={showCuisineModal}
        onClose={() => setShowCuisineModal(false)}
        title="Select Cuisine"
      >
        <ScrollView className="max-h-80">
          {CUISINE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                setCuisine(option);
                setShowCuisineModal(false);
              }}
              className={`py-3 px-4 rounded-xl mb-2 ${
                cuisine === option ? 'bg-secondary-100' : 'bg-gray-50'
              }`}
            >
              <Text
                className={`${
                  cuisine === option ? 'text-secondary-700 font-medium' : 'text-gray-900'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
