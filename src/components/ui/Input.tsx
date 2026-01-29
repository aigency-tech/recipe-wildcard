import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  type TextInputProps,
} from 'react-native';
import { clsx } from 'clsx';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
        )}
        <View
          className={clsx(
            'flex-row items-center bg-gray-50 rounded-xl border-2 px-4',
            error ? 'border-primary-500' : 'border-transparent focus:border-primary-300'
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={clsx(
              'flex-1 py-3 text-base text-gray-900',
              className
            )}
            placeholderTextColor="#ADB5BD"
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-sm text-primary-500 mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  ({ label, error, hint, rows = 4, className, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
        )}
        <TextInput
          ref={ref}
          className={clsx(
            'bg-gray-50 rounded-xl border-2 px-4 py-3 text-base text-gray-900',
            error ? 'border-primary-500' : 'border-transparent',
            className
          )}
          placeholderTextColor="#ADB5BD"
          multiline
          numberOfLines={rows}
          textAlignVertical="top"
          style={{ minHeight: rows * 24 }}
          {...props}
        />
        {error && (
          <Text className="text-sm text-primary-500 mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';
