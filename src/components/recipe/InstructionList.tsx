import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Instruction } from '../../types';

interface InstructionListProps {
  instructions: Instruction[];
}

export function InstructionList({ instructions }: InstructionListProps) {
  return (
    <View className="space-y-4">
      {instructions.map((instruction) => (
        <View key={instruction.id} className="flex-row">
          <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center mr-3">
            <Text className="text-white font-bold">{instruction.step_number}</Text>
          </View>
          <View className="flex-1 pt-1">
            <Text className="text-gray-800 leading-relaxed">
              {instruction.content}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

interface EditableInstructionListProps {
  instructions: Array<{ step_number: number; content: string }>;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

export function EditableInstructionList({
  instructions,
  onRemove,
  onEdit,
}: EditableInstructionListProps) {
  return (
    <View className="space-y-3">
      {instructions.map((instruction, index) => (
        <View key={index} className="flex-row bg-gray-50 rounded-xl p-3">
          <View className="w-7 h-7 rounded-full bg-primary-500 items-center justify-center mr-3">
            <Text className="text-white font-bold text-sm">
              {instruction.step_number}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onEdit(index)} className="flex-1">
            <Text className="text-gray-800" numberOfLines={2}>
              {instruction.content}
            </Text>
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
