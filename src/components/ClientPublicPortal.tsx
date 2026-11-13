import React, { useState, useMemo } from 'react';
import {
  BeautyProProfile,
  BeautyService,
  Appointment,
  ServiceCategory,
  ProfileHighlight,
  AppLanguage,
  DaySchedule
} from '../types';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Check,
  Phone,
  Instagram,
  Star,
  ChevronRight,
  ArrowLeft,
  RotateCw,
  Camera,
  Copy,
  Info,
  CalendarPlus,
  X,
  BookOpen,
  CreditCard,
  Building,
  Share2
} from 'lucide-react';
import { TRANSLATIONS, formatPrice, getCategoryLabel, DIAL_CODES } from '../utils/i18n';
import {
  cleanPhoneNumber,
  buildWhatsAppUrl,
  generateClientBookingMessageForPro,
  formatFriendlyDate
} from '../utils/whatsapp';
import { AppTutorialModal } from './AppTutorialModal';
import { EditorialNavbar } from './editorial/EditorialNavbar';
import { EditorialHero } from './editorial/EditorialHero';
import { EditorialServices } from './editorial/EditorialServices';
import { EditorialAbout } from './editorial/EditorialAbout';
import { EditorialPortfolio } from './editorial/EditorialPortfolio';
import { EditorialFooter } from './editorial/EditorialFooter';

interface ClientPublicPortalProps {
  profile: BeautyProProfile;
  services: BeautyService[];
  existingAppointments: Appointment[];
  onBookAppointment: (data: Partial<Appointment>) => Promise<Appointment | null>;
  onSwitchToProView?: () => void;
  isStandaloneClient?: boolean;
  lang?: AppLanguage;
}

const CATEGORIES: { id: ServiceCategory | 'todos'; icon: string }[] = [
  { id: 'todos', icon: '✨' },
  { id: 'pestañas', icon: '✨' },
  { id: 'cejas', icon: '👁️' },
  { id: 'uñas', icon: '💅' },
  { id: 'facial', icon: '💆‍♀️' },
  { id: 'maquillaje', icon: '💄' },
  { id: 'cabello', icon: '✂️' },
  { id: 'depilacion', icon: '🌿' },
  { id: 'labios', icon: '💋' }
];

