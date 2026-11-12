import React, { useState, useMemo } from 'react';
import {
  BeautyProProfile,
  BeautyService,
  Appointment,
  AppLanguage,
  AiReplyTone,
  AiReplyScenario
} from '../types';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Bot,
  MessageSquare,
  Scissors,
  Calendar,
  Phone,
  RefreshCw,
  Heart,
  ShieldAlert,
  Clock,
  RotateCw,
  HelpCircle,
  X,
  ExternalLink,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import { cleanPhoneNumber } from '../utils/whatsapp';

interface AiClientAssistantProps {
  profile: BeautyProProfile;
  services: BeautyService[];
  appointments?: Appointment[];
  preselectedAppointment?: Appointment | null;
  onClose?: () => void;
  isModal?: boolean;
  lang?: AppLanguage;
}

interface SavedReplyHistoryItem {
  id: string;
  clientName: string;
  scenario: AiReplyScenario;
  replyText: string;
  timestamp: string;
}

const SCENARIOS: {
  id: AiReplyScenario;
  label: Record<string, string>;
  icon: string;
  exampleClientMessage: Record<string, string>;
  description: Record<string, string>;
}[] = [
  {
    id: 'free_inquiry',
    label: {
      es: '💬 Consulta Libre / Duda',
      pt: '💬 Dúvida Livre / Mensagem',
      en: '💬 Free Inquiry'
    },
    icon: '💬',
    exampleClientMessage: {
      es: 'Hola bella, ¿cómo estás? Quería saber si tienes disponibilidad para hacerme un servicio y cómo funcionan tus turnos.',
      pt: 'Oi linda, tudo bem? Queria saber se você tem horário para essa semana e como funciona para agendar.',
      en: 'Hi! Do you have availability this week and how does booking work?'
    },
    description: {
      es: 'Pega cualquier mensaje que te haya enviado la clienta',
      pt: 'Cole qualquer mensagem que a cliente te enviou',
      en: 'Paste any message received from the client'
    }
  },
  {
    id: 'quote_service',
    label: {
      es: '💰 Cotizar Servicio & Agendar',
      pt: '💰 Orçamento & Agendamento',
      en: '💰 Quote & Booking'
    },
    icon: '💰',
    exampleClientMessage: {
      es: 'Hola, ¿cuánto cuesta el procedimiento, cuánto tiempo dura y qué días atiendes?',
      pt: 'Olá, quanto custa o procedimento, quanto tempo dura e quais dias você atende?',
      en: 'Hello! How much is this procedure, how long does it take, and what days are open?'
    },
    description: {
      es: 'Informa el precio real del catálogo e invita a reservar en el enlace',
      pt: 'Informa preço do catálogo e convida a reservar no link',
      en: 'Provides exact catalog price and invites client to book'
    }
  },
  {
    id: 'aftercare_tips',
    label: {
      es: '💅 Cuidados Posteriores',
      pt: '💅 Cuidados Pós-Procedimento',
      en: '💅 Aftercare Tips'
    },
    icon: '💅',
    exampleClientMessage: {
      es: 'Hola, me encantó como quedaron, pero se me cayeron un par de pestañas hoy, ¿es normal o qué cuidados debo tener?',
      pt: 'Oi! Amei o resultado, mas caíram alguns fios hoje, é normal ou quais cuidados devo ter?',
      en: 'Hi! I love the results, but a few lashes shed today, is that normal and how should I care for them?'
    },
    description: {
      es: 'Explica los cuidados del catálogo y cómo mantener el resultado impecable',
      pt: 'Explica cuidados pós do catálogo para manter o trabalho impecável',
      en: 'Explains maintenance and aftercare instructions'
    }
  },
  {
    id: 'reschedule_delay',
    label: {
      es: '📅 Reprogramar / Retraso de Clienta',
      pt: '📅 Remarcação / Atraso da Cliente',
      en: '📅 Reschedule / Client Running Late'
    },
    icon: '📅',
    exampleClientMessage: {
      es: 'Hola bella, estoy con mucho tráfico y voy a llegar 20 minutos tarde a mi cita de hoy, ¿igual me puedes atender?',
      pt: 'Oi querida, peguei muito trânsito e vou atrasar uns 20 minutos, ainda consegue me atender?',
      en: 'Hi! Im stuck in traffic and will be 20 min late, can you still take me?'
    },
    description: {
      es: 'Responde con empatía cuidando tus tiempos y ofreciendo reprogramar si es necesario',
      pt: 'Responde com empatia protegendo sua agenda de atendimentos',
      en: 'Handles lateness politely while protecting schedule'
    }
  },
  {
    id: 'cancellation_policy',
    label: {
      es: '🛡️ Política de Cancelación / Seña',
      pt: '🛡️ Política de Sinal & Cancelamento',
      en: '🛡️ Cancellation Policy / Deposit'
    },
    icon: '🛡️',
    exampleClientMessage: {
      es: 'Hola, no voy a poder ir a mi cita de hoy. ¿Me devuelves el dinero de la seña que te transferí?',
      pt: 'Olá, não vou conseguir ir hoje no meu horário. Você devolve o valor do sinal que paguei?',
      en: 'Hi, I cannot make it to my appointment today. Can you refund my deposit?'
    },
    description: {
      es: 'Explica con respeto y firmeza la política de reserva del estudio',
      pt: 'Explica com respeito e firmeza as políticas de reserva do espaço',
      en: 'Explains non-refundable deposit policy with grace'
    }
  },
  {
    id: 'touchup_maintenance',
    label: {
      es: '⏰ Recordar Retoque / Mantenimiento',
      pt: '⏰ Alerta de Retoque / Manutenção',
      en: '⏰ Touch-up Reminder'
    },
    icon: '⏰',
    exampleClientMessage: {
      es: 'Hola, ¿ya es momento de hacerme el retoque o todavía espero unos días más?',
      pt: 'Oi, já está na hora de fazer a manutenção ou espero mais alguns dias?',
      en: 'Hi, is it time for my fill/maintenance yet or should I wait?'
    },
    description: {
      es: 'Invita a retocar a tiempo según el ciclo recomendado de días',
      pt: 'Convida para manutenção dentro do ciclo ideal de dias',
      en: 'Encourages timely touch-up booking'
    }
  },
  {
    id: 'reactivate_client',
    label: {
      es: '🌸 Reactivar Clienta Antigua',
      pt: '🌸 Resgatar Cliente Sumida',
      en: '🌸 Reactivate Old Client'
    },
    icon: '🌸',
    exampleClientMessage: {
      es: 'Hola bella, hace tiempo no me hago nada, ¿tienes alguna promo o qué me recomiendas?',
      pt: 'Oi linda, faz tempo que não vou aí, tem alguma novidade ou promoção?',
      en: 'Hey! It has been a while since my last visit, do you have any promos?'
    },
    description: {
      es: 'Mensaje cariñoso para volver a enamorar a clientas que hace semanas no vienen',
      pt: 'Mensagem acolhedora para trazer de volta clientes queridas',
      en: 'Warm message to re-engage past clients'
    }
  }
];

