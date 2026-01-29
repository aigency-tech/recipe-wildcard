import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ModalProps as RNModalProps,
} from 'react-native';
import { clsx } from 'clsx';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  ...props
}: ModalProps) {
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <TouchableWithoutFeedback>
            <View
              className={clsx(
                'bg-white rounded-2xl w-full overflow-hidden',
                sizeStyles[size]
              )}
            >
              {title && (
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                  <Text className="text-lg font-semibold text-gray-900">
                    {title}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    className="p-1"
                  >
                    <Text className="text-2xl text-gray-400">x</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View className="p-4">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  const confirmButtonStyles = {
    danger: 'bg-primary-500',
    warning: 'bg-accent-500',
    info: 'bg-secondary-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <Text className="text-gray-600 mb-4">{message}</Text>
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-3 bg-gray-100 rounded-xl"
          disabled={isLoading}
        >
          <Text className="text-center font-medium text-gray-700">
            {cancelText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          className={clsx(
            'flex-1 py-3 rounded-xl',
            confirmButtonStyles[variant],
            isLoading && 'opacity-50'
          )}
          disabled={isLoading}
        >
          <Text className="text-center font-medium text-white">
            {confirmText}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