export const ClientPublicPortal: React.FC<ClientPublicPortalProps> = ({
  profile,
  services,
  existingAppointments,
  onBookAppointment,
  onSwitchToProView,
  isStandaloneClient = false,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  // Multi-step booking flow:
  // Step 1: Catalog & Select Service
  // Step 2: Date & Time Slot Picker
  // Step 3: Client Info & PIX Sinal
  // Step 4: Booking Confirmation & WhatsApp Action
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected service & category filter
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'todos'>('todos');
  const [selectedService, setSelectedService] = useState<BeautyService | null>(null);

  // Helper to obtain day schedule with fallback
  const getDaySchedule = (dayOfWeek: number): DaySchedule => {
    if (Array.isArray(profile.weeklySchedule) && profile.weeklySchedule.length === 7) {
      const found = profile.weeklySchedule.find((s) => s.dayOfWeek === dayOfWeek);
      if (found) return found;
    }
    const isWorkingDay = profile.workingDays ? profile.workingDays.includes(dayOfWeek) : dayOfWeek !== 0;
    return {
      dayOfWeek,
      isOpen: isWorkingDay,
      openTime: profile.workingHours?.start || '09:00',
      closeTime: profile.workingHours?.end || '19:00',
      hasBreak: false
    };
  };

  // State for business hours modal and closed date interaction notice
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [closedDateNotice, setClosedDateNotice] = useState<string | null>(null);

  // Selected date & time - automatically picks the first open date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay();
      let isOpen = false;
      if (Array.isArray(profile.weeklySchedule) && profile.weeklySchedule.length === 7) {
        const found = profile.weeklySchedule.find((s) => s.dayOfWeek === dow);
        isOpen = !!found?.isOpen;
      } else {
        isOpen = profile.workingDays ? profile.workingDays.includes(dow) : dow !== 0;
      }
      if (isOpen) {
        return d.toISOString().split('T')[0];
      }
    }
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Client info form
  const [clientName, setClientName] = useState('');
  const [countryDial, setCountryDial] = useState('55'); // Default to Brazil (+55)
  const [phoneRaw, setPhoneRaw] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // PIX copied state
  const [pixCopied, setPixCopied] = useState(false);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  // Reference link configured by professional (or generated portal url)
  const publicReferralLink = useMemo(() => {
    if (profile.customShareLink && profile.customShareLink.trim()) {
      return profile.customShareLink.trim();
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?view=client&pro=${profile.slug || 'studio'}`;
    }
    return `https://meustudio.com.br/${profile.slug || 'studio'}`;
  }, [profile.customShareLink, profile.slug]);

  // Dynamic share text personalized by professional
  const publicShareMessage = useMemo(() => {
    if (profile.customShareText && profile.customShareText.trim()) {
      let msg = profile.customShareText
        .replace(/{link}/g, publicReferralLink)
        .replace(/{profesional}/g, profile.name)
        .replace(/{profissional}/g, profile.name)
        .replace(/{estudio}/g, profile.businessName)
        .replace(/{negocio}/g, profile.businessName);
      if (!msg.includes(publicReferralLink)) {
        msg += `\n\n👉 ${publicReferralLink}`;
      }
      return msg;
    }
    return lang === 'pt'
      ? `🌸 Agende seu horário com ${profile.name} no ${profile.businessName}!\n👉 Acesse o link: ${publicReferralLink}`
      : `🌸 Reserva tu cita con ${profile.name} en ${profile.businessName}!\n👉 Ingresa al link: ${publicReferralLink}`;
  }, [profile.customShareText, publicReferralLink, profile.name, profile.businessName, lang]);

  const handleSharePortalLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: profile.businessName || profile.name,
          text: publicShareMessage,
          url: publicReferralLink
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(publicReferralLink);
      setCopiedPortalLink(true);
      setTimeout(() => setCopiedPortalLink(false), 2500);
    } catch {
      setCopiedPortalLink(true);
    }
  };

  // Created appointment result state
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate 14 next days for date picker with weekly schedule validation
  const availableDates = useMemo(() => {
    const daysList = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const schedule = getDaySchedule(dayOfWeek);
      const isWorkingDay = schedule.isOpen;

      const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
      const dayName = d.toLocaleDateString(locale, { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString(locale, { month: 'short' });

      daysList.push({
        iso,
        dayName: i === 0 ? t.today : i === 1 ? t.tomorrow : dayName,
        dayNumber,
        monthName,
        isWorkingDay,
        schedule
      });
    }
    return daysList;
  }, [profile.weeklySchedule, profile.workingDays, lang, t]);

  // Compute available time slots for the selected date validating open hours & lunch break
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const daySchedule = getDaySchedule(dayOfWeek);

    // If day is closed, no slots are available
    if (!daySchedule || !daySchedule.isOpen) {
      return [];
    }

    const [startH, startM] = (daySchedule.openTime || '09:00').split(':').map(Number);
    const [endH, endM] = (daySchedule.closeTime || '19:00').split(':').map(Number);

    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);
    const stepDuration = selectedService?.durationMinutes || 60;
    const intervalStep = profile.slotDurationMinutes && profile.slotDurationMinutes <= 60
      ? profile.slotDurationMinutes
      : 60;

    // Lunch break boundaries in minutes
    let breakStartMin = -1;
    let breakEndMin = -1;
    if (daySchedule.hasBreak && daySchedule.breakStart && daySchedule.breakEnd) {
      const [bsh, bsm] = daySchedule.breakStart.split(':').map(Number);
      const [beh, bem] = daySchedule.breakEnd.split(':').map(Number);
      breakStartMin = bsh * 60 + (bsm || 0);
      breakEndMin = beh * 60 + (bem || 0);
    }

    // Existing booked slots for this date
    const bookedTimes = new Set(
      existingAppointments
        .filter((apt) => apt.date === selectedDate && apt.status !== 'cancelled')
        .map((apt) => apt.time)
    );

    const slots: string[] = [];
    for (let current = startMinutes; current + stepDuration <= endMinutes; current += intervalStep) {
      const currentEnd = current + stepDuration;

      // Filter out slots overlapping lunch break
      if (breakStartMin >= 0 && breakEndMin > breakStartMin) {
        if (current < breakEndMin && currentEnd > breakStartMin) {
          continue; // Conflicts with lunch break!
        }
      }

      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      // Check if slot is in the past if selectedDate is today
      const todayIso = new Date().toISOString().split('T')[0];
      if (selectedDate === todayIso) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        if (hours < currentHour || (hours === currentHour && minutes <= currentMinute)) {
          continue;
        }
      }

      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }

    return slots;
  }, [
    selectedDate,
    selectedService,
    profile.weeklySchedule,
    profile.workingDays,
    profile.workingHours,
    profile.slotDurationMinutes,
    existingAppointments
  ]);

  // Modal for viewing full service detail
  const [detailModalService, setDetailModalService] = useState<BeautyService | null>(null);

  // Stories Highlight viewer modal
  const [activeStoryHighlight, setActiveStoryHighlight] = useState<ProfileHighlight | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Active services filter
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (!srv.isActive) return false;
      if (selectedCategory === 'todos') return true;
      return srv.category === selectedCategory;
    });
  }, [services, selectedCategory]);

  const handleSelectService = (srv: BeautyService) => {
    setSelectedService(srv);
    setStep(2);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCopyPixKey = async () => {
    if (!profile.pixKey) return;
    try {
      await navigator.clipboard.writeText(profile.pixKey);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    } catch {
      setPixCopied(true);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName.trim() || !phoneRaw.trim()) {
      return;
    }

    // Automatic weekly schedule validation: ensure selected date is open
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const daySchedule = getDaySchedule(dateObj.getDay());
    if (!daySchedule.isOpen) {
      alert(t.closedDayWarning);
      return;
    }

    setIsSubmitting(true);
    const fullPhone = cleanPhoneNumber(`${countryDial}${phoneRaw}`);

    const newAptData: Partial<Appointment> = {
      clientName: clientName.trim(),
      clientWhatsapp: fullPhone ? `+${fullPhone}` : `+${countryDial}${phoneRaw}`,
      clientNotes: clientNotes.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      currency: profile.currency,
      status: 'confirmed',
      depositPaid: false,
      depositAmount: profile.depositFixedAmount || 30
    };

    try {
      const created = await onBookAppointment(newAptData);
      if (created) {
        setBookedAppointment(created);
      } else {
        setBookedAppointment({
          ...newAptData,
          id: `apt-${Date.now()}`,
          createdAt: new Date().toISOString()
        } as Appointment);
      }
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Message to send to specialist
  const proWhatsAppMessage = useMemo(() => {
    if (!bookedAppointment || !selectedService) return '';
    return generateClientBookingMessageForPro(bookedAppointment, selectedService, profile, lang);
  }, [bookedAppointment, selectedService, profile, lang]);

  const proWhatsAppUrl = useMemo(() => {
    if (!profile.whatsapp || !proWhatsAppMessage) return '';
    return buildWhatsAppUrl(profile.whatsapp, proWhatsAppMessage);
  }, [profile.whatsapp, proWhatsAppMessage]);

  const downloadIcsCalendar = (apt: Appointment, pro: BeautyProProfile) => {
    const [startH, startM] = apt.time.split(':').map(Number);
    const dur = apt.durationMinutes || 60;
    const endMinutesTotal = startH * 60 + startM + dur;
    const endH = Math.floor(endMinutesTotal / 60);
    const endM = endMinutesTotal % 60;

    const dateClean = apt.date.replace(/-/g, '');
    const startTimeClean = `${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
    const endTimeClean = `${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Glow Beauty Pro//PT-BR',
      'BEGIN:VEVENT',
      `SUMMARY:${apt.serviceName} - ${pro.businessName}`,
      `DESCRIPTION:Atendimento com ${pro.name}. Valor: R$ ${apt.price}`,
      `LOCATION:${pro.address}, ${pro.city}`,
      `DTSTART:${dateClean}T${startTimeClean}`,
      `DTEND:${dateClean}T${endTimeClean}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agendamento-${apt.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBookClick = () => {
    const el = document.getElementById('servicios');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (services.length > 0) {
      const popular =
        services.find((s) => s.popular && s.isActive) ||
        services.find((s) => s.isActive) ||
        services[0];
      setSelectedService(popular);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1E1D] selection:bg-[#72202E] selection:text-white flex flex-col">
      {/* 1. Full Editorial Website Experience */}
      <EditorialNavbar
        profile={profile}
        onBookClick={handleBookClick}
        onSwitchToProView={onSwitchToProView}
        isStandaloneClient={isStandaloneClient}
      />

      <main className="flex-1">
        <EditorialHero
          profile={profile}
          onBookClick={handleBookClick}
        />

        <EditorialServices
          services={services}
          currency={profile.currency}
          onSelectService={(service) => {
            setSelectedService(service);
            setStep(2);
          }}
          onBookClick={handleBookClick}
        />

        <EditorialAbout
          profile={profile}
          onBookClick={handleBookClick}
        />

        <EditorialPortfolio
          onBookClick={handleBookClick}
        />
      </main>

      <EditorialFooter
        profile={profile}
        onBookClick={handleBookClick}
        onOpenAdminLogin={onSwitchToProView}
      />

      {/* 2. Interactive Booking Modal (When in Steps 2, 3 or 4) */}
      {step > 1 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-[#FBF9F5] border border-[#EAE3D9] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Stepper Header */}
            <div className="bg-white/95 border-b border-[#EAE3D9] px-5 py-3.5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setStep((prev) => (prev > 2 ? ((prev - 1) as any) : 1))}
                className="p-1 rounded-lg text-[#5A524C] hover:text-[#1F1E1D] flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{step === 2 ? (lang === 'pt' ? 'Fechar' : 'Cerrar') : t.back}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-[#72202E]' : 'bg-[#D9D0C5]'}`} />
                <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? 'bg-[#72202E]' : 'bg-[#D9D0C5]'}`} />
                <span className={`w-2.5 h-2.5 rounded-full ${step >= 4 ? 'bg-[#72202E]' : 'bg-[#D9D0C5]'}`} />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-serif font-bold text-[#72202E] uppercase tracking-wider hidden sm:inline">
                  {step === 2 ? t.dateStep : step === 3 ? t.infoStep : (lang === 'pt' ? 'Confirmado' : 'Confirmado')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    if (step === 4) {
                      setSelectedService(null);
                      setSelectedTime('');
                      setBookedAppointment(null);
                    }
                  }}
                  className="p-1.5 rounded-full text-[#7A7169] hover:text-[#1F1E1D] hover:bg-[#F4EFEB] transition-colors"
                  title={lang === 'pt' ? 'Fechar' : 'Cerrar'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="overflow-y-auto flex-1 p-2">

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: DATE & TIME SELECTOR                                  */}
        {/* ------------------------------------------------------------- */}
        {step === 2 && selectedService && (
          <div className="p-5 space-y-5 flex-1">
            {/* Service Summary Chip */}
            <div className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedService.imageUrl && (
                  <img
                    src={selectedService.imageUrl}
                    alt={selectedService.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-950 block truncate">
                    {selectedService.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#72202E]" />
                    {selectedService.durationMinutes} min • {formatPrice(selectedService.price, profile.currency, lang)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#72202E] hover:underline shrink-0 font-bold"
              >
                Trocar
              </button>
            </div>

            {/* Date Picker Header */}
            <div>
              <h2 className="text-sm font-serif font-bold text-[#1F1E1D] flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#72202E]" />
                <span>{t.selectDateTime}</span>
              </h2>
              <p className="text-xs text-[#7A7169]">
                {lang === 'pt' ? 'Selecione o melhor dia no calendário:' : 'Elige el día:'}
              </p>
            </div>

            {/* Next 14 Days Horizontal Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    onClick={() => {
                      if (item.isWorkingDay) {
                        setSelectedDate(item.iso);
                        setSelectedTime('');
                        setClosedDateNotice(null);
                      } else {
                        setClosedDateNotice(
                          lang === 'pt'
                            ? `O estúdio não atende aos ${item.dayName}s. Por favor escolha uma das datas abertas no calendário.`
                            : `No atendemos los ${item.dayName}. Por favor elige una fecha disponible.`
                        );
                      }
                    }}
                    className={`min-w-[64px] p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 shrink-0 ${
                      !item.isWorkingDay
                        ? 'opacity-60 border-[#EAE3D9] bg-[#F4EFEB] text-[#A89E94] hover:border-[#D9D0C5]'
                        : isSelected
                        ? 'bg-[#72202E] border-[#72202E] text-white font-bold shadow-md scale-105'
                        : 'bg-white border-[#EAE3D9] text-[#1F1E1D] hover:border-[#72202E]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {item.dayName}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {item.dayNumber}
                    </span>
                    <span className="text-[9px] uppercase opacity-75">
                      {item.monthName}
                    </span>
                    {!item.isWorkingDay && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-[#EAE3D9] text-[#7A7169] uppercase mt-0.5">
                        {lang === 'pt' ? 'Fechado' : 'Cerrado'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Closed Date Interaction Alert Notice */}
            {closedDateNotice && (
              <div className="bg-[#72202E]/10 border border-[#72202E]/30 text-[#72202E] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs">
                <span>{closedDateNotice}</span>
                <button
                  type="button"
                  onClick={() => setClosedDateNotice(null)}
                  className="text-[#72202E] font-bold px-1 hover:text-[#581520]"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Selected Day Schedule Information Chip */}
            {(() => {
              const dateObj = new Date(selectedDate + 'T00:00:00');
              const daySchedule = getDaySchedule(dateObj.getDay());
              return (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs ${
                    daySchedule.isOpen
                      ? 'bg-[#F4EFEB] border-[#E3DACF] text-[#1F1E1D]'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#72202E] shrink-0" />
                    <div>
                      <span className="font-bold text-[#1F1E1D] block">
                        {formatFriendlyDate(selectedDate, lang)}
                      </span>
                      <span className="text-[11px] text-[#7A7169]">
                        {daySchedule.isOpen ? (
                          <>
                            {lang === 'pt' ? 'Atendimento das' : 'Atención de'}{' '}
                            <strong className="text-[#1F1E1D] font-semibold">{daySchedule.openTime}</strong>{' '}
                            {lang === 'pt' ? 'às' : 'a'}{' '}
                            <strong className="text-[#1F1E1D] font-semibold">{daySchedule.closeTime}</strong>
                            {daySchedule.hasBreak && (
                              <span className="text-[#7A7169] ml-1">
                                • {lang === 'pt' ? 'Intervalo de Almoço' : 'Pausa'}: {daySchedule.breakStart} - {daySchedule.breakEnd}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-rose-600 font-semibold">{t.closedDayWarning}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="text-[11px] text-[#72202E] hover:text-[#581520] font-bold shrink-0 hover:underline"
                  >
                    {lang === 'pt' ? 'Ver Horários da Semana' : 'Ver Horario Semanal'} →
                  </button>
                </div>
              );
            })()}

            {/* Time Slots */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#1F1E1D] block">
                {t.selectSlotPrompt}
              </span>

              {availableTimeSlots.length === 0 ? (
                <div className="bg-white border border-[#EAE3D9] rounded-xl p-6 text-center text-[#7A7169] text-xs shadow-xs space-y-1">
                  <Clock className="w-6 h-6 text-[#72202E]/70 mx-auto mb-1" />
                  <span className="font-bold text-[#1F1E1D] block text-sm">
                    {(() => {
                      const dateObj = new Date(selectedDate + 'T00:00:00');
                      const sched = getDaySchedule(dateObj.getDay());
                      return sched.isOpen ? t.noSlots : (lang === 'pt' ? 'Dia Sem Atendimento' : 'Día Sin Atención');
                    })()}
                  </span>
                  <p className="text-xs text-[#7A7169] max-w-xs mx-auto">
                    {(() => {
                      const dateObj = new Date(selectedDate + 'T00:00:00');
                      const sched = getDaySchedule(dateObj.getDay());
                      return sched.isOpen
                        ? (lang === 'pt'
                            ? 'Todos os horários deste dia foram reservados ou o expediente encerrou. Escolha outra data no calendário acima.'
                            : 'Todos los turnos de este día están ocupados. Por favor selecciona otra fecha.')
                        : t.closedDayWarning;
                    })()}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#72202E] border-[#72202E] text-white font-bold shadow-sm scale-102'
                            : 'bg-white border-[#EAE3D9] text-[#1F1E1D] hover:border-[#72202E]'
                        }`}
                      >
                        {time}h
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Advance Button */}
            <div className="pt-4 border-t border-[#EAE3D9]">
              <button
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-none bg-[#72202E] hover:bg-[#581520] disabled:opacity-30 text-white font-semibold uppercase tracking-[0.18em] text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>{t.continue}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: CLIENT INFO FORM (NAME + BRAZIL WHATSAPP + PIX)       */}
        {/* ------------------------------------------------------------- */}
        {step === 3 && selectedService && (
          <form onSubmit={handleConfirmBooking} className="p-5 space-y-5 flex-1">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1F1E1D] flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#72202E]" />
                <span>{t.fillYourData}</span>
              </h2>
              <p className="text-xs text-[#7A7169]">
                {lang === 'pt' ? 'Para confirmarmos seu horário e enviarmos o lembrete no WhatsApp.' : 'Para tu confirmación.'}
              </p>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-white border border-[#EAE3D9] rounded-xl p-3.5 space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between text-[#1F1E1D] font-semibold">
                <span className="font-serif text-sm">{selectedService.name}</span>
                <span className="text-[#72202E] font-bold font-serif text-sm">
                  {formatPrice(selectedService.price, profile.currency, lang)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#7A7169] text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#72202E]" />
                  {formatFriendlyDate(selectedDate, lang)}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#72202E]" />
                  {selectedTime}h
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                  {t.yourFullName} *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-white border border-[#D9D0C5] rounded-xl px-3.5 py-3 text-sm text-[#1F1E1D] focus:outline-none focus:border-[#72202E] focus:ring-1 focus:ring-[#72202E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1E1D] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#128C7E]" />
                  <span>{t.whatsappNumber} *</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryDial}
                    onChange={(e) => setCountryDial(e.target.value)}
                    className="bg-white border border-[#D9D0C5] rounded-xl px-2.5 py-3 text-xs text-[#1F1E1D] focus:outline-none"
                  >
                    {DIAL_CODES.map((dc) => (
                      <option key={dc.code} value={dc.dial}>
                        {dc.flag} +{dc.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    placeholder={countryDial === '55' ? '(11) 98765-4321' : 'Número celular'}
                    className="flex-1 bg-white border border-[#D9D0C5] rounded-xl px-3.5 py-3 text-sm text-[#1F1E1D] focus:outline-none focus:border-[#72202E] focus:ring-1 focus:ring-[#72202E]"
                  />
                </div>
                <span className="text-[10px] text-[#7A7169] mt-1 block">
                  {countryDial === '55'
                    ? 'Informe o DDD + número (ex: 11987654321)'
                    : 'Incluye tu código de área para recibir el mensaje'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full bg-white border border-[#D9D0C5] rounded-xl p-3 text-xs text-[#1F1E1D] focus:outline-none focus:border-[#72202E] focus:ring-1 focus:ring-[#72202E]"
                />
              </div>

              {/* PIX / SIGNAL ALERT BANNER (Luxury styling) */}
              {profile.pixKey && (
                <div className="bg-[#F4EFEB] border border-[#E3DACF] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#72202E] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C4A480]" />
                      <span>{t.pixSinalAlert}</span>
                    </span>
                    <span className="text-xs font-bold text-white bg-[#72202E] px-2.5 py-0.5 rounded-full shadow-xs">
                      Sinal: R$ {profile.depositFixedAmount || 30},00
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A524C] leading-relaxed">
                    {lang === 'pt'
                      ? 'Para garantir sua vaga na agenda, realize o pagamento do sinal via PIX e envie o comprovante no WhatsApp.'
                      : 'Puedes transferir el anticipo para apartar tu cita.'}
                  </p>

                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#EAE3D9] text-xs shadow-xs">
                    <span className="font-mono text-[#1F1E1D] font-semibold truncate select-all mr-2">
                      {profile.pixKey}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPixKey}
                      className="px-2.5 py-1 rounded bg-[#72202E] hover:bg-[#581520] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {pixCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                      <span>{pixCopied ? t.pixCopied : t.pixCopyBtn}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !clientName.trim() || !phoneRaw.trim()}
                className="w-full py-3.5 rounded-none bg-[#72202E] hover:bg-[#581520] disabled:opacity-30 text-white font-semibold uppercase tracking-[0.18em] text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.confirmStep}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: BOOKING CONFIRMATION & DIRECT WHATSAPP ACTION         */}
        {/* ------------------------------------------------------------- */}
        {step === 4 && bookedAppointment && selectedService && (
          <div className="p-6 space-y-6 text-center flex-1 flex flex-col justify-center items-center animate-fade-in">
            {/* Elegant Success Badge */}
            <div className="w-20 h-20 rounded-full bg-[#72202E]/10 border-2 border-[#72202E] flex items-center justify-center text-[#72202E] mx-auto shadow-sm">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-[#1F1E1D]">
                {t.confirmedTitle}
              </h2>
              <p className="text-xs text-[#5A524C] max-w-sm mx-auto leading-relaxed">
                {t.bookingSuccessMsg}
              </p>
            </div>

            {/* Ticket Card Summary */}
            <div className="w-full bg-white border border-[#EAE3D9] rounded-2xl p-4 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
                <span className="text-xs font-serif font-bold text-[#72202E]">
                  {selectedService.name}
                </span>
                <span className="text-xs font-bold text-[#1F1E1D]">
                  {formatPrice(selectedService.price, profile.currency, lang)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#1F1E1D]">
                <div>
                  <span className="text-[10px] text-[#7A7169] block uppercase font-medium">Data</span>
                  <span className="font-semibold">{formatFriendlyDate(bookedAppointment.date, lang)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7169] block uppercase font-medium">Horário</span>
                  <span className="font-semibold">{bookedAppointment.time}h</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7169] block uppercase font-medium">Especialista</span>
                  <span className="font-semibold">{profile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7169] block uppercase font-medium">Local</span>
                  <span className="font-semibold truncate block">{profile.businessName}</span>
                </div>
              </div>
            </div>

            {/* Payment Details Box for Client */}
            {(profile.bankPaymentDetails?.enabled ?? true) && (profile.bankPaymentDetails?.pixKey || profile.pixKey || profile.bankPaymentDetails?.bankName) && (
              <div className="w-full bg-[#F4EFEB] border border-[#E3DACF] rounded-2xl p-4 text-left space-y-2.5 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#72202E] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#72202E]" />
                    <span>{lang === 'pt' ? 'Dados para Pagamento do Sinal' : 'Datos para Pago del Anticipo'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#72202E] text-white">
                    Sinal: {formatPrice(profile.bankPaymentDetails?.depositAmount || profile.depositFixedAmount || 30, profile.currency, lang)}
                  </span>
                </div>

                {(profile.bankPaymentDetails?.pixKey || profile.pixKey) && (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#EAE3D9] shadow-2xs">
                    <span className="font-mono text-zinc-900 font-semibold truncate mr-2 select-all text-xs">
                      PIX ({profile.bankPaymentDetails?.pixKeyType || profile.pixType || 'Chave'}): {profile.bankPaymentDetails?.pixKey || profile.pixKey}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.bankPaymentDetails?.pixKey || profile.pixKey || '');
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-[#72202E] hover:bg-[#581520] text-white text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {pixCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                      <span>{pixCopied ? t.pixCopied : t.pixCopyBtn}</span>
                    </button>
                  </div>
                )}

                {profile.bankPaymentDetails?.bankName && (
                  <div className="text-[11px] text-zinc-700 space-y-1 bg-white/80 p-2.5 rounded-lg border border-[#EAE3D9]">
                    <p className="font-semibold text-zinc-900 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#72202E]" />
                      <span>{profile.bankPaymentDetails.bankName}</span>
                    </p>
                    {profile.bankPaymentDetails.accountNumber && (
                      <p>Conta: {profile.bankPaymentDetails.accountNumber} {profile.bankPaymentDetails.agencyNumber ? `• Agência: ${profile.bankPaymentDetails.agencyNumber}` : ''}</p>
                    )}
                    {profile.bankPaymentDetails.accountHolderName && (
                      <p>Titular: {profile.bankPaymentDetails.accountHolderName}</p>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {profile.bankPaymentDetails?.instructions || (lang === 'pt' ? 'Envie o comprovante pelo botão do WhatsApp abaixo para confirmar sua reserva.' : 'Envía tu comprobante a través del botón de WhatsApp para confirmar tu cita.')}
                </p>
              </div>
            )}

            {/* ONE-TAP WHATSAPP CONFIRMATION BUTTON */}
            <div className="w-full space-y-2.5">
              <a
                href={proWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>{t.confirmViaWhatsAppBtn}</span>
              </a>

              <button
                onClick={() => downloadIcsCalendar(bookedAppointment, profile)}
                className="w-full py-3 rounded-none bg-white hover:bg-[#F4EFEB] text-[#1F1E1D] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#EAE3D9] transition-colors"
              >
                <CalendarPlus className="w-4 h-4 text-[#72202E]" />
                <span>{t.saveToCalendar}</span>
              </button>

              {/* Referral & Share with Friends Box */}
              <div className="w-full bg-[#F4EFEB] border border-[#E3DACF] rounded-2xl p-4 text-left space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#1F1E1D]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C4A480]" />
                    <span>{lang === 'pt' ? 'Indique para uma amiga:' : 'Recomienda a una amiga:'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSharePortalLink}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#D9D0C5] hover:bg-[#F4EFEB] text-[#72202E] text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedPortalLink ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3 text-[#72202E]" />}
                    <span>{copiedPortalLink ? (lang === 'pt' ? 'Copiado!' : '¡Copiado!') : (lang === 'pt' ? 'Copiar Link' : 'Copiar Enlace')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]">
                    {publicReferralLink}
                  </span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(publicShareMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs shrink-0 transition-transform active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Enviar WhatsApp' : 'Enviar WhatsApp'}</span>
                  </a>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedTime('');
                  setBookedAppointment(null);
                }}
                className="text-xs text-[#7A7169] hover:text-[#1F1E1D] pt-2 block mx-auto underline font-medium"
              >
                {lang === 'pt' ? 'Fazer outro agendamento' : 'Realizar otra reserva'}
              </button>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      )}

        {/* ------------------------------------------------------------- */}
        {/* SERVICE DETAIL MODAL (With Full Photo, Prep & Care Tips)      */}
        {/* ------------------------------------------------------------- */}
        {detailModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setDetailModalService(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {detailModalService.imageUrl && (
                <div className="h-48 w-full bg-zinc-100 overflow-hidden relative">
                  <img
                    src={detailModalService.imageUrl}
                    alt={detailModalService.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
              )}

              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#72202E] tracking-wider">
                    {getCategoryLabel(detailModalService.category, lang)}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-950 font-serif">
                    {detailModalService.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="text-[#72202E] font-bold text-sm">
                      {formatPrice(detailModalService.price, profile.currency, lang)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {detailModalService.durationMinutes} min
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {detailModalService.description}
                </p>

                {detailModalService.suggestedMaintenanceDays && (
                  <div className="bg-[#F4EFEB] border border-[#E3DACF] rounded-xl p-3 text-xs text-[#1F1E1D] flex items-start gap-2">
                    <RotateCw className="w-4 h-4 text-[#72202E] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        {t.maintenanceEvery} {detailModalService.suggestedMaintenanceDays} {t.days}
                      </span>
                      {detailModalService.maintenanceNote && (
                        <span className="text-[11px] text-zinc-600 block mt-0.5">
                          {detailModalService.maintenanceNote}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {detailModalService.prepInstructions && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      💡 {t.prepTips}:
                    </span>
                    <p className="text-zinc-600 text-[11px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                      {detailModalService.prepInstructions}
                    </p>
                  </div>
                )}

                {detailModalService.careInstructions && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      🌸 {t.aftercareTips}:
                    </span>
                    <p className="text-zinc-600 text-[11px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                      {detailModalService.careInstructions}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    handleSelectService(detailModalService);
                    setDetailModalService(null);
                  }}
                  className="w-full py-3.5 rounded-none bg-[#72202E] hover:bg-[#581520] text-white font-semibold uppercase tracking-[0.18em] text-xs shadow-md transition-colors"
                >
                  {t.chooseService}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INSTAGRAM STORY MODAL VIEWER (Full Screen Carousel)          */}
        {/* ------------------------------------------------------------- */}
        {activeStoryHighlight && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="relative w-full max-w-sm h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden flex flex-col justify-between border border-zinc-800 shadow-2xl">
              {/* Progress Bars at top */}
              <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
                {activeStoryHighlight.items.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className={`h-full bg-[#72202E] transition-all duration-300 ${
                        idx === activeStoryIndex
                          ? 'w-full'
                          : idx < activeStoryIndex
                          ? 'w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full border border-[#72202E] object-cover"
                  />
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      {activeStoryHighlight.title}
                    </span>
                    <span className="text-[10px] text-zinc-300">
                      {profile.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryHighlight(null)}
                  className="p-1 rounded-full bg-black/50 text-white hover:bg-black/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Image */}
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {activeStoryHighlight.items[activeStoryIndex] && (
                  <img
                    src={activeStoryHighlight.items[activeStoryIndex].url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}

                <div
                  onClick={() => {
                    if (activeStoryIndex > 0) {
                      setActiveStoryIndex((prev) => prev - 1);
                    }
                  }}
                  className="absolute left-0 inset-y-0 w-1/3 z-10 cursor-pointer"
                />
                <div
                  onClick={() => {
                    if (activeStoryIndex < activeStoryHighlight.items.length - 1) {
                      setActiveStoryIndex((prev) => prev + 1);
                    } else {
                      setActiveStoryHighlight(null);
                    }
                  }}
                  className="absolute right-0 inset-y-0 w-1/3 z-10 cursor-pointer"
                />
              </div>

              {/* Story Caption & Action at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/85 to-transparent z-30 space-y-3">
                {activeStoryHighlight.items[activeStoryIndex]?.caption && (
                  <div className="max-h-36 overflow-y-auto bg-black/45 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                    <p className="text-xs text-white leading-relaxed font-sans whitespace-pre-line drop-shadow">
                      {activeStoryHighlight.items[activeStoryIndex].caption}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveStoryHighlight(null);
                      const cat = document.getElementById('catalog-section');
                      cat?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2.5 rounded-none bg-[#72202E] hover:bg-[#581520] text-white font-semibold uppercase tracking-[0.18em] text-xs shadow-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.bookAppointmentBtn}</span>
                  </button>

                  <a
                    href={`https://wa.me/${cleanPhoneNumber(profile.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600 text-white"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* WEEKLY BUSINESS HOURS MODAL                                  */}
        {/* ------------------------------------------------------------- */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#EAE3D9] rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#EAE3D9] flex items-center justify-between bg-[#F4EFEB]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E3DACF] flex items-center justify-center text-[#72202E]">
                    <Clock className="w-4 h-4 text-[#72202E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1F1E1D] font-serif">
                      {t.viewWeeklyScheduleModal}
                    </h3>
                    <p className="text-[11px] text-[#7A7169] truncate max-w-[200px]">
                      {profile.name} • {profile.businessName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#EAE3D9] text-[#7A7169] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Days List */}
              <div className="p-4 space-y-2.5 overflow-y-auto divide-y divide-zinc-100">
                {[
                  { day: 0, name: lang === 'pt' ? 'Domingo' : lang === 'es' ? 'Domingo' : 'Sunday' },
                  { day: 1, name: lang === 'pt' ? 'Segunda-feira' : lang === 'es' ? 'Lunes' : 'Monday' },
                  { day: 2, name: lang === 'pt' ? 'Terça-feira' : lang === 'es' ? 'Martes' : 'Tuesday' },
                  { day: 3, name: lang === 'pt' ? 'Quarta-feira' : lang === 'es' ? 'Miércoles' : 'Wednesday' },
                  { day: 4, name: lang === 'pt' ? 'Quinta-feira' : lang === 'es' ? 'Jueves' : 'Thursday' },
                  { day: 5, name: lang === 'pt' ? 'Sexta-feira' : lang === 'es' ? 'Viernes' : 'Friday' },
                  { day: 6, name: lang === 'pt' ? 'Sábado' : lang === 'es' ? 'Sábado' : 'Saturday' }
                ].map((d) => {
                  const schedule = getDaySchedule(d.day);
                  const isToday = new Date().getDay() === d.day;

                  return (
                    <div
                      key={d.day}
                      className={`pt-2.5 first:pt-0 flex items-center justify-between text-xs ${
                        isToday ? 'font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-900">{d.name}</span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#72202E] text-white text-[9px] font-bold">
                            {t.today}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {schedule.isOpen ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-zinc-900 font-semibold block">
                              {schedule.openTime} - {schedule.closeTime}
                            </span>
                            {schedule.hasBreak && (
                              <span className="text-[10px] text-zinc-500 block font-normal">
                                {lang === 'pt' ? 'Almoço' : 'Pausa'}: {schedule.breakStart} - {schedule.breakEnd}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">
                            {t.dayClosedBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {lang === 'pt' ? 'Agendamento 100% online validado' : 'Reserva online validada'}
                </span>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Interactive Booking Tutorial Modal */}
        <AppTutorialModal
          isOpen={showTutorialModal}
          onClose={() => setShowTutorialModal(false)}
          defaultTab="client"
          profile={profile}
          lang={lang}
          onStartBooking={() => {
            setShowTutorialModal(false);
            const catalogEl = document.getElementById('servicios');
            catalogEl?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
    </div>
  );
};
