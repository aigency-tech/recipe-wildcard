import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';

interface SafeAreaProps extends ViewProps {
  edges?: Edge[];
  children: React.ReactNode;
}

export function SafeArea({ edges = ['top', 'bottom'], children, style, ...props }: SafeAreaProps) {
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[{ flex: 1 }, padding, style]} {...props}>
      {children}
    </View>
  );
}
