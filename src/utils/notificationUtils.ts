// Check if browser notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log('Browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if notification permission is granted
export const hasNotificationPermission = (): boolean => {
  if (!isNotificationSupported()) return false;
  return Notification.permission === 'granted';
};

// Send a notification
export const sendNotification = (
  title: string,
  options: NotificationOptions = {}
): Notification | null => {
  if (!hasNotificationPermission()) return null;

  try {
    const notification = new Notification(title, {
      icon: '/bottlecap-icon.png', // Default icon
      ...options,
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Schedule a notification for a future time
export const scheduleNotification = (
  delayMs: number,
  title: string,
  options: NotificationOptions = {}
): number => {
  if (!hasNotificationPermission()) return -1;

  return window.setTimeout(() => {
    sendNotification(title, options);
  }, delayMs);
};

// Cancel a scheduled notification
export const cancelScheduledNotification = (timerId: number): void => {
  if (timerId > 0) {
    window.clearTimeout(timerId);
  }
};

// Store notification preference in localStorage
export const setNotificationPreference = (enabled: boolean): void => {
  localStorage.setItem('bottlecaps_notifications_enabled', enabled ? 'true' : 'false');
};

// Get notification preference from localStorage
export const getNotificationPreference = (): boolean => {
  const pref = localStorage.getItem('bottlecaps_notifications_enabled');
  return pref === 'true';
};

// Store notification timer ID in localStorage
export const storeNotificationTimerId = (timerId: number): void => {
  localStorage.setItem('bottlecaps_notification_timer_id', timerId.toString());
};

// Get notification timer ID from localStorage
export const getNotificationTimerId = (): number => {
  const timerId = localStorage.getItem('bottlecaps_notification_timer_id');
  return timerId ? parseInt(timerId, 10) : -1;
};

// Clear notification timer ID from localStorage
export const clearNotificationTimerId = (): void => {
  localStorage.removeItem('bottlecaps_notification_timer_id');
};
