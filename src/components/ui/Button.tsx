import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'wildcard' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';

  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    accent: 'bg-accent-400 active:bg-accent-500',
    wildcard: 'bg-wildcard-400 active:bg-wildcard-500',
    outline: 'border-2 border-gray-300 bg-transparent active:bg-gray-100',
    ghost: 'bg-transparent active:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    accent: 'text-gray-900',
    wildcard: 'text-white',
    outline: 'text-gray-700',
    ghost: 'text-gray-700',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#495057' : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon && <Text className="mr-2">{leftIcon}</Text>}
          <Text
            className={clsx(
              'font-semibold',
              textVariantStyles[variant],
              textSizeStyles[size]
            )}
          >
            {children}
          </Text>
          {rightIcon && <Text className="ml-2">{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}
