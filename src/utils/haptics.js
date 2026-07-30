import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

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
    case 'soft': return Math.max(15, Math.round(baseMs * 0.6));
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

// Direct native vibration for maximum device compatibility across Android OEMs
const nativeVibrate = async (durationMs) => {
  try {
    await Haptics.vibrate({ duration: durationMs });
  } catch (e) {
    fallbackVibrate(durationMs);
  }
};

// Pattern player for success/alarm rhythms
const playPattern = async (durations) => {
  const isNative = Capacitor.isNativePlatform();
  if (isNative) {
    for (let i = 0; i < durations.length; i++) {
      if (i % 2 === 0) {
        await nativeVibrate(durations[i]);
      } else {
        await new Promise((res) => setTimeout(res, durations[i]));
      }
    }
  } else {
    fallbackVibrate(durations);
  }
};

/**
 * Soft tick for button taps, tab navigation, small interactions
 */
export const vibrateLight = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnTouch) return;

  const ms = getDuration(20, settings.intensity);
  try {
    const style = settings.intensity === 'soft' 
      ? ImpactStyle.Light 
      : settings.intensity === 'strong' 
        ? ImpactStyle.Heavy 
        : ImpactStyle.Medium;
    await Haptics.impact({ style });
    if (Capacitor.isNativePlatform()) {
      await nativeVibrate(ms);
    }
  } catch (e) {
    fallbackVibrate(ms);
  }
};

/**
 * Medium pulse for card drop, modal toggle, action confirm
 */
export const vibrateMedium = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnTouch) return;

  const ms = getDuration(40, settings.intensity);
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    if (Capacitor.isNativePlatform()) {
      await nativeVibrate(ms);
    }
  } catch (e) {
    fallbackVibrate(ms);
  }
};

/**
 * Success pulse rhythm when finishing a task, habit check, or pomodoro
 */
export const vibrateSuccess = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnSuccess) return;

  const dur1 = getDuration(35, settings.intensity);
  const dur2 = getDuration(45, settings.intensity);
  const pattern = [dur1, 50, dur2];

  try {
    await Haptics.notification({ type: NotificationType.Success });
    await playPattern(pattern);
  } catch (e) {
    fallbackVibrate(pattern);
  }
};

/**
 * Alarm heartbeat rhythm when break timer triggers
 */
export const vibrateAlarm = async () => {
  const settings = getHapticSettings();
  if (!settings.enabled || !settings.vibrateOnAlarm) return;

  const dur1 = getDuration(80, settings.intensity);
  const dur2 = getDuration(140, settings.intensity);
  const pattern = [dur1, 60, dur1, 60, dur2];

  try {
    await Haptics.notification({ type: NotificationType.Warning });
    await playPattern(pattern);
  } catch (e) {
    fallbackVibrate(pattern);
  }
};

