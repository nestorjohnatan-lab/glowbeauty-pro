import React, { useState, useMemo } from 'react';
import {
  Appointment,
  BeautyProProfile,
  BeautyService,
  AppointmentStatus,
  AppLanguage,
  ClientTechnicalNote,
  ServiceCategory
} from '../types';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock3,
  Phone,
  MessageSquare,
  Trash2,
  CalendarDays,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Eye,
  Palette,
  Heart,
  CreditCard
} from 'lucide-react';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import {
  buildWhatsAppUrl,
  generate24hReminderMessage,
  generateProConfirmationMessageForClient,
  cleanPhoneNumber
} from '../utils/whatsapp';
import { ClientTechnicalNotesSection } from './ClientTechnicalNotesSection';
import { ClientTechnicalNoteModal } from './ClientTechnicalNoteModal';

interface AppointmentsManagerProps {
  appointments: Appointment[];
  profile: BeautyProProfile;
  services: BeautyService[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onManualCreateAppointment: (data: Partial<Appointment>) => void;
  clientTechnicalNotes?: Record<string, ClientTechnicalNote>;
  onSaveClientTechnicalNote?: (note: ClientTechnicalNote) => void;
  onOpenAiAssistantForAppointment?: (apt: Appointment) => void;
  lang?: AppLanguage;
}

export const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
  appointments,
  profile,
  services,
  onUpdateStatus,
  onDeleteAppointment,
  onManualCreateAppointment,
  clientTechnicalNotes = {},
  onSaveClientTechnicalNote,
  onOpenAiAssistantForAppointment,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  // View switch: 'agenda' or 'client_notes'
  const [managerTab, setManagerTab] = useState<'agenda' | 'client_notes'>('agenda');

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Technical Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNoteForModal, setSelectedNoteForModal] = useState<ClientTechnicalNote | null>(null);
  const [modalClientName, setModalClientName] = useState('');
  const [modalClientPhone, setModalClientPhone] = useState('');
  const [modalCategory, setModalCategory] = useState<ServiceCategory | undefined>(undefined);

  // New appointment form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to find technical note for an appointment
  const getNoteForAppointment = (apt: Appointment): ClientTechnicalNote | undefined => {
    if (apt.technicalNotes) return apt.technicalNotes;
    if (clientTechnicalNotes) {
      if (clientTechnicalNotes[apt.clientWhatsapp]) return clientTechnicalNotes[apt.clientWhatsapp];
      const cleanApt = cleanPhoneNumber(apt.clientWhatsapp);
      const matchKey = Object.keys(clientTechnicalNotes).find((k) => cleanPhoneNumber(k) === cleanApt);
      if (matchKey && clientTechnicalNotes[matchKey]) return clientTechnicalNotes[matchKey];
      const notesArray = Object.values(clientTechnicalNotes) as ClientTechnicalNote[];
      const matchName = notesArray.find(
        (n) => n?.clientName && n.clientName.toLowerCase() === apt.clientName.toLowerCase()
      );
      if (matchName) return matchName;
    }
    return undefined;
  };

  const handleOpenNoteForAppointment = (apt: Appointment) => {
    const existing = getNoteForAppointment(apt);
    setSelectedNoteForModal(existing || null);
    setModalClientName(apt.clientName);
    setModalClientPhone(apt.clientWhatsapp);
    setModalCategory(apt.serviceCategory);
    setIsNoteModalOpen(true);
  };

  const handleOpenNoteModalGeneral = (note?: ClientTechnicalNote, cName?: string, cPhone?: string) => {
    setSelectedNoteForModal(note || null);
    setModalClientName(cName || note?.clientName || '');
    setModalClientPhone(cPhone || note?.clientPhone || '');
    setModalCategory(note?.serviceCategory);
    setIsNoteModalOpen(true);
  };

  const handleFilterAgendaByClient = (clientQuery: string) => {
    setManagerTab('agenda');
    setActiveFilter('all');
    setSearchTerm(clientQuery);
  };

  const handleSaveNote = (note: ClientTechnicalNote) => {
    if (onSaveClientTechnicalNote) {
      onSaveClientTechnicalNote(note);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        // Search query filter
        if (searchTerm.trim()) {
          const matchName = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
          const matchPhone = apt.clientWhatsapp.includes(searchTerm);
          const matchService = apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
          const techNote = getNoteForAppointment(apt);
          const matchTech = techNote
            ? (techNote.lashCurvature + ' ' + techNote.lashMapping + ' ' + techNote.makeupFoundationTone + ' ' + (techNote.allergies || '')).toLowerCase().includes(searchTerm.toLowerCase())
            : false;

          if (!matchName && !matchPhone && !matchService && !matchTech) return false;
        }

        // Tab filter
        if (activeFilter === 'today') {
          return apt.date === todayIso && apt.status !== 'cancelled';
        }
        if (activeFilter === 'upcoming') {
          return apt.date >= todayIso && apt.status !== 'cancelled' && apt.status !== 'completed';
        }
        if (activeFilter === 'completed') {
          return apt.status === 'completed';
        }
        if (activeFilter === 'cancelled') {
          return apt.status === 'cancelled';
        }
        return true;
      })
      .sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
  }, [appointments, activeFilter, searchTerm, todayIso, clientTechnicalNotes]);

  const todayCount = useMemo(() => {
    return appointments.filter((a) => a.date === todayIso && a.status !== 'cancelled').length;
  }, [appointments, todayIso]);

  const totalTechnicalNotesCount = useMemo(() => {
    return Object.keys(clientTechnicalNotes).length;
  }, [clientTechnicalNotes]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !serviceId) return;

    const srv = services.find((s) => s.id === serviceId) || services[0];
    const fullPhone = cleanPhoneNumber(clientPhone);

    const clientWaFormatted = fullPhone ? `+${fullPhone}` : '+5511999999999';
    // Link technical note if exists
    const notesArray = Object.values(clientTechnicalNotes) as ClientTechnicalNote[];
    const existingNote = clientTechnicalNotes[clientWaFormatted] ||
      notesArray.find((n) => n?.clientName && n.clientName.toLowerCase() === clientName.trim().toLowerCase());

    onManualCreateAppointment({
      clientName: clientName.trim(),
      clientWhatsapp: clientWaFormatted,
      clientNotes: notes.trim(),
      technicalNotes: existingNote,
      serviceId: srv.id,
      serviceName: srv.name,
      serviceCategory: srv.category,
      date,
      time,
      durationMinutes: srv.durationMinutes,
      price: srv.price,
      currency: profile.currency,
      status: 'confirmed',
      depositPaid: false,
      depositAmount: profile.depositFixedAmount || 30
    });

    setIsNewModalOpen(false);
    setClientName('');
    setClientPhone('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Primary Section Navigation: [Agenda & Citas] vs [Notas de Cliente / Fichas Técnicas] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
          <button
            type="button"
            onClick={() => setManagerTab('agenda')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              managerTab === 'agenda'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>{t.tabAgendaNav || 'Agenda & Citas'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold ml-0.5">
              {appointments.filter((a) => a.status !== 'cancelled').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setManagerTab('client_notes')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              managerTab === 'client_notes'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-zinc-950" />
            <span>{t.tabClientNotesNav || 'Notas & Fichas Técnicas'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
              managerTab === 'client_notes' ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {totalTechnicalNotesCount}
            </span>
          </button>
        </div>

        {managerTab === 'agenda' && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.newAppointment}</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: CLIENT TECHNICAL NOTES & BACKGROUND RECORD */}
      {managerTab === 'client_notes' ? (
        <ClientTechnicalNotesSection
          notesMap={clientTechnicalNotes}
          profile={profile}
          onOpenNoteModal={handleOpenNoteModalGeneral}
          onFilterAgendaByClient={handleFilterAgendaByClient}
          lang={lang}
        />
      ) : (
        /* VIEW 2: APPOINTMENTS AGENDA */
        <div className="space-y-6">
          {/* Top Banner - Luxurious Gold, Black & Light Gray */}
          <div className="bg-gradient-to-r from-white via-zinc-50 to-amber-50/50 border border-amber-300/70 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                  <span>{todayCount} {lang === 'pt' ? 'atendimentos hoje' : 'citas hoy'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setManagerTab('client_notes')}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 hover:bg-amber-100 hover:text-amber-950 border border-zinc-200 hover:border-amber-300 flex items-center gap-1 transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                  <span>{totalTechnicalNotesCount} {lang === 'pt' ? 'fichas de clientes' : 'notas técnicas'}</span>
                </button>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">
                {t.agendaTitle}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                {lang === 'pt'
                  ? 'Controle seus horários, consulte a ficha técnica de cada cliente e envie lembretes no WhatsApp'
                  : 'Controla tus citas, revisa la ficha técnica de cada cliente y envía recordatorios.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenNoteModalGeneral()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-semibold text-xs transition-colors shadow-2xs"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.btnNewClientNote}</span>
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.newAppointment}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(
                [
                  { id: 'upcoming', label: t.filterUpcoming },
                  { id: 'today', label: t.filterToday },
                  { id: 'all', label: t.filterAll },
                  { id: 'completed', label: t.filterCompleted },
                  { id: 'cancelled', label: t.filterCancelled }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    activeFilter === tab.id
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold shadow-xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchClient}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 space-y-3 shadow-xs">
                <Calendar className="w-10 h-10 mx-auto text-zinc-300" />
                <p className="text-sm font-medium">{t.emptyAgenda}</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const isToday = apt.date === todayIso;
                const matchedService = services.find((s) => s.id === apt.serviceId);
                const reminderUrl = buildWhatsAppUrl(
                  apt.clientWhatsapp,
                  generate24hReminderMessage(apt, profile, matchedService, lang)
                );
                const confirmationUrl = buildWhatsAppUrl(
                  apt.clientWhatsapp,
                  generateProConfirmationMessageForClient(apt, profile, matchedService, lang)
                );
                const techNote = getNoteForAppointment(apt);

                return (
                  <div
                    key={apt.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                      isToday
                        ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/30'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Left: Time & Client Data */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-amber-700">
                          {isToday ? (lang === 'pt' ? 'HOJE' : 'HOY') : apt.date.slice(5)}
                        </span>
                        <span className="text-sm font-bold text-zinc-950">
                          {apt.time}h
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm sm:text-base text-zinc-950 truncate">
                            {apt.clientName}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : apt.status === 'completed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                            }`}
                          >
                            {apt.status === 'confirmed'
                              ? (lang === 'pt' ? 'Confirmado' : 'Confirmada')
                              : apt.status === 'completed'
                              ? (lang === 'pt' ? 'Concluído' : 'Completada')
                              : (lang === 'pt' ? 'Cancelado' : 'Cancelada')}
                          </span>
                        </div>

                        <p className="text-xs text-amber-700 font-semibold">
                          {apt.serviceName}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1 font-bold text-zinc-900">
                            {formatPrice(apt.price, apt.currency, lang)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <Phone className="w-3 h-3" />
                            {apt.clientWhatsapp}
                          </span>
                          {apt.clientNotes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[200px] text-zinc-500">
                                "{apt.clientNotes}"
                              </span>
                            </>
                          )}
                        </div>

                        {/* CLIENT TECHNICAL NOTES PREVIEW BADGE */}
                        {techNote ? (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenNoteForAppointment(apt)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 transition-colors shadow-2xs"
                              title="Ver ficha técnica completa"
                            >
                              <ClipboardList className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="text-[10px] uppercase font-bold text-amber-700">Ficha:</span>
                              <span className="font-medium text-amber-950 truncate max-w-[180px] sm:max-w-xs">
                                {techNote.lashCurvature
                                  ? `${techNote.lashCurvature} ${techNote.lashLengths || ''} ${techNote.lashMapping ? '• ' + techNote.lashMapping : ''}`
                                  : techNote.makeupFoundationTone
                                  ? `Tono ${techNote.makeupFoundationTone}`
                                  : techNote.nailTechnique
                                  ? `${techNote.nailTechnique} ${techNote.nailShape || ''}`
                                  : techNote.browOrHairPigment
                                  ? techNote.browOrHairPigment
                                  : 'Antecedentes registrados'}
                              </span>
                            </button>

                            {techNote.allergies && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-900 border border-red-300">
                                <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                <span className="truncate max-w-[150px]">Alergia: {techNote.allergies}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenNoteForAppointment(apt)}
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-800 font-medium transition-colors"
                            >
                              <ClipboardList className="w-3 h-3 text-amber-600" />
                              <span>+ Registrar Ficha Técnica</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 flex-wrap">
                      {/* Technical Sheet Button */}
                      <button
                        onClick={() => handleOpenNoteForAppointment(apt)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors shadow-2xs ${
                          techNote
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                        title={lang === 'pt' ? 'Ficha técnica da cliente' : 'Ficha técnica / antecedentes'}
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                        <span>{techNote ? t.technicalSheetBtn : '+ Ficha'}</span>
                      </button>

                      {/* WhatsApp Confirmation with Dynamic Bank & PIX details */}
                      <a
                        href={confirmationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                        title={lang === 'pt' ? 'Enviar confirmação com dados bancários e chave PIX' : 'Enviar confirmación con datos bancarios o PIX'}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden xs:inline">{lang === 'pt' ? 'Confirmar & PIX' : 'Confirmar & Banco'}</span>
                      </a>

                      {/* WhatsApp Reminder Button */}
                      <a
                        href={reminderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                        title={lang === 'pt' ? 'Enviar lembrete no WhatsApp' : 'Recordatorio'}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{t.sendReminderBtn}</span>
                      </a>

                      {/* AI Client Assistant Response Button */}
                      {onOpenAiAssistantForAppointment && (
                        <button
                          type="button"
                          onClick={() => onOpenAiAssistantForAppointment(apt)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-400/20 hover:from-amber-400/30 hover:to-yellow-400/30 border border-amber-300 text-amber-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                          title={lang === 'pt' ? 'Redigir resposta com IA para esta cliente' : 'Redactar respuesta inteligente con IA'}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span className="hidden xs:inline">{lang === 'pt' ? 'IA Responder' : 'IA Responder'}</span>
                        </button>
                      )}

                      {/* Complete / Status Toggle */}
                      {apt.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateStatus(apt.id, 'completed')}
                          className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1 border border-zinc-200 transition-colors"
                          title="Marcar concluído"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden xs:inline">{t.markCompleted}</span>
                        </button>
                      )}

                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 text-xs transition-colors"
                          title="Cancelar agendamento"
                        >
                          <XCircle className="w-4 h-4 text-zinc-400 hover:text-red-600" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(lang === 'pt' ? 'Excluir este agendamento?' : '¿Eliminar cita?')) {
                            onDeleteAppointment(apt.id);
                          }
                        }}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Manual Create Appointment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              <span>{t.newAppointment}</span>
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.yourFullName} *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.whatsappNumber}
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="11987654321"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.serviceCategory}
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {formatPrice(s.price, profile.currency, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.dateStep}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.notesLabel}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observação da cliente..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-medium"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  {lang === 'pt' ? 'Salvar Agendamento' : 'Guardar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technical Note Modal */}
      <ClientTechnicalNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        clientNote={selectedNoteForModal}
        initialClientName={modalClientName}
        initialClientPhone={modalClientPhone}
        initialCategory={modalCategory}
        onSave={handleSaveNote}
        lang={lang}
      />
    </div>
  );
};
