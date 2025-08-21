/**
 * Notification utilities for timer events
 * Supports both audio and browser notifications
 */

import { toast } from "sonner";

// Extended window interface for WebKit audio context
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

// Global audio management
let currentAudio: HTMLAudioElement | null = null;
let currentAudioContext: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];

/**
 * Stop all currently playing notification sounds
 */
export function stopNotificationSound(): void {
  try {
    // Stop HTML5 Audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    // Stop all Web Audio oscillators
    currentOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
        console.error("Error stopping osciallators", e);
      }
    });
    currentOscillators = [];

    // Close audio context if it exists
    if (currentAudioContext && currentAudioContext.state !== "closed") {
      currentAudioContext.close();
      currentAudioContext = null;
    }
  } catch (error) {
    // Silent fail - stopping sounds shouldn't throw errors to user
  }
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
 * Play different types of notification sounds
 */
export function playNotificationSound(
  soundType: "bell" | "chime" | "gentle" | "digital" | "custom" = "bell",
  customAudioFile?: string | null
): void {
  switch (soundType) {
    case "bell":
      playBellSound();
      break;
    case "chime":
      playChimeSound();
      break;
    case "gentle":
      playGentleSound();
      break;
    case "digital":
      playDigitalSound();
      break;
    case "custom":
      if (customAudioFile) {
        playCustomSound(customAudioFile);
      } else {
        toast.error("No custom audio file selected");
      }
      break;
    default:
      playBellSound();
  }
}

/**
 * Plays a pleasant bell notification sound using Web Audio API
 * Creates a double-chime bell-like sound to alert when timer completes
 */
function playBellSound(): void {
  try {
    // Stop any currently playing sound first
    stopNotificationSound();

    // Create a simple audio context to generate a pleasant notification sound
    const AudioContextClass =
      window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
    if (!AudioContextClass) {
      toast.error("Audio notifications not supported");
      return;
    }

    const audioContext = new AudioContextClass();
    currentAudioContext = audioContext; // Register for stopping

    // Create oscillator for a pleasant bell-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    currentOscillators.push(oscillator); // Register for stopping

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

    // Clean up when sound ends
    setTimeout(() => {
      currentAudioContext = null;
      currentOscillators = [];
    }, 1000);
  } catch {
    toast.error("Failed to play notification sound");
  }
}

/**
 * Plays a custom audio file
 */
function playCustomSound(audioDataUrl: string): void {
  try {
    // Stop any currently playing sound first
    stopNotificationSound();

    const audio = new Audio(audioDataUrl);
    audio.volume = 0.7; // Set comfortable volume
    currentAudio = audio; // Register for stopping

    audio.play().catch(() => {
      toast.error("Failed to play custom audio file");
      currentAudio = null;
    });

    // Clear reference when audio ends
    audio.onended = () => {
      currentAudio = null;
    };
  } catch {
    toast.error("Failed to play custom audio file");
  }
}

/**
 * Plays a gentle chime sound
 */
function playChimeSound(): void {
  try {
    stopNotificationSound();

    const AudioContextClass =
      window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
    if (!AudioContextClass) {
      toast.error("Audio notifications not supported");
      return;
    }

    const audioContext = new AudioContextClass();
    currentAudioContext = audioContext;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    currentOscillators.push(oscillator);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Gentle chime - higher pitch, softer
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      audioContext.currentTime + 0.5
    );

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1.0
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);

    setTimeout(() => {
      currentAudioContext = null;
      currentOscillators = [];
    }, 1200);
  } catch {
    toast.error("Failed to play notification sound");
  }
}

/**
 * Plays a gentle/soft notification sound
 */
function playGentleSound(): void {
  try {
    stopNotificationSound();

    const AudioContextClass =
      window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
    if (!AudioContextClass) {
      toast.error("Audio notifications not supported");
      return;
    }

    const audioContext = new AudioContextClass();
    currentAudioContext = audioContext;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    currentOscillators.push(oscillator);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Very gentle, low volume
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      220,
      audioContext.currentTime + 0.8
    );

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 1.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.2);

    setTimeout(() => {
      currentAudioContext = null;
      currentOscillators = [];
    }, 1400);
  } catch {
    toast.error("Failed to play notification sound");
  }
}

/**
 * Plays a digital beep sound
 */
function playDigitalSound(): void {
  try {
    stopNotificationSound();

    const AudioContextClass =
      window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
    if (!AudioContextClass) {
      toast.error("Audio notifications not supported");
      return;
    }

    const audioContext = new AudioContextClass();
    currentAudioContext = audioContext;

    // Create three quick beeps
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      currentOscillators.push(oscillator);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const startTime = audioContext.currentTime + i * 0.15;

      oscillator.frequency.setValueAtTime(1000, startTime);
      oscillator.type = "square"; // Digital square wave

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    }

    setTimeout(() => {
      currentAudioContext = null;
      currentOscillators = [];
    }, 500);
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
