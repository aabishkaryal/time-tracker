/**
 * Audio notification utilities for timer events
 */

// Extended window interface for WebKit audio context
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
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
      console.log("AudioContext not supported");
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
    gainNode.gain.linearRampToValueAtTime(
      0.3,
      audioContext.currentTime + 0.1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.8
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);

    // Play a second chime for emphasis
    setTimeout(() => {
      try {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();

        osc2.connect(gain2);
        gain2.connect(audioContext.destination);

        osc2.frequency.setValueAtTime(600, audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(
          300,
          audioContext.currentTime + 0.3
        );

        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(
          0.25,
          audioContext.currentTime + 0.1
        );
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.6
        );

        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.6);
      } catch (secondError) {
        console.log("Second chime failed:", secondError);
      }
    }, 200);
  } catch (error) {
    console.log("Audio notification not supported:", error);
    // Fallback: could add browser notification here later
  }
}