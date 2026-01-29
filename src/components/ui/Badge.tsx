import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { clsx } from 'clsx';

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'wildcard' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100',
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    accent: 'bg-accent-100',
    wildcard: 'bg-wildcard-100',
    outline: 'border border-gray-300 bg-transparent',
  };

  const textVariantStyles = {
    default: 'text-gray-700',
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    accent: 'text-accent-700',
    wildcard: 'text-wildcard-700',
    outline: 'text-gray-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={clsx(
        'rounded-full self-start',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Text
        className={clsx(
          'font-medium',
          textVariantStyles[variant],
          textSizeStyles[size]
        )}
      >
        {children}
      </Text>
    </View>
  );
}

interface WildcardBadgeProps extends ViewProps {
  size?: 'sm' | 'md' | 'lg';
}

export function WildcardBadge({ size = 'md', className, ...props }: WildcardBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={clsx(
        'bg-wildcard-400 rounded-full self-start flex-row items-center',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Text className={clsx('text-white mr-1', textSizeStyles[size])}>*</Text>
      <Text className={clsx('font-semibold text-white', textSizeStyles[size])}>
        Wildcard
      </Text>
    </View>
  );
}
