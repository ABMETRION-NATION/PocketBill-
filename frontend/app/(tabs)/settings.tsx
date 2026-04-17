import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_META, Currency, ThemeMode, useSettings } from '../../src/store/SettingsContext';
import { useTheme } from '../../src/theme/ThemeContext';
import { radius, spacing } from '../../src/theme/colors';

const THEMES: { key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

const CURRENCIES: Currency[] = ['USD', 'INR', 'EUR'];

export default function SettingsScreen() {
  const { palette } = useTheme();
  const {
    currency,
    setCurrency,
    themeMode,
    setThemeMode,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettings();

  const showAuthDemo = (provider: string) => {
    Alert.alert(
      'Coming soon',
      `${provider} sign-in is not wired up yet. PocketBill works fully offline — no account required.`
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About PocketBill',
      'PocketBill v1.0.0\n\nA simple, local-first bill tracker. Your data lives only on this device.'
    );
  };

  return (
    <SafeAreaView testID="settings-screen" style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Settings</Text>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.segment, { backgroundColor: palette.surfaceAlt }]}>
            {THEMES.map((t) => {
              const active = themeMode === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  testID={`theme-${t.key}`}
                  onPress={() => setThemeMode(t.key)}
                  style={[
                    styles.segmentItem,
                    active && { backgroundColor: palette.surface, borderColor: palette.border },
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={active ? palette.textPrimary : palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: active ? palette.textPrimary : palette.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Currency */}
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Currency</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, padding: 0 }]}>
          {CURRENCIES.map((c, i) => {
            const active = currency === c;
            return (
              <TouchableOpacity
                key={c}
                testID={`currency-${c}`}
                onPress={() => setCurrency(c)}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: 1, borderTopColor: palette.border },
                ]}
              >
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{CURRENCY_META[c].label}</Text>
                {active ? <Ionicons name="checkmark" size={20} color={palette.accent} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Reminders</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, padding: 0 }]}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Due-date reminders</Text>
              <Text style={[styles.rowHint, { color: palette.textSecondary }]}>
                Local notification at 9:00 AM on each bill&apos;s due date.
              </Text>
            </View>
            <Switch
              testID="notifications-switch"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: palette.surfaceAlt, true: palette.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account placeholders */}
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, padding: 0 }]}>
          <TouchableOpacity
            testID="auth-google"
            onPress={() => showAuthDemo('Google')}
            style={styles.row}
          >
            <View style={[styles.socialDot, { backgroundColor: '#4285F4' }]}>
              <Ionicons name="logo-google" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: palette.textPrimary, flex: 1, marginLeft: 12 }]}>
              Continue with Google
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: palette.border }} />
          <TouchableOpacity
            testID="auth-facebook"
            onPress={() => showAuthDemo('Facebook')}
            style={styles.row}
          >
            <View style={[styles.socialDot, { backgroundColor: '#1877F2' }]}>
              <Ionicons name="logo-facebook" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: palette.textPrimary, flex: 1, marginLeft: 12 }]}>
              Continue with Facebook
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>Info</Text>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, padding: 0 }]}>
          <TouchableOpacity testID="about-row" onPress={showAbout} style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.rowLabel, { color: palette.textPrimary, flex: 1, marginLeft: 12 }]}>
              About PocketBill
            </Text>
            <Text style={[styles.rowHint, { color: palette.textMuted }]}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: palette.textMuted }]}>
          PocketBill stores all data locally on your device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, letterSpacing: -0.5, marginBottom: spacing.md },
  sectionLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: radius.md },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  segmentText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 15 },
  rowHint: { fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 2 },
  socialDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
