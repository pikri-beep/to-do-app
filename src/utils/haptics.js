import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const DEFAULT_SETTINGS = {
  enabled: true,
  intensity: 'medium', // 'soft' | 'medium' | 'strong'
  vibrateOnTouch: true,
  vibrateOnSuccess: true,
  vibrateOnAlarm: true,
};

export const getHapticSettings = () => {
  try {
    const saved = localStorage.getItem('haptic-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveHapticSettings = (settings) => {
  try {
    localStorage.setItem('haptic-settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('haptics-settings-changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save haptics settings', e);
  }
};

// Multiplier based on intensity
const getDuration = (baseMs, intensity) => {
  switch (intensity) {
    case 'soft': return Math.round(baseMs * 0.6);
    case 'strong': return Math.round(baseMs * 1.5);
    case 'medium':
    default: return baseMs;
  }
};

// Web Vibration API fallback
const fallbackVibrate = (pattern) => {
  if ('navigator' in window && typeof window.navigator.vibrate === 'function') {
    try {
      window.navigator.vibrate(pattern);
    } catch (e) {
      // Ignored if browser user interaction policy blocks it
    }
  }
};

/**
 * Soft tick for button taps, tab navigation, small interactions
 */
export const vibrateLight = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnTouch) return;

  try {
    const style = settings.intensity === 'soft' 
      ? ImpactStyle.Light 
      : settings.intensity === 'strong' 
        ? ImpactStyle.Heavy 
        : ImpactStyle.Medium;
    await Haptics.impact({ style });
  } catch (e) {
    // Fallback to web vibration
    fallbackVibrate(getDuration(12, settings.intensity));
  }
};

/**
 * Medium pulse for card drop, modal toggle, action confirm
 */
export const vibrateMedium = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnTouch) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {
    fallbackVibrate(getDuration(35, settings.intensity));
  }
};

/**
 * Success pulse rhythm when finishing a task, habit check, or pomodoro
 */
export const vibrateSuccess = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnSuccess) return;

  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {
    const dur1 = getDuration(35, settings.intensity);
    const dur2 = getDuration(35, settings.intensity);
    fallbackVibrate([dur1, 50, dur2]);
  }
};

/**
 * Alarm heartbeat rhythm when break timer triggers
 */
export const vibrateAlarm = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnAlarm) return;

  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (e) {
    const dur1 = getDuration(80, settings.intensity);
    const dur2 = getDuration(150, settings.intensity);
    fallbackVibrate([dur1, 60, dur1, 60, dur2]);
  }
};
