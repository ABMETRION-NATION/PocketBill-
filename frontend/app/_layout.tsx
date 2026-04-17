import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { BillsProvider } from '../src/store/BillsContext';
import { SettingsProvider, useSettings } from '../src/store/SettingsContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { ensureNotificationsSetup } from '../src/utils/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Inner: React.FC = () => {
  const { palette, isDark } = useTheme();
  const { notificationsEnabled } = useSettings();

  useEffect(() => {
    if (notificationsEnabled) {
      ensureNotificationsSetup();
    }
  }, [notificationsEnabled]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: { fontFamily: 'Manrope_700Bold' },
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="bill/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerBackVisible: true,
          }}
        />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <BillsProvider>
              <Inner />
            </BillsProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
