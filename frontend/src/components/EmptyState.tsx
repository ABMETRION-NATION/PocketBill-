import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  testID?: string;
};

export const EmptyState: React.FC<Props> = ({ icon = 'receipt-outline', title, subtitle, testID }) => {
  const { palette } = useTheme();
  return (
    <View testID={testID} style={styles.wrap}>
      <Ionicons name={icon} size={56} color={palette.textMuted} />
      <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
