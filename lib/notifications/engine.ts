/**
 * RAVAN SHIPPING - Free Native Notification & Audio Synthesis Engine
 * 100% Free HTML5 Notification API + Web Audio API Chime Generator
 * Works on Desktop (Chrome, Edge, Firefox, Brave) and Mobile (Android, iOS PWA)
 */

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export interface SystemNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
}

/**
 * Checks the current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Requests native browser permission to display system push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return Notification.permission as NotificationPermissionState;
  }
}

/**
 * Synthesizes a crisp, pleasant 2-tone melodic notification chime using the Web Audio API.
 * 100% offline, zero network latency, no external mp3 assets required.
 */
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // In modern browsers, AudioContext might start in 'suspended' state until user interaction
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First tone: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second tone: A5 (880 Hz) - uplifting harmonic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);

    // Clean up audio context
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch (err) {
    console.warn("Web Audio chime playback skipped:", err);
  }
}

/**
 * Sends a native system notification via the Browser / OS
 */
export function sendSystemNotification(
  title: string,
  options?: SystemNotificationOptions
): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || "Update from RAVAN SHIPPING",
      icon: options?.icon || "/logo.png",
      badge: options?.badge || "/logo.png",
      tag: options?.tag || `ravan-notif-${Date.now()}`,
      data: options?.data || {},
      silent: true, // Audio handled by our Web Audio API chime
    });

    notification.onclick = function (event) {
      event.preventDefault();
      window.focus();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.error("Failed to display system notification:", err);
    return false;
  }
}

/**
 * Sound alert preference persistence
 */
const SOUND_STORAGE_KEY = "ravan_sound_alerts_enabled";

export function getSoundAlertsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(SOUND_STORAGE_KEY);
  return val === null ? true : val === "true";
}

export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
}
