import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BeautyProProfile,
  BeautyService,
  Appointment,
  WhatsAppTemplate,
  AppViewMode,
  ProTab,
  AppointmentStatus,
  AppLanguage,
  BookingNotification,
  ClientTechnicalNote
} from './types';
import {
  INITIAL_PRO_PROFILE,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_TEMPLATES,
  INITIAL_CLIENT_TECHNICAL_NOTES
} from './data/initialData';
import { ClientPublicPortal } from './components/ClientPublicPortal';
import { AppointmentsManager } from './components/AppointmentsManager';
import { ServiceCatalogManager } from './components/ServiceCatalogManager';
import { WhatsAppAlertsCenter } from './components/WhatsAppAlertsCenter';
import { ProfileAndShareManager } from './components/ProfileAndShareManager';
import { ProHeader } from './components/ProHeader';
import { ProBottomNav } from './components/ProBottomNav';
import { BookingNotificationToast } from './components/BookingNotificationToast';
import { AiClientAssistantModal } from './components/AiClientAssistantModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  playNotificationSound,
  triggerBrowserNotification,
  broadcastNewBooking,
  subscribeToBookingBroadcasts
} from './utils/browserNotifications';
import { cleanPhoneNumber } from './utils/whatsapp';

// Local storage keys
const STORAGE_KEYS = {
  profile: 'glow_pro_profile_v3',
  services: 'glow_pro_services_v3',
  appointments: 'glow_pro_appointments_v3',
  templates: 'glow_pro_templates_v3',
  lang: 'glow_app_lang_v3',
  notifications: 'glow_pro_notifications_v3',
  clientNotes: 'glow_pro_client_notes_v3',
  authToken: 'glow_pro_auth_token_v3',
  authEmail: 'glow_pro_auth_email_v3'
};

