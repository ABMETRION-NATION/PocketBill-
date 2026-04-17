import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Recurrence, useBills } from '../../src/store/BillsContext';
import { useSettings } from '../../src/store/SettingsContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { formatDate } from '../../src/utils/date';
import { radius, spacing } from '../../src/theme/colors';

const RECURRENCE_OPTIONS: { key: Recurrence; label: string }[] = [
  { key: 'none', label: 'One-time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'custom', label: 'Custom' },
];

export default function BillEditor() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette } = useTheme();
  const { symbol } = useSettings();
  const { getBill, addBill, updateBill, deleteBill } = useBills();

  const isNew = id === 'new' || !id;
  const existing = !isNew ? getBill(id!) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [amountStr, setAmountStr] = useState(existing ? String(existing.amount) : '');
  const [dueDate, setDueDate] = useState<Date>(
    existing ? new Date(existing.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(existing?.recurrence ?? 'none');
  const [customDays, setCustomDays] = useState<string>(
    existing?.customDays ? String(existing.customDays) : '30'
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isNew ? 'Add bill' : 'Edit bill' });
  }, [navigation, isNew]);

  const amountNum = useMemo(() => {
    const n = parseFloat(amountStr.replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }, [amountStr]);

  const canSave = name.trim().length > 0 && amountNum > 0;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Missing details', 'Please enter a bill name and a valid amount.');
      return;
    }
    const payload = {
      name: name.trim(),
      amount: Math.round(amountNum * 100) / 100,
      dueDate: dueDate.toISOString(),
      recurrence,
      customDays: recurrence === 'custom' ? Math.max(1, parseInt(customDays || '0', 10) || 30) : undefined,
      notes: notes.trim() || undefined,
    };
    if (isNew) {
      await addBill(payload);
    } else if (existing) {
      await updateBill(existing.id, payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete bill', `Remove "${existing.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBill(existing.id);
          router.back();
        },
      },
    ]);
  };

  const onDateChange = (_: unknown, d?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (d) setDueDate(d);
  };

  return (
    <SafeAreaView
      testID="bill-editor-screen"
      style={[styles.safe, { backgroundColor: palette.background }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <Text style={[styles.label, { color: palette.textSecondary }]}>Bill name</Text>
          <TextInput
            testID="input-name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Electricity"
            placeholderTextColor={palette.textMuted}
            style={[
              styles.input,
              { borderColor: palette.border, backgroundColor: palette.surface, color: palette.textPrimary },
            ]}
          />

          {/* Amount */}
          <Text style={[styles.label, { color: palette.textSecondary, marginTop: spacing.md }]}>Amount</Text>
          <View style={[styles.amountRow, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <Text style={[styles.currencySymbol, { color: palette.textSecondary }]}>{symbol}</Text>
            <TextInput
              testID="input-amount"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0.00"
              placeholderTextColor={palette.textMuted}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: palette.textPrimary }]}
            />
          </View>

          {/* Due date */}
          <Text style={[styles.label, { color: palette.textSecondary, marginTop: spacing.md }]}>Due date</Text>
          <TouchableOpacity
            testID="due-date-picker"
            onPress={() => setShowPicker((v) => !v)}
            style={[styles.input, styles.dateRow, { borderColor: palette.border, backgroundColor: palette.surface }]}
          >
            <Ionicons name="calendar-outline" size={18} color={palette.textSecondary} />
            <Text style={[styles.dateText, { color: palette.textPrimary }]}>{formatDate(dueDate.toISOString())}</Text>
          </TouchableOpacity>
          {showPicker ? (
            <DateTimePicker
              testID="date-picker"
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
            />
          ) : null}

          {/* Recurrence */}
          <Text style={[styles.label, { color: palette.textSecondary, marginTop: spacing.md }]}>Repeat</Text>
          <View style={styles.recurrenceWrap}>
            {RECURRENCE_OPTIONS.map((opt) => {
              const active = recurrence === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  testID={`recurrence-${opt.key}`}
                  onPress={() => setRecurrence(opt.key)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? palette.accent : palette.border,
                      backgroundColor: active ? palette.accent : palette.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? palette.onAccent : palette.textPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {recurrence === 'custom' ? (
            <View style={styles.customRow}>
              <Text style={[styles.customLabel, { color: palette.textSecondary }]}>Repeat every</Text>
              <TextInput
                testID="input-custom-days"
                value={customDays}
                onChangeText={setCustomDays}
                keyboardType="number-pad"
                style={[
                  styles.customInput,
                  { borderColor: palette.border, backgroundColor: palette.surface, color: palette.textPrimary },
                ]}
              />
              <Text style={[styles.customLabel, { color: palette.textSecondary }]}>days</Text>
            </View>
          ) : null}

          {/* Notes */}
          <Text style={[styles.label, { color: palette.textSecondary, marginTop: spacing.md }]}>Notes</Text>
          <TextInput
            testID="input-notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            placeholderTextColor={palette.textMuted}
            multiline
            style={[
              styles.input,
              styles.notesInput,
              { borderColor: palette.border, backgroundColor: palette.surface, color: palette.textPrimary },
            ]}
          />

          {!isNew ? (
            <TouchableOpacity
              testID="delete-bill"
              onPress={handleDelete}
              style={[styles.deleteBtn, { borderColor: palette.overdue }]}
            >
              <Ionicons name="trash-outline" size={18} color={palette.overdue} />
              <Text style={[styles.deleteText, { color: palette.overdue }]}>Delete bill</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: palette.border, backgroundColor: palette.background }]}>
          <TouchableOpacity
            testID="save-bill"
            onPress={handleSave}
            disabled={!canSave}
            style={[
              styles.saveBtn,
              { backgroundColor: canSave ? palette.accent : palette.surfaceAlt },
            ]}
          >
            <Text
              style={[
                styles.saveText,
                { color: canSave ? palette.onAccent : palette.textMuted },
              ]}
            >
              {isNew ? 'Add bill' : 'Save changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 140 },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    minHeight: 50,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 64,
  },
  currencySymbol: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Manrope_800ExtraBold',
    padding: 0,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateText: { fontSize: 16, fontFamily: 'Manrope_600SemiBold' },
  recurrenceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13 },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  customLabel: { fontFamily: 'Manrope_500Medium', fontSize: 14 },
  customInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  notesInput: { minHeight: 90, textAlignVertical: 'top' },
  deleteBtn: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  deleteText: { fontFamily: 'Manrope_700Bold', fontSize: 15 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
  },
  saveBtn: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
});
