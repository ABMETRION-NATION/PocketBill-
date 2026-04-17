import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../store/BillsContext';
import { useSettings } from '../store/SettingsContext';
import { useTheme } from '../theme/ThemeContext';
import { formatRelative, isOverdue } from '../utils/date';
import { radius, spacing } from '../theme/colors';

type Props = {
  bill: Bill;
  onPress?: () => void;
  onTogglePaid?: () => void;
  testID?: string;
};

const recurrenceLabel = (bill: Bill) => {
  switch (bill.recurrence) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return bill.customDays ? `Every ${bill.customDays}d` : 'Custom';
    default:
      return null;
  }
};

export const BillCard: React.FC<Props> = ({ bill, onPress, onTogglePaid, testID }) => {
  const { palette } = useTheme();
  const { formatAmount } = useSettings();
  const overdue = isOverdue(bill.dueDate, bill.paid);

  const borderColor = overdue ? palette.overdue : palette.border;
  const statusColor = bill.paid ? palette.paid : overdue ? palette.overdue : palette.textSecondary;

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, { backgroundColor: palette.surface, borderColor }]}
    >
      <TouchableOpacity
        testID={`${testID}-toggle-paid`}
        onPress={onTogglePaid}
        hitSlop={10}
        style={[
          styles.check,
          {
            borderColor: bill.paid ? palette.paid : palette.border,
            backgroundColor: bill.paid ? palette.paid : 'transparent',
          },
        ]}
      >
        {bill.paid ? <Ionicons name="checkmark" size={18} color={palette.onAccent} /> : null}
      </TouchableOpacity>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: palette.textPrimary, textDecorationLine: bill.paid ? 'line-through' : 'none' },
          ]}
        >
          {bill.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: statusColor }]}>
            {bill.paid ? 'Paid' : formatRelative(bill.dueDate)}
          </Text>
          {recurrenceLabel(bill) ? (
            <>
              <View style={[styles.dot, { backgroundColor: palette.textMuted }]} />
              <Text style={[styles.meta, { color: palette.textSecondary }]}>{recurrenceLabel(bill)}</Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: palette.textPrimary }]}>{formatAmount(bill.amount)}</Text>
        {overdue ? (
          <View style={[styles.pill, { backgroundColor: palette.overdueBg }]}>
            <Text style={[styles.pillText, { color: palette.overdue }]}>Overdue</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