export default function App() {
  // Authentication & View State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.authToken);
  });
  const [authEmail, setAuthEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.authEmail);
  });

  // Default view is client (public) unless authenticated or explicitly visiting /admin
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window === 'undefined') return 'client';
    const params = new URLSearchParams(window.location.search);
    const hasToken = !!localStorage.getItem(STORAGE_KEYS.authToken);
    if (params.get('panel') === 'pro' && hasToken) {
      return 'pro';
    }
    return 'client';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [proTab, setProTab] = useState<ProTab>('agenda');
  const [lang, setLang] = useState<AppLanguage>('pt');

  // Core Data State
  const [profile, setProfile] = useState<BeautyProProfile>(INITIAL_PRO_PROFILE);
  const [services, setServices] = useState<BeautyService[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(INITIAL_TEMPLATES);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [clientTechnicalNotes, setClientTechnicalNotes] = useState<Record<string, ClientTechnicalNote>>(INITIAL_CLIENT_TECHNICAL_NOTES);
  const [activeToasts, setActiveToasts] = useState<BookingNotification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(getBrowserNotificationPermission);

  // AI Assistant Modal State
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [aiAssistantPreselectedAppointment, setAiAssistantPreselectedAppointment] = useState<Appointment | null>(null);

  const handleOpenAiAssistant = useCallback((apt?: Appointment | null) => {
    setAiAssistantPreselectedAppointment(apt || null);
    setIsAiAssistantOpen(true);
  }, []);

  // Sync data with backend API
  const refreshDataFromServer = useCallback(async (token: string | null) => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Public profile & services are always available
      const [pubRes, srvRes] = await Promise.all([
        fetch('/api/public/profile').then((r) => r.json()).catch(() => null),
        fetch('/api/services').then((r) => r.json()).catch(() => null)
      ]);

      if (pubRes && pubRes.profile) {
        setProfile(pubRes.profile);
      }
      if (Array.isArray(srvRes) && srvRes.length > 0) {
        setServices(srvRes);
      }

      // If authenticated, also fetch appointments, templates and notes
      if (token) {
        const [aptRes, tplRes, notesRes] = await Promise.all([
          fetch('/api/appointments', { headers }).then((r) => r.json()).catch(() => null),
          fetch('/api/templates', { headers }).then((r) => r.json()).catch(() => null),
          fetch('/api/technical-notes', { headers }).then((r) => r.json()).catch(() => null)
        ]);

        if (Array.isArray(aptRes)) {
          setAppointments(aptRes);
        }
        if (Array.isArray(tplRes) && tplRes.length > 0) {
          setTemplates(tplRes);
        }
        if (Array.isArray(notesRes) && notesRes.length > 0) {
          const notesMap: Record<string, ClientTechnicalNote> = {};
          notesRes.forEach((n: ClientTechnicalNote) => {
            const cleanPhone = cleanPhoneNumber(n.clientPhone);
            const key = cleanPhone ? `+${cleanPhone}` : (n.clientPhone || n.clientName || n.id);
            notesMap[key] = n;
          });
          setClientTechnicalNotes(notesMap);
        }
      }
    } catch (err) {
      console.warn('Error refreshing data from server:', err);
    }
  }, []);

  useEffect(() => {
    refreshDataFromServer(authToken);
  }, [authToken, refreshDataFromServer]);

  // Auth Handlers
  const handleLoginSuccess = (token: string, email: string) => {
    setAuthToken(token);
    setAuthEmail(email);
    localStorage.setItem(STORAGE_KEYS.authToken, token);
    localStorage.setItem(STORAGE_KEYS.authEmail, email);
    setViewMode('pro');
    refreshDataFromServer(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthEmail(null);
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.authEmail);
    setViewMode('client');
  };

  const handleRequestProView = () => {
    if (authToken) {
      setViewMode('pro');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleToggleViewMode = (mode: AppViewMode) => {
    if (mode === 'pro') {
      handleRequestProView();
    } else {
      setViewMode('client');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeLanguage = (newLang: AppLanguage) => {
    setLang(newLang);
  };

  // Notification trigger & cross-tab sync
  const triggerNotificationAlert = useCallback((apt: Appointment, isOriginTab: boolean = true) => {
    const newNotif: BookingNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      appointmentId: apt.id,
      clientName: apt.clientName,
      clientWhatsapp: apt.clientWhatsapp,
      serviceName: apt.serviceName,
      date: apt.date,
      time: apt.time,
      price: apt.price,
      currency: apt.currency || profile.currency,
      createdAt: new Date().toISOString(),
      read: false
    };

    playNotificationSound();

    triggerBrowserNotification(apt, profile, lang, () => {
      if (authToken) {
        setViewMode('pro');
        setProTab('agenda');
      }
      setNotifications((prev) =>
        prev.map((n) => (n.appointmentId === apt.id ? { ...n, read: true } : n))
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
    setActiveToasts((prev) => [newNotif, ...prev.slice(0, 2)]);

    if (isOriginTab) {
      broadcastNewBooking(apt);
    }
  }, [profile, lang, authToken]);

  useEffect(() => {
    const unsubscribe = subscribeToBookingBroadcasts((incomingApt) => {
      triggerNotificationAlert(incomingApt, false);
    });
    return unsubscribe;
  }, [triggerNotificationAlert]);

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Client Technical Notes
  const handleSaveClientTechnicalNote = useCallback((note: ClientTechnicalNote) => {
    const cleanPhone = cleanPhoneNumber(note.clientPhone);
    const key = cleanPhone ? `+${cleanPhone}` : (note.clientPhone || note.clientName || note.id);

    setClientTechnicalNotes((prev) => ({
      ...prev,
      [key]: note
    }));

    if (authToken) {
      fetch('/api/technical-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(note)
      }).catch((err) => console.warn('Could not persist technical note', err));
    }
  }, [authToken]);

  // Appointment Actions
  const handleBookAppointment = async (newAptData: Partial<Appointment>): Promise<Appointment> => {
    const fallback: Appointment = {
      id: `apt-${Date.now()}`,
      clientName: newAptData.clientName || 'Cliente',
      clientWhatsapp: newAptData.clientWhatsapp || '',
      clientNotes: newAptData.clientNotes || '',
      serviceId: newAptData.serviceId || 'srv-default',
      serviceName: newAptData.serviceName || 'Procedimento',
      serviceCategory: newAptData.serviceCategory || 'outro',
      date: newAptData.date || new Date().toISOString().split('T')[0],
      time: newAptData.time || '10:00',
      durationMinutes: newAptData.durationMinutes || 60,
      price: newAptData.price || 120,
      currency: profile.currency,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      depositPaid: false
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAptData)
      });
      if (res.ok) {
        const created: Appointment = await res.json();
        setAppointments((prev) => [created, ...prev]);
        triggerNotificationAlert(created, true);
        return created;
      }
    } catch (err) {
      console.warn('API error saving appointment', err);
    }

    setAppointments((prev) => [fallback, ...prev]);
    triggerNotificationAlert(fallback, true);
    return fallback;
  };

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    if (authToken) {
      try {
        await fetch(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ status })
        });
      } catch {}
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (authToken) {
      try {
        await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch {}
    }
  };

  // Service Actions
  const handleCreateService = async (newService: Partial<BeautyService>) => {
    const createdItem: BeautyService = {
      id: `srv-${Date.now()}`,
      name: newService.name || 'Novo Procedimento',
      category: newService.category || 'outro',
      description: newService.description || '',
      durationMinutes: newService.durationMinutes || 60,
      price: newService.price || 120,
      suggestedMaintenanceDays: newService.suggestedMaintenanceDays || 21,
      imageUrl: newService.imageUrl,
      prepInstructions: newService.prepInstructions,
      careInstructions: newService.careInstructions,
      popular: newService.popular,
      isActive: true
    };

    setServices((prev) => [createdItem, ...prev]);

    if (authToken) {
      try {
        await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(createdItem)
        });
      } catch {}
    }
  };

  const handleUpdateService = async (id: string, patch: Partial<BeautyService>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

    if (authToken) {
      try {
        await fetch(`/api/services/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(patch)
        });
      } catch {}
    }
  };

  const handleDeleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (authToken) {
      try {
        await fetch(`/api/services/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch {}
    }
  };

  // Profile Action
  const handleUpdateProfile = async (updated: Partial<BeautyProProfile>) => {
    const merged = { ...profile, ...updated };
    setProfile(merged);

    if (authToken) {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(merged)
        });
        if (res.ok) {
          const saved = await res.json();
          if (saved && saved.name) setProfile(saved);
        }
      } catch (e) {
        console.warn('API error updating profile', e);
      }
    }
  };

  // Template Action
  const handleUpdateTemplate = async (id: string, newText: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, template: newText } : t))
    );

    if (authToken) {
      try {
        await fetch(`/api/templates/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ template: newText })
        });
      } catch {}
    }
  };

  // Indicators
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayCount = useMemo(() => {
    return appointments.filter((a) => a.date === todayIso && a.status !== 'cancelled').length;
  }, [appointments, todayIso]);

  const pendingAlertsCount = useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === 'cancelled') return false;
      const aptDate = new Date(a.date + 'T12:00:00');
      const diffDays = Math.floor((Date.now() - aptDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 17 && diffDays <= 45;
    }).length;
  }, [appointments]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans selection:bg-amber-400 selection:text-zinc-950">
      {/* Toast Notifications */}
      <BookingNotificationToast
        notifications={activeToasts}
        onDismiss={handleDismissToast}
        onViewAppointment={(appointmentId) => {
          if (authToken) {
            setViewMode('pro');
            setProTab('agenda');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        lang={lang}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* CLIENT PUBLIC PORTAL (Default) */}
      {viewMode === 'client' ? (
        <ClientPublicPortal
          profile={profile}
          services={services}
          existingAppointments={appointments}
          onBookAppointment={handleBookAppointment}
          onSwitchToProView={handleRequestProView}
          isStandaloneClient={false}
          lang={lang}
        />
      ) : (
        /* PRO MANAGEMENT DASHBOARD (Protected by Auth) */
        <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1F1E1D] selection:bg-[#72202E] selection:text-white">
          <ProHeader
            profile={profile}
            todayCount={todayCount}
            pendingAlertsCount={pendingAlertsCount}
            onPreviewClientView={() => handleToggleViewMode('client')}
            lang={lang}
            onChangeLang={handleChangeLanguage}
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={async () => {
              const res = await requestBrowserNotificationPermission();
              setNotificationPermission(res);
            }}
            onMarkAllNotificationsRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
            onViewAppointment={(appointmentId) => {
              setProTab('agenda');
              setNotifications((prev) =>
                prev.map((n) => (n.appointmentId === appointmentId ? { ...n, read: true } : n))
              );
            }}
            onOpenAiAssistant={() => handleOpenAiAssistant(null)}
          />

          <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-24">
            {proTab === 'agenda' && (
              <AppointmentsManager
                appointments={appointments}
                profile={profile}
                services={services}
                onUpdateStatus={handleUpdateAppointmentStatus}
                onDeleteAppointment={handleDeleteAppointment}
                onManualCreateAppointment={handleBookAppointment}
                clientTechnicalNotes={clientTechnicalNotes}
                onSaveClientTechnicalNote={handleSaveClientTechnicalNote}
                onOpenAiAssistantForAppointment={(apt) => handleOpenAiAssistant(apt)}
                lang={lang}
              />
            )}

            {proTab === 'services' && (
              <ServiceCatalogManager
                services={services}
                profile={profile}
                onCreateService={handleCreateService}
                onUpdateService={handleUpdateService}
                onDeleteService={handleDeleteService}
                lang={lang}
              />
            )}

            {proTab === 'alerts' && (
              <WhatsAppAlertsCenter
                appointments={appointments}
                profile={profile}
                services={services}
                templates={templates}
                onUpdateTemplate={handleUpdateTemplate}
                lang={lang}
              />
            )}

            {(proTab === 'social_profile' || proTab === 'share') && (
              <ProfileAndShareManager
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onPreviewClientView={() => handleToggleViewMode('client')}
                lang={lang}
              />
            )}
          </main>

          <ProBottomNav
            currentTab={proTab}
            onSelectTab={setProTab}
            todayCount={todayCount}
            pendingAlertsCount={pendingAlertsCount}
            lang={lang}
          />
        </div>
      )}

      {/* AI Client Assistant Modal */}
      <AiClientAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        profile={profile}
        services={services}
        preselectedAppointment={aiAssistantPreselectedAppointment}
        lang={lang}
      />
    </div>
  );
}
