import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

export const ensureNotificationsSetup = async () => {
  if (configured) return;
  configured = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('bills', {
        name: 'Bill reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const settings = await Notifications.getPermissionsAsync();
    if (settings.status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch {
    // Web / unsupported environments can safely ignore notifications.
  }
};

export const scheduleBillReminder = async (id: string, name: string, dueISO: string) => {
  try {
    const due = new Date(dueISO);
    // Schedule morning of due day (9:00 AM local)
    due.setHours(9, 0, 0, 0);
    if (due.getTime() <= Date.now()) return null;
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bill due today',
        body: `${name} is due today. Tap to mark as paid.`,
        data: { billId: id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: due },
    });
    return notifId;
  } catch {
    return null;
  }
};

export const cancelReminder = async (notifId?: string | null) => {
  if (!notifId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {
    // ignore
  }
};
