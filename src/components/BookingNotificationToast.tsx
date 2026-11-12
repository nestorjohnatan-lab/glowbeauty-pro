import React, { useEffect, useState } from 'react';
import { BookingNotification, AppLanguage } from '../types';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import { Sparkles, Calendar, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface BookingNotificationToastProps {
  notifications: BookingNotification[];
  onDismiss: (id: string) => void;
  onViewAppointment: (appointmentId: string) => void;
  lang: AppLanguage;
}

export const BookingNotificationToast: React.FC<BookingNotificationToastProps> = ({
  notifications,
  onDismiss,
  onViewAppointment,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {notifications.slice(0, 3).map((notif) => (
        <SingleToastItem
          key={notif.id}
          notif={notif}
          onDismiss={onDismiss}
          onViewAppointment={onViewAppointment}
          lang={lang}
          t={t}
        />
      ))}
    </div>
  );
};

interface SingleToastItemProps {
  notif: BookingNotification;
  onDismiss: (id: string) => void;
  onViewAppointment: (appointmentId: string) => void;
  lang: AppLanguage;
  t: (typeof TRANSLATIONS)['pt'];
}

const SingleToastItem: React.FC<SingleToastItemProps> = ({
  notif,
  onDismiss,
  onViewAppointment,
  lang,
  t
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const DURATION_MS = 10000;

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const decrement = (interval / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss(notif.id);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, notif.id, onDismiss]);

  const clientWhatsAppUrl = notif.clientWhatsapp
    ? buildWhatsAppUrl(
        notif.clientWhatsapp,
        lang === 'es'
          ? `¡Hola ${notif.clientName}! Recibí tu reserva para ${notif.serviceName} el ${notif.date} a las ${notif.time}hs. ¡Te esperamos!`
          : lang === 'en'
          ? `Hi ${notif.clientName}! I received your booking for ${notif.serviceName} on ${notif.date} at ${notif.time}. Looking forward to seeing you!`
          : `Olá ${notif.clientName}! Recebi seu agendamento para ${notif.serviceName} no dia ${notif.date} às ${notif.time}hs. Aguardo você!`
      )
    : '';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#72202E]/30/90 rounded-2xl p-4 shadow-xl shadow-amber-950/10 transition-all duration-300 animate-in slide-in-from-top-4 fade-in overflow-hidden relative"
    >
      {/* Top golden progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#72202E]/10">
        <div
          className="h-full bg-gradient-to-r from-[#72202E] to-[#581520] transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header with badge and close button */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-950">
                {t.notifTitle || '¡Nueva Cita Reservada! ✨'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-500">
              {lang === 'es' ? 'Portal del Cliente' : lang === 'en' ? 'Client Portal' : 'Portal da Cliente'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDismiss(notif.id)}
          className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Client & Service Info Card */}
      <div className="bg-zinc-50/90 border border-zinc-200/80 rounded-xl p-2.5 mb-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 mb-1">
          <span className="truncate">{notif.clientName}</span>
          <span className="font-bold text-[#72202E] font-mono text-[11px] shrink-0">
            {formatPrice(notif.price, notif.currency, lang)}
          </span>
        </div>
        <p className="text-xs text-zinc-700 font-medium truncate mb-1.5">
          {notif.serviceName}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#72202E]" />
            {notif.date}
          </span>
          <span>•</span>
          <span className="font-mono font-medium text-zinc-700">
            {notif.time}hs
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onViewAppointment(notif.appointmentId);
            onDismiss(notif.id);
          }}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Calendar className="w-3 h-3 text-amber-400" />
          <span>{t.notifViewInAgenda || 'Ver en Agenda'}</span>
        </button>

        {clientWhatsAppUrl && (
          <a
            href={clientWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDismiss(notif.id)}
            className="py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
};
