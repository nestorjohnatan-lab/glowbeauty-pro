import React, { useState, useRef, useEffect } from 'react';
import { BeautyProProfile, AppLanguage, BookingNotification } from '../types';
import {
  Eye,
  Bell,
  BellRing,
  Check,
  Sparkles,
  MessageSquare,
  Volume2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  X
} from 'lucide-react';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface ProHeaderProps {
  profile: BeautyProProfile;
  todayCount: number;
  pendingAlertsCount: number;
  onPreviewClientView: () => void;
  lang: AppLanguage;
  onChangeLang: (l: AppLanguage) => void;
  notifications?: BookingNotification[];
  unreadNotificationsCount?: number;
  notificationPermission?: 'granted' | 'denied' | 'default' | 'unsupported';
  onRequestNotificationPermission?: () => Promise<void>;
  onTestNotification?: () => void;
  onMarkAllNotificationsRead?: () => void;
  onViewAppointment?: (appointmentId: string) => void;
  onOpenTutorial?: (tab?: 'pro' | 'client') => void;
  onOpenAiAssistant?: () => void;
}

const LANGUAGES: { code: AppLanguage; flag: string; label: string; short: string }[] = [
  { code: 'pt', flag: '🇧🇷', label: 'Português', short: 'PT' },
  { code: 'es', flag: '🇪🇸', label: 'Español', short: 'ES' },
  { code: 'en', flag: '🇺🇸', label: 'English', short: 'EN' }
];

