import React from 'react';
import { Button } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import type { ButtonProps } from '@rneui/themed';
import { StyleSheet } from 'react-native';

interface GradientButtonProps extends ButtonProps {
  title: string;
  loading?: boolean;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  radius?: number;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  loading = false,
  colors = ['#FF9800', '#F44336'],
  start = { x: 0, y: 0.5 },
  end = { x: 0.5, y: 0.8 },
  radius = 8,
  ...props
}) => {
  return (
    <Button
      title={title}
      loading={loading}
      ViewComponent={LinearGradient}
      linearGradientProps={{
        colors,
        start,
        end,
      }}
      buttonStyle={[styles.button, { borderRadius: radius }]}
      titleStyle={styles.buttonText}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});