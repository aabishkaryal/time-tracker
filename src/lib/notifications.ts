/**
 * Notification utilities for timer events
 * Supports both audio and browser notifications
 */

import { toast } from "sonner";

// Extended window interface for WebKit audio context
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    toast.error("Browser notifications not supported");
    return "denied";
  }

  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
  title: string,
  body: string,
  options: NotificationOptions = {}
): void {
  if (!("Notification" in window)) {
    toast.error("Browser notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "timer-notification",
      requireInteraction: false,
      ...options,
    });

    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  } else if (Notification.permission === "default") {
    requestNotificationPermission().then((permission) => {
      if (permission === "granted") {
        showBrowserNotification(title, body, options);
      }
    });
  }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Plays a pleasant notification sound using Web Audio API
 * Creates a double-chime bell-like sound to alert when timer completes
 */
export function playNotificationSound(): void {
  try {
    // Create a simple audio context to generate a pleasant notification sound
    const AudioContextClass =
      window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
    if (!AudioContextClass) {
      toast.error("Audio notifications not supported");
      return;
    }

    const audioContext = new AudioContextClass();

    // Create oscillator for a pleasant bell-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - pleasant bell tone
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      400,
      audioContext.currentTime + 0.3
    );

    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.8
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  } catch {
    toast.error("Failed to play notification sound");
  }
}

/**
 * Play notification based on type preference
 */
export function playNotification(
  type: "sound" | "browser" | "none",
  title = "Timer Complete!",
  body = "Your timer session has finished."
): void {
  switch (type) {
    case "sound":
      playNotificationSound();
      break;
    case "browser":
      showBrowserNotification(title, body);
      break;
    case "none":
    default:
      // Do nothing
      break;
  }
}
