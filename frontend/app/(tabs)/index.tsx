import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Bill, useBills } from '../../src/store/BillsContext';
import { useSettings } from '../../src/store/SettingsContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { BillCard } from '../../src/components/BillCard';
import { EmptyState } from '../../src/components/EmptyState';
import { isOverdue } from '../../src/utils/date';
import { radius, spacing } from '../../src/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { formatAmount } = useSettings();
  const { bills, togglePaid } = useBills();

  const { unpaid, totalDue, overdueCount } = useMemo(() => {
    const u = bills.filter((b) => !b.paid).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    const total = u.reduce((s, b) => s + b.amount, 0);
    const overdueN = u.filter((b) => isOverdue(b.dueDate, b.paid)).length;
    return { unpaid: u, totalDue: total, overdueCount: overdueN };
  }, [bills]);

  const onEdit = (b: Bill) => router.push(`/bill/${b.id}`);
  const onAdd = () => router.push('/bill/new');

  return (
    <SafeAreaView testID="home-screen" style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <FlatList
        data={unpaid}
        keyExtractor={(b) => b.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: palette.textSecondary }]}>PocketBill</Text>
            <Text style={[styles.label, { color: palette.textSecondary }]}>Total due</Text>
            <Text testID="total-due" style={[styles.total, { color: palette.textPrimary }]}>
              {formatAmount(totalDue)}
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.chip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Text style={[styles.chipLabel, { color: palette.textSecondary }]}>Upcoming</Text>
                <Text style={[styles.chipValue, { color: palette.textPrimary }]}>{unpaid.length}</Text>
              </View>
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: overdueCount > 0 ? palette.overdueBg : palette.surface,
                    borderColor: overdueCount > 0 ? palette.overdue : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: overdueCount > 0 ? palette.overdue : palette.textSecondary },
                  ]}
                >
                  Overdue
                </Text>
                <Text
                  style={[
                    styles.chipValue,
                    { color: overdueCount > 0 ? palette.overdue : palette.textPrimary },
                  ]}
                >
                  {overdueCount}
                </Text>
              </View>
            </View>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Upcoming bills</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BillCard
            testID={`bill-card-${item.id}`}
            bill={item}
            onPress={() => onEdit(item)}
            onTogglePaid={() => togglePaid(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="home-empty"
            icon="checkmark-done-circle-outline"
            title="You're all caught up"
            subtitle="No pending bills. Tap the + button to add one."
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        testID="fab-add-bill"
        onPress={onAdd}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: palette.accent }]}
      >
        <Ionicons name="add" size={28} color={palette.onAccent} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  header: { paddingTop: spacing.md, paddingBottom: spacing.md },
  greeting: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' },
  label: { fontFamily: 'Manrope_500Medium', fontSize: 14, marginTop: spacing.md },
  total: { fontFamily: 'Manrope_800ExtraBold', fontSize: 44, letterSpacing: -1, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  chipLabel: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  chipValue: { fontFamily: 'Manrope_700Bold', fontSize: 20, marginTop: 2 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