export const ProHeader: React.FC<ProHeaderProps> = ({
  profile,
  todayCount,
  pendingAlertsCount,
  onPreviewClientView,
  lang,
  onChangeLang,
  notifications = [],
  unreadNotificationsCount = 0,
  notificationPermission = 'default',
  onRequestNotificationPermission,
  onTestNotification,
  onMarkAllNotificationsRead,
  onViewAppointment,
  onOpenTutorial,
  onOpenAiAssistant
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-3 sm:px-6 py-2 sm:py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* ============================================================== */}
        {/* ROW 1 (Mobile) / LEFT IDENTITY (Desktop)                        */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between gap-2 min-w-0 sm:flex-1">
          {/* Professional Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Avatar with luxury gold gradient ring */}
            <div className="relative shrink-0">
              <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl p-0.5 bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 shadow-2xs sm:shadow-xs">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-[9px] sm:rounded-[10px] object-cover bg-zinc-100"
                />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
                title="Online"
              />
            </div>

            {/* Name, PRO Badge & Business Subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm sm:text-base text-zinc-950 truncate tracking-tight">
                  {profile.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300/80 shrink-0 leading-none">
                  PRO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 truncate leading-tight mt-0.5 font-medium hidden sm:block">
                {profile.businessName}
              </p>
            </div>
          </div>

          {/* Mobile-Only CTA: Quick Catalog Preview Button */}
          <button
            onClick={onPreviewClientView}
            className="sm:hidden h-8 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
            title={t.previewClientBtn}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'pt' ? 'Catálogo' : lang === 'es' ? 'Catálogo' : 'Catalog'}</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* ROW 2 (Mobile Sub-bar) / RIGHT ACTIONS (Desktop Unified Bar)    */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1.5 sm:pt-0 border-t border-zinc-100 sm:border-t-0 shrink-0">
          {/* Mobile-Only Business Name on Row 2 */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 min-w-0 flex-1 sm:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate font-medium">{profile.businessName}</span>
          </div>

          {/* Action Tools Cluster: AI Assistant, Tutorial, Bell, Language & Desktop CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* 0. AI Assistant Button */}
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="h-8 sm:h-10 px-2 sm:px-3 rounded-xl bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 hover:from-amber-400/30 hover:to-yellow-400/30 border border-amber-300 text-amber-950 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-amber-400 active:scale-95 shrink-0"
                title={lang === 'pt' ? 'Assistente IA para responder clientes' : 'Asistente IA para responder clientas'}
                aria-label="Asistente IA"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
                <span className="hidden xs:inline">{lang === 'pt' ? 'Assistente IA' : 'Asistente IA'}</span>
                <span className="xs:hidden">IA</span>
              </button>
            )}

            {/* 1. Tutorial Button */}
            {onOpenTutorial && (
              <button
                onClick={() => onOpenTutorial('pro')}
                className="h-8 sm:h-10 px-2 sm:px-3 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200/90 text-amber-950 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-amber-300 active:scale-95 shrink-0"
                title={t.tutorialTitle || 'Guía y Tutoriales'}
                aria-label="Tutorial"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
                <span>{t.tutorialBtn || 'Tutorial'}</span>
              </button>
            )}

            {/* 2. Notification Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setShowNotifMenu((prev) => !prev);
                  if (!showNotifMenu && unreadNotificationsCount > 0 && onMarkAllNotificationsRead) {
                    onMarkAllNotificationsRead();
                  }
                }}
                className={`relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl transition-all border shrink-0 ${
                  unreadNotificationsCount > 0
                    ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-900 shadow-2xs ring-2 ring-amber-400/20'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200/80 text-zinc-700'
                }`}
                title={t.notifCenterTitle || 'Notificaciones de Reservas'}
                aria-label="Notificaciones"
              >
                {unreadNotificationsCount > 0 ? (
                  <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 animate-wiggle" />
                ) : (
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600" />
                )}
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-amber-500 text-zinc-950 text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Menu Popover & Mobile Backdrop */}
              {showNotifMenu && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-zinc-950/30 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
                    onClick={() => setShowNotifMenu(false)}
                  />

                  {/* Notification Container: Fixed sheet on mobile (inset-x-3), Absolute dropdown on desktop */}
                  <div className="fixed inset-x-3 top-20 sm:top-full sm:absolute sm:right-0 sm:inset-x-auto sm:mt-2 w-auto sm:w-96 max-w-md mx-auto sm:mx-0 bg-white border border-zinc-200/90 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 flex flex-col max-h-[80vh] sm:max-h-[520px]">
                    {/* Popover Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-zinc-900">
                          {t.notifCenterTitle || 'Notificaciones de Reservas'}
                        </span>
                        {notifications.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            {notifications.length}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && onMarkAllNotificationsRead && (
                          <button
                            onClick={onMarkAllNotificationsRead}
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                          >
                            {t.notifMarkAllRead || 'Marcar leídas'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifMenu(false)}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                          title="Cerrar"
                          aria-label="Cerrar notificaciones"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Browser Notification Status & Permission Banner */}
                    <div className="bg-gradient-to-br from-zinc-50 to-amber-50/40 border border-amber-200/80 rounded-xl p-2.5 mb-2.5 shrink-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {notificationPermission === 'granted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : notificationPermission === 'denied' ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : (
                            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-zinc-900 block truncate leading-tight">
                              {notificationPermission === 'granted'
                                ? (t.notifEnabled || 'Notificaciones Activas')
                                : notificationPermission === 'denied'
                                ? (t.notifBlocked || 'Notificaciones Bloqueadas')
                                : (t.notifEnableBtn || 'Activar Alertas Web')}
                            </span>
                            <span className="text-[10px] text-zinc-500 block truncate leading-tight mt-0.5">
                              {notificationPermission === 'granted'
                                ? (lang === 'es'
                                    ? 'Avisos sonoros y emergentes al recibir citas'
                                    : lang === 'en'
                                    ? 'Sound & popup alerts enabled for new bookings'
                                    : 'Avisos sonoros e popups ativos para agendamentos')
                                : notificationPermission === 'denied'
                                ? (lang === 'es'
                                    ? 'Permisos bloqueados en tu navegador'
                                    : lang === 'en'
                                    ? 'Permissions blocked in browser'
                                    : 'Permissões bloqueadas no navegador')
                                : (lang === 'es'
                                    ? 'Recibe avisos inmediatos en tu pantalla'
                                    : lang === 'en'
                                    ? 'Get instant alerts on screen when clients book'
                                    : 'Receba alertas instantâneos ao agendar')}
                            </span>
                          </div>
                        </div>

                        {notificationPermission === 'granted' && onTestNotification && (
                          <button
                            onClick={onTestNotification}
                            className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-zinc-950 text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
                            title="Probar sonido y notificación"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{t.notifTestBtn || 'Test'}</span>
                          </button>
                        )}

                        {notificationPermission === 'default' && onRequestNotificationPermission && (
                          <button
                            onClick={onRequestNotificationPermission}
                            className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 text-[10px] font-bold rounded-lg shrink-0 shadow-2xs transition-colors"
                          >
                            {lang === 'es' ? 'Permitir' : lang === 'en' ? 'Allow' : 'Permitir'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List (Scrollable) */}
                    <div className="overflow-y-auto space-y-2 pr-1 flex-1 min-h-0">
                      {notifications.length === 0 ? (
                        <div className="py-7 text-center">
                          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-1.5 opacity-60" />
                          <p className="text-xs font-semibold text-zinc-700">
                            {t.notifEmpty || 'No hay citas nuevas por el momento'}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {lang === 'es'
                              ? 'Las reservas de tus clientas aparecerán aquí al instante.'
                              : lang === 'en'
                              ? 'Bookings from your clients will appear here instantly.'
                              : 'Os agendamentos das suas clientes aparecerão aqui na hora.'}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const clientWa = notif.clientWhatsapp
                            ? buildWhatsAppUrl(
                                notif.clientWhatsapp,
                                `Olá ${notif.clientName}! Confirmando seu horário para ${notif.serviceName} no dia ${notif.date} às ${notif.time}hs.`
                              )
                            : '';

                          return (
                            <div
                              key={notif.id}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                !notif.read
                                  ? 'bg-amber-50/70 border-amber-200/90 shadow-2xs'
                                  : 'bg-zinc-50/90 hover:bg-zinc-100/60 border-zinc-200/80'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-300 text-amber-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {notif.clientName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-bold text-zinc-900 truncate">
                                    {notif.clientName}
                                  </span>
                                  {!notif.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-800 shrink-0 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
                                  {formatPrice(notif.price, notif.currency, lang)}
                                </span>
                              </div>

                              <p className="text-[11px] text-zinc-800 font-semibold truncate mb-1 pl-6.5">
                                {notif.serviceName}
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-200/60">
                                <span className="font-medium">
                                  📅 {notif.date} • {notif.time}hs
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {onViewAppointment && (
                                    <button
                                      onClick={() => {
                                        onViewAppointment(notif.appointmentId);
                                        setShowNotifMenu(false);
                                      }}
                                      className="px-2 py-0.5 rounded-md bg-zinc-200/80 hover:bg-zinc-300 text-zinc-900 text-[10px] font-bold transition-colors"
                                    >
                                      {t.notifViewInAgenda || 'Ver'}
                                    </button>
                                  )}
                                  {clientWa && (
                                    <a
                                      href={clientWa}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded-md bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition-colors flex items-center gap-1 border border-emerald-300/60"
                                      title="WhatsApp"
                                    >
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      <span>WA</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Popover Footer */}
                    {notifications.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
                        <span>
                          {unreadNotificationsCount > 0
                            ? `${unreadNotificationsCount} ${lang === 'pt' ? 'não lidas' : 'sin leer'}`
                            : (lang === 'pt' ? 'Todas lidas' : 'Todas leídas')}
                        </span>
                        <button
                          onClick={() => setShowNotifMenu(false)}
                          className="font-bold text-amber-700 hover:text-amber-800 transition-colors"
                        >
                          {lang === 'pt' ? 'Fechar' : lang === 'en' ? 'Close' : 'Cerrar'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 3. Compact Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="h-8 sm:h-10 px-2 sm:px-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/90 text-zinc-800 text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs active:scale-95 shrink-0"
                title="Cambiar idioma / Idioma"
                aria-label="Idioma"
              >
                <span className="text-xs sm:text-sm leading-none">{currentLangObj.flag}</span>
                <span className="text-[11px] font-bold text-zinc-700 hidden sm:inline">
                  {currentLangObj.short}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-500 transition-transform ${
                    showLangMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        onChangeLang(item.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between text-left transition-colors ${
                        lang === item.code
                          ? 'bg-amber-50 font-bold text-amber-900'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {lang === item.code && (
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Desktop-Only CTA Button */}
            <button
              onClick={onPreviewClientView}
              className="hidden sm:flex h-10 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 text-xs font-bold items-center gap-1.5 shadow-sm shadow-amber-500/15 transition-all active:scale-95 shrink-0"
              title={t.previewClientBtn}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{t.previewClientBtn}</span>
              <span className="inline md:hidden">
                {lang === 'pt' ? 'Catálogo' : lang === 'es' ? 'Catálogo' : 'Catalog'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