export const AiClientAssistant: React.FC<AiClientAssistantProps> = ({
  profile,
  services,
  appointments = [],
  preselectedAppointment = null,
  onClose,
  isModal = false,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  // Selected client & appointment state
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    preselectedAppointment ? preselectedAppointment.id : ''
  );
  const [clientName, setClientName] = useState<string>(
    preselectedAppointment ? preselectedAppointment.clientName : ''
  );
  const [clientPhone, setClientPhone] = useState<string>(
    preselectedAppointment ? preselectedAppointment.clientWhatsapp : ''
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedAppointment ? preselectedAppointment.serviceId : services[0]?.id || ''
  );

  // Configuration & generation inputs
  const [scenario, setScenario] = useState<AiReplyScenario>('quote_service');
  const [tone, setTone] = useState<AiReplyTone>('warm_friendly');
  const [clientMessage, setClientMessage] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Generation status & result
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local storage history
  const [history, setHistory] = useState<SavedReplyHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('glowbeauty_ai_reply_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Effective direct booking URL
  const activeBookingUrl =
    profile.customShareLink ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?view=client&pro=${profile.slug || 'studio'}`
      : `https://meustudio.com.br/${profile.slug || 'studio'}`);

  // When preselected appointment changes
  const handleSelectAppointment = (aptId: string) => {
    setSelectedAppointmentId(aptId);
    if (!aptId) return;
    const found = appointments.find((a) => a.id === aptId);
    if (found) {
      setClientName(found.clientName);
      setClientPhone(found.clientWhatsapp);
      setSelectedServiceId(found.serviceId);
    }
  };

  const handleUseScenarioExample = (sc: typeof SCENARIOS[0]) => {
    const text = sc.exampleClientMessage[lang] || sc.exampleClientMessage.es;
    setClientMessage(text);
    setScenario(sc.id);
  };

  // Generate AI Reply
  const handleGenerateReply = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/reply-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientMessage: clientMessage.trim(),
          scenario,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          serviceId: selectedServiceId,
          tone,
          customInstructions: customInstructions.trim()
        })
      });

      if (!res.ok) {
        throw new Error(`Servidor devolvió código ${res.status}`);
      }

      const data = await res.json();
      if (data.reply) {
        setGeneratedReply(data.reply);
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);

        // Save to local history
        const newHistItem: SavedReplyHistoryItem = {
          id: `reply-${Date.now()}`,
          clientName: clientName.trim() || 'Clienta',
          scenario,
          replyText: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updatedHist = [newHistItem, ...history.slice(0, 9)];
        setHistory(updatedHist);
        try {
          localStorage.setItem('glowbeauty_ai_reply_history', JSON.stringify(updatedHist));
        } catch {}
      } else {
        throw new Error('Respuesta vacía');
      }
    } catch (err: any) {
      console.error('Error generating reply:', err);
      setErrorMessage(
        lang === 'pt'
          ? 'Não foi possível conectar com o assistente. Tente novamente em instantes.'
          : 'No se pudo conectar con el asistente de IA. Intenta de nuevo.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReply = async () => {
    if (!generatedReply) return;
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  const cleanPhone = cleanPhoneNumber(clientPhone);
  const whatsappSendUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedReply)}`
    : `https://wa.me/?text=${encodeURIComponent(generatedReply)}`;

  return (
    <div className={`space-y-6 ${isModal ? 'max-h-[85vh] overflow-y-auto pr-1' : ''}`}>
      {/* Top Banner: AI Agent Identity */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white rounded-2xl p-5 sm:p-6 border border-[#72202E]/40/40 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#72202E] text-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#72202E] text-white/20 text-amber-300 border border-[#72202E]/40/40 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{lang === 'pt' ? 'Agente de IA Oficial' : 'Agente de IA Oficial'}</span>
              </span>
              <span className="text-[10px] text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
              <span className="text-[10px] text-zinc-300 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {profile.businessName}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span>
                {lang === 'pt'
                  ? 'Assistente IA: Respostas Inteligentes para Clientes'
                  : 'Asistente IA: Respuestas Inteligentes para Clientas'}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
              {lang === 'pt'
                ? 'Gere mensagens perfeitas e persuasivas para enviar pelo WhatsApp ou Instagram com preços, políticas, cuidados e link de agendamento em 1 clique.'
                : 'Genera respuestas persuasivas, profesionales y cálidas para WhatsApp o Instagram con tus precios, políticas, cuidados y enlace en 1 clic.'}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Inputs & Generation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Message Input (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Client & Service Selection */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#72202E]" />
                <span>{lang === 'pt' ? '1. Dados da Cliente & Procedimento' : '1. Datos de la Clienta y Servicio'}</span>
              </h3>
              <span className="text-[11px] text-zinc-400">
                {lang === 'pt' ? 'Opcional para personalizar' : 'Opcional para personalizar'}
              </span>
            </div>

            {/* Quick appointment selector if available */}
            {appointments.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {lang === 'pt' ? 'Vincular com Agendamento Recente:' : 'Vincular con Cita Reciente:'}
                </label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => handleSelectAppointment(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                >
                  <option value="">{lang === 'pt' ? '-- Escrever nome manualmente ou nova cliente --' : '-- Escribir manualmente o nueva clienta --'}</option>
                  {appointments.slice(0, 15).map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.clientName} • {apt.serviceName} ({apt.date} {apt.time})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {lang === 'pt' ? 'Nome da Cliente' : 'Nombre de la Clienta'}
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Mariana, Camila, Sofía..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {lang === 'pt' ? 'WhatsApp da Cliente (com DDD)' : 'WhatsApp de la Clienta'}
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: +55 11 99999-9999"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {lang === 'pt' ? 'Procedimento / Serviço em Destaque:' : 'Procedimiento / Servicio del Catálogo:'}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category}) • {formatPrice(s.price, profile.currency, lang)} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Scenario and Tone Selection */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#72202E]" />
              <span>{lang === 'pt' ? '2. Cenário & Tom de Voz' : '2. Escenario y Tono de Voz'}</span>
            </h3>

            {/* Quick Scenario Buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                {lang === 'pt' ? 'Selecione o Objetivo da Mensagem:' : 'Selecciona el Objetivo del Mensaje:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SCENARIOS.map((sc) => {
                  const isSelected = scenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleUseScenarioExample(sc)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#F4EFEB] border-[#72202E]/40 text-[#1F1E1D] font-bold ring-2 ring-amber-400/20 shadow-2xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="text-sm mb-1">{sc.icon}</span>
                      <span className="line-clamp-2 leading-tight">
                        {sc.label[lang] || sc.label.es}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                {lang === 'pt' ? 'Tom de Voz da Resposta:' : 'Tono de Voz de la Respuesta:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'warm_friendly',
                    label: lang === 'pt' ? '🌸 Afetuoso & Amigável' : '🌸 Cálido & Afectuoso',
                    desc: lang === 'pt' ? 'Ideal para beleza' : 'Cercano con emojis'
                  },
                  {
                    id: 'professional_elegant',
                    label: lang === 'pt' ? '💎 Elegante & VIP' : '💎 Elegante & VIP',
                    desc: lang === 'pt' ? 'Clássico e formal' : 'Sobrio y distinguido'
                  },
                  {
                    id: 'persuasive_sales',
                    label: lang === 'pt' ? '🎯 Comercial & Vendas' : '🎯 Comercial & Cierre',
                    desc: lang === 'pt' ? 'Foco em fechar vaga' : 'Cierra el turno'
                  },
                  {
                    id: 'firm_respectful',
                    label: lang === 'pt' ? '⚖️ Firme & Políticas' : '⚖️ Firme & Políticas',
                    desc: lang === 'pt' ? 'Limites de horários' : 'Puntualidad y seña'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id as AiReplyTone)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tone === item.id
                        ? 'bg-[#72202E]/10/90 border-[#72202E]/40 text-[#1F1E1D] font-bold shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client message input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-800">
                  {lang === 'pt' ? 'O que a cliente escreveu ou perguntou:' : 'Mensaje o Duda que envió la clienta:'}
                </label>
                <span className="text-[10px] text-[#72202E] font-medium">
                  {lang === 'pt' ? 'Cole o texto do WhatsApp' : 'Pega el texto del chat'}
                </span>
              </div>
              <textarea
                rows={3}
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                placeholder={
                  lang === 'pt'
                    ? 'Ex: Oi, quanto custa o volume brasileiro e você tem horário para sexta à tarde?'
                    : 'Ej: Hola, ¿cuánto cuesta el volumen ruso y tienes disponibilidad para este viernes a la tarde?'
                }
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 leading-relaxed focus:bg-white focus:outline-none focus:border-[#72202E] focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {lang === 'pt' ? 'Instrução Extra da Profissional (Opcional):' : 'Instrucción Extra de la Profesional (Opcional):'}
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={
                  lang === 'pt'
                    ? 'Ex: Avise que só tenho vaga às 16:30 e que precisa pagar R$ 30 de sinal.'
                    : 'Ej: Dile que solo me queda a las 16:30 y que debe abonar seña para asegurar.'
                }
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
              />
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* GENERATE BUTTON */}
            <button
              type="button"
              onClick={handleGenerateReply}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#72202E] to-[#581520] hover:from-amber-500 hover:to-yellow-600 disabled:opacity-50 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>{lang === 'pt' ? 'Redigindo Resposta com Inteligência Artificial...' : 'Redactando Respuesta con IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>{lang === 'pt' ? 'Gerar Resposta com IA' : 'Generar Respuesta con IA'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & WhatsApp Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Output Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'pt' ? 'Resposta Pronta para WhatsApp' : 'Respuesta Lista para WhatsApp'}</span>
              </h3>
              {generatedReply && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {lang === 'pt' ? 'Pronta para Enviar' : 'Lista para Enviar'}
                </span>
              )}
            </div>

            {/* Chat Bubble Presentation */}
            {generatedReply ? (
              <div className="space-y-3">
                {/* Simulated WhatsApp Bubble */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2 shadow-2xs relative">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{clientName ? `Para: ${clientName}` : 'Mensaje sugerido'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="font-sans text-xs text-zinc-900 whitespace-pre-wrap leading-relaxed selection:bg-amber-300">
                    {generatedReply}
                  </div>
                </div>

                {/* Action Buttons: Copy & Direct Send */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyReply}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span>{lang === 'pt' ? 'Copiado!' : '¡Copiado!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#72202E]" />
                        <span>{lang === 'pt' ? 'Copiar Mensagem' : 'Copiar Mensaje'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappSendUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform text-center"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'pt' ? 'Enviar WhatsApp' : 'Enviar por WhatsApp'}</span>
                  </a>
                </div>

                {/* AI Follow-up suggestions */}
                {suggestions.length > 0 && (
                  <div className="bg-[#F4EFEB]/80 border border-[#EAE3D9] rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#72202E] uppercase tracking-wider block">
                      💡 {lang === 'pt' ? 'Dicas da IA para a profissional:' : 'Consejos del Agente IA:'}
                    </span>
                    <ul className="space-y-1">
                      {suggestions.map((sug, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-700 flex items-start gap-1.5">
                          <span className="text-[#72202E] font-bold">•</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-300 rounded-2xl p-8 text-center space-y-3 bg-zinc-50/50">
                <div className="w-12 h-12 rounded-2xl bg-[#72202E]/10 text-[#72202E] flex items-center justify-center mx-auto shadow-2xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">
                    {lang === 'pt' ? 'Nenhuma resposta gerada ainda' : 'Ninguna respuesta generada todavía'}
                  </h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    {lang === 'pt'
                      ? 'Escolha um cenário à esquerda, cole a mensagem da sua cliente e clique em "Gerar Resposta com IA".'
                      : 'Elige un escenario, pega el mensaje de tu clienta y haz clic en "Generar Respuesta con IA".'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Context Summary */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Contexto Ativo do Negócio:' : 'Contexto Activo del Negocio:'}</span>
            </span>
            <div className="space-y-1 text-[11px] text-zinc-600">
              <p>• <strong>{profile.businessName}</strong> ({profile.city || 'Estudio'})</p>
              <p>• <strong>{services.length}</strong> {lang === 'pt' ? 'serviços cadastrados no catálogo' : 'servicios en catálogo'}</p>
              <p>• {profile.requireDeposit ? `Sinal de ${profile.currency} ${profile.depositFixedAmount || 30} obrigatório` : 'Sem cobrança de sinal'}</p>
              <p className="truncate">• Link: <span className="font-mono text-[#72202E]">{activeBookingUrl}</span></p>
            </div>
          </div>

          {/* Saved History */}
          {history.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">
                  {lang === 'pt' ? 'Histórico Recente de Respostas' : 'Historial Reciente de Respuestas'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    try {
                      localStorage.removeItem('glowbeauty_ai_reply_history');
                    } catch {}
                  }}
                  className="text-[10px] text-zinc-400 hover:text-red-600"
                >
                  {lang === 'pt' ? 'Limpar' : 'Limpiar'}
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {history.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-[#72202E]/30 transition-colors cursor-pointer text-left"
                    onClick={() => {
                      setGeneratedReply(item.replyText);
                      setClientName(item.clientName);
                      setScenario(item.scenario);
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                      <span className="font-bold text-[#72202E]">{item.clientName}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zinc-800 line-clamp-2 leading-tight">
                      {item.replyText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
