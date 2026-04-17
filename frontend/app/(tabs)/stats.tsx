import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBills } from '../../src/store/BillsContext';
import { useSettings } from '../../src/store/SettingsContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { isSameMonth } from '../../src/utils/date';
import { radius, spacing } from '../../src/theme/colors';

export default function StatsScreen() {
  const { palette } = useTheme();
  const { formatAmount } = useSettings();
  const { bills } = useBills();

  const stats = useMemo(() => {
    const now = new Date().toISOString();
    const paid = bills.filter((b) => b.paid);
    const paidThisMonth = bills.filter((b) => b.paid && b.paidAt && isSameMonth(b.paidAt, now));
    const spentThisMonth = paidThisMonth.reduce((s, b) => s + b.amount, 0);
    const totalUnpaid = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
    const totalPaidAmount = paid.reduce((s, b) => s + b.amount, 0);
    const ratio = bills.length > 0 ? paid.length / bills.length : 0;
    return {
      paidCount: paid.length,
      paidThisMonthCount: paidThisMonth.length,
      spentThisMonth,
      totalUnpaid,
      totalPaidAmount,
      ratio,
      totalBills: bills.length,
    };
  }, [bills]);

  return (
    <SafeAreaView testID="stats-screen" style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Stats</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Your bill activity at a glance</Text>

        <View style={styles.row}>
          <View style={[styles.bigCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: palette.paidBg }]}>
              <Ionicons name="checkmark-done" size={20} color={palette.paid} />
            </View>
            <Text style={[styles.cardLabel, { color: palette.textSecondary }]}>Bills paid</Text>
            <Text testID="stat-paid-count" style={[styles.cardValue, { color: palette.textPrimary }]}>
              {stats.paidCount}
            </Text>
            <Text style={[styles.cardHint, { color: palette.textMuted }]}>of {stats.totalBills} total</Text>
          </View>
          <View style={[styles.bigCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: palette.upcomingBg }]}>
              <Ionicons name="calendar" size={20} color={palette.upcoming} />
            </View>
            <Text style={[styles.cardLabel, { color: palette.textSecondary }]}>Spent this month</Text>
            <Text testID="stat-spent-month" style={[styles.cardValue, { color: palette.textPrimary }]}>
              {formatAmount(stats.spentThisMonth)}
            </Text>
            <Text style={[styles.cardHint, { color: palette.textMuted }]}>
              {stats.paidThisMonthCount} bills paid
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.summaryTitle, { color: palette.textPrimary }]}>Progress</Text>
          <View style={[styles.progressTrack, { backgroundColor: palette.surfaceAlt }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(stats.ratio * 100)}%`, backgroundColor: palette.accent },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: palette.textSecondary }]}>
            {Math.round(stats.ratio * 100)}% of your bills are paid
          </Text>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.textSecondary }]}>Outstanding</Text>
              <Text style={[styles.smallValue, { color: palette.textPrimary }]}>
                {formatAmount(stats.totalUnpaid)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={[styles.smallLabel, { color: palette.textSecondary }]}>Paid overall</Text>
              <Text style={[styles.smallValue, { color: palette.textPrimary }]}>
                {formatAmount(stats.totalPaidAmount)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Manrope_500Medium', fontSize: 14, marginTop: 4, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  bigCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  cardValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 26, letterSpacing: -0.5 },
  cardHint: { fontFamily: 'Manrope_500Medium', fontSize: 12, marginTop: 2 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  summaryTitle: { fontFamily: 'Manrope_700Bold', fontSize: 16, marginBottom: spacing.md },
  progressTrack: { height: 10, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressLabel: { fontFamily: 'Manrope_500Medium', fontSize: 13, marginTop: 8 },
  divider: { height: 1, marginVertical: spacing.md },
  row2: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  smallLabel: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  smallValue: { fontFamily: 'Manrope_700Bold', fontSize: 18, marginTop: 2 },
});
