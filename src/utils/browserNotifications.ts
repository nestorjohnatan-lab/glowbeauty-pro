import { Appointment, BeautyProProfile, AppLanguage } from '../types';
import { formatPrice } from './i18n';

// Check if browser native notifications are supported
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getBrowserNotificationPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request permission
export async function requestBrowserNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return Notification.permission;
  }
}

// Elegant luxury boutique chime using Web Audio API (zero external assets, instant & reliable)
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic double chime: Note 1 (E5, 659.25 Hz) -> Note 2 (A5, 880 Hz)
    const tones = [
      { freq: 659.25, time: now, duration: 0.4 },
      { freq: 880.0, time: now + 0.12, duration: 0.6 }
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Soft attack & exponential decay for bell-like tone
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });

    // Close audio context after sound finishes to free resources
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (e) {
    // Non-blocking fallback if browser policy restricts audio before user interaction
    console.warn('Audio chime skipped due to policy', e);
  }
}

// Send native browser notification
export function triggerBrowserNotification(
  appointment: Appointment,
  profile: BeautyProProfile,
  lang: AppLanguage = 'pt',
  onNotificationClick?: () => void
): Notification | null {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const formattedPrice = formatPrice(appointment.price, appointment.currency, lang);
    const dateFormatted = appointment.date;
    
    let title = '✨ Novo Agendamento Recebido!';
    let body = `${appointment.clientName} reservou ${appointment.serviceName} para ${dateFormatted} às ${appointment.time}hs (${formattedPrice})`;

    if (lang === 'es') {
      title = '✨ ¡Nueva Cita Reservada!';
      body = `${appointment.clientName} agendó ${appointment.serviceName} para el ${dateFormatted} a las ${appointment.time}hs (${formattedPrice})`;
    } else if (lang === 'en') {
      title = '✨ New Booking Received!';
      body = `${appointment.clientName} booked ${appointment.serviceName} for ${dateFormatted} at ${appointment.time} (${formattedPrice})`;
    }

    const notif = new Notification(title, {
      body,
      icon: profile.avatarUrl || '/favicon.ico',
      tag: `booking-${appointment.id}`,
      badge: profile.avatarUrl,
      requireInteraction: false
    });

    notif.onclick = () => {
      window.focus();
      onNotificationClick?.();
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('Error displaying native browser notification', err);
    return null;
  }
}

// Cross-tab broadcast mechanism
const BROADCAST_CHANNEL_NAME = 'glowbeauty_booking_alerts';

export function broadcastNewBooking(appointment: Appointment): void {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel API
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: 'NEW_BOOKING', appointment });
      channel.close();
    } catch {}
  }

  // 2. Storage event fallback for cross-tab sync
  try {
    localStorage.setItem(
      'glow_last_booking_event',
      JSON.stringify({ timestamp: Date.now(), appointment })
    );
  } catch {}
}

export function subscribeToBookingBroadcasts(
  onNewBooking: (appointment: Appointment) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;

  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_BOOKING' && event.data.appointment) {
          onNewBooking(event.data.appointment);
        }
      };
    } catch {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'glow_last_booking_event' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data && data.appointment) {
          onNewBooking(data.appointment);
        }
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}
