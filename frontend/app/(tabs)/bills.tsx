import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBills } from '../../src/store/BillsContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { BillCard } from '../../src/components/BillCard';
import { EmptyState } from '../../src/components/EmptyState';
import { radius, spacing } from '../../src/theme/colors';

type Filter = 'all' | 'unpaid' | 'paid';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
];

export default function BillsScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { bills, togglePaid } = useBills();
  const [filter, setFilter] = useState<Filter>('all');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const list = bills.filter((b) => {
      if (filter === 'paid') return b.paid;
      if (filter === 'unpaid') return !b.paid;
      return true;
    });
    return [...list].sort((a, b) => {
      const diff = +new Date(a.dueDate) - +new Date(b.dueDate);
      return sortAsc ? diff : -diff;
    });
  }, [bills, filter, sortAsc]);

  return (
    <SafeAreaView testID="bills-screen" style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Bills</Text>
        <TouchableOpacity
          testID="sort-toggle"
          onPress={() => setSortAsc((v) => !v)}
          style={[styles.sortBtn, { borderColor: palette.border, backgroundColor: palette.surface }]}
        >
          <Ionicons
            name={sortAsc ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={palette.textSecondary}
          />
          <Text style={[styles.sortText, { color: palette.textSecondary }]}>Date</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.segment, { backgroundColor: palette.surfaceAlt }]}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              testID={`filter-${f.key}`}
              onPress={() => setFilter(f.key)}
              style={[
                styles.segmentItem,
                active && { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? palette.textPrimary : palette.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BillCard
            testID={`bill-card-${item.id}`}
            bill={item}
            onPress={() => router.push(`/bill/${item.id}`)}
            onTogglePaid={() => togglePaid(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="bills-empty"
            icon="receipt-outline"
            title="No bills yet"
            subtitle="Add your first bill to start tracking due dates."
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, letterSpacing: -0.5 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: radius.full,
    minHeight: 36,
  },
  sortText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  segment: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 40,
  },
  segmentText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 40 },
});
