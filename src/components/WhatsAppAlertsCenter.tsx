import React, { useState, useMemo } from 'react';
import {
  Appointment,
  BeautyProProfile,
  BeautyService,
  WhatsAppTemplate,
  WhatsAppAlertItem,
  AppLanguage
} from '../types';
import {
  Send,
  RotateCw,
  Bell,
  Check,
  Search,
  Edit2,
  Save,
  Sparkles,
  MessageSquare,
  Bot
} from 'lucide-react';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import {
  generateMaintenanceAlertMessage,
  generate24hReminderMessage,
  buildWhatsAppUrl
} from '../utils/whatsapp';
import { AiClientAssistant } from './AiClientAssistant';

interface WhatsAppAlertsCenterProps {
  appointments: Appointment[];
  profile: BeautyProProfile;
  services: BeautyService[];
  templates: WhatsAppTemplate[];
  onUpdateTemplate: (id: string, newText: string) => void;
  lang?: AppLanguage;
}

export const WhatsAppAlertsCenter: React.FC<WhatsAppAlertsCenterProps> = ({
  appointments,
  profile,
  services,
  templates,
  onUpdateTemplate,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  const [activeTab, setActiveTab] = useState<'maintenance' | 'reminders' | 'templates' | 'ai_agent'>('maintenance');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentAlertIds, setSentAlertIds] = useState<string[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 1. Calculate Maintenance Alerts (Clients due for touchup)
  const maintenanceAlerts = useMemo(() => {
    const today = new Date();
    const list: WhatsAppAlertItem[] = [];

    appointments.forEach((apt) => {
      if (apt.status === 'cancelled') return;

      const aptDate = new Date(`${apt.date}T12:00:00`);
      const diffTime = today.getTime() - aptDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const srv = services.find((s) => s.id === apt.serviceId);
      const cycleDays = srv?.suggestedMaintenanceDays || 21;

      // Flag for maintenance if within range of suggested cycle
      if (diffDays >= cycleDays - 3 && diffDays <= cycleDays + 15) {
        const messageText = generateMaintenanceAlertMessage(apt, profile, srv, lang);
        const whatsappUrl = buildWhatsAppUrl(apt.clientWhatsapp, messageText);

        list.push({
          id: `maint-${apt.id}`,
          type: 'maintenance',
          appointmentId: apt.id,
          clientName: apt.clientName,
          clientWhatsapp: apt.clientWhatsapp,
          serviceName: apt.serviceName,
          appointmentDate: apt.date,
          appointmentTime: apt.time,
          price: apt.price,
          currency: apt.currency,
          daysElapsed: diffDays,
          suggestedMaintenanceDays: cycleDays,
          messageText,
          whatsappUrl,
          status: sentAlertIds.includes(`maint-${apt.id}`) ? 'sent' : 'pending'
        });
      }
    });

    return list.sort((a, b) => (b.daysElapsed || 0) - (a.daysElapsed || 0));
  }, [appointments, services, profile, sentAlertIds, lang]);

  // 2. Calculate 24h & Today Reminders
  const reminderAlerts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    const list: WhatsAppAlertItem[] = [];

    appointments.forEach((apt) => {
      if (apt.status === 'cancelled' || apt.status === 'completed') return;

      if (apt.date === today || apt.date === tomorrow) {
        const srv = services.find((s) => s.id === apt.serviceId);
        const messageText = generate24hReminderMessage(apt, profile, srv, lang);
        const whatsappUrl = buildWhatsAppUrl(apt.clientWhatsapp, messageText);

        list.push({
          id: `remind-${apt.id}`,
          type: apt.date === today ? 'reminder_today' : 'reminder_24h',
          appointmentId: apt.id,
          clientName: apt.clientName,
          clientWhatsapp: apt.clientWhatsapp,
          serviceName: apt.serviceName,
          appointmentDate: apt.date,
          appointmentTime: apt.time,
          price: apt.price,
          currency: apt.currency,
          messageText,
          whatsappUrl,
          status: sentAlertIds.includes(`remind-${apt.id}`) ? 'sent' : 'pending'
        });
      }
    });

    return list.sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  }, [appointments, services, profile, sentAlertIds, lang]);

  const handleMarkSent = (id: string) => {
    setSentAlertIds((prev) => [...prev, id]);
  };

  const currentList = activeTab === 'maintenance' ? maintenanceAlerts : reminderAlerts;

  const filteredList = currentList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.clientName.toLowerCase().includes(term) ||
      item.serviceName.toLowerCase().includes(term) ||
      item.clientWhatsapp.includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner - Gold, Black & Light Gray */}
      <div className="bg-gradient-to-r from-white via-zinc-50 to-amber-50/50 border border-amber-300/70 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'pt' ? 'Fidelização & Retorno' : 'Fidelización'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">
            {t.alertsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {t.alertsSub}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-zinc-200 text-xs shadow-xs">
            <span className="text-zinc-600 font-medium">{t.readyToSend}: </span>
            <span className="font-bold text-amber-700">
              {currentList.filter((a) => a.status === 'pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
            activeTab === 'maintenance'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{t.tabMaintenance}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {maintenanceAlerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
            activeTab === 'reminders'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t.tabReminders}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {reminderAlerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Modelos de Mensagem' : 'Plantillas'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_agent')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ai_agent'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-700" />
          <span>{lang === 'pt' ? '🤖 Agente IA de Respostas' : '🤖 Agente IA de Respuestas'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400/30 text-zinc-950 font-bold border border-amber-400/50">
            Gemini
          </span>
        </button>
      </div>

      {/* AI Agent View */}
      {activeTab === 'ai_agent' && (
        <AiClientAssistant
          profile={profile}
          services={services}
          appointments={appointments}
          lang={lang}
        />
      )}

      {/* Alerts View */}
      {activeTab !== 'templates' && activeTab !== 'ai_agent' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchClient}
              className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 space-y-2 shadow-xs">
                <Check className="w-8 h-8 mx-auto text-amber-600" />
                <p className="text-xs font-medium">
                  {lang === 'pt' ? 'Tudo em dia! Nenhum aviso pendente no momento.' : '¡Todo al día!'}
                </p>
              </div>
            ) : (
              filteredList.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                    alert.status === 'sent'
                      ? 'border-zinc-200 opacity-60'
                      : 'border-zinc-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-zinc-950">
                        {alert.clientName}
                      </h3>
                      {alert.daysElapsed !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {alert.daysElapsed} {t.elapsedDays} (Ciclo: {alert.suggestedMaintenanceDays}d)
                        </span>
                      )}
                      {alert.status === 'sent' && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {t.sentCount}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-amber-700 font-semibold">
                      {alert.serviceName} • {formatPrice(alert.price, alert.currency, lang)}
                    </p>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-[11px] text-zinc-700 font-mono line-clamp-2">
                      {alert.messageText}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                    <a
                      href={alert.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleMarkSent(alert.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.sendViaWhatsApp}</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Templates Editor View */
        <div className="space-y-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-zinc-950 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{tpl.title}</span>
                </h3>

                {editingTemplateId === tpl.id ? (
                  <button
                    onClick={() => {
                      onUpdateTemplate(tpl.id, editingText);
                      setEditingTemplateId(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTemplateId(tpl.id);
                      setEditingText(tpl.template);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    title="Editar modelo"
                  >
                    <Edit2 className="w-4 h-4 text-amber-600" />
                  </button>
                )}
              </div>

              {editingTemplateId === tpl.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {lang === 'pt' ? 'Inserir variável:' : 'Insertar variable:'}
                    </span>
                    {['{cliente}', '{servicio}', '{fecha}', '{hora}', '{precio}', '{negocio}', '{direccion}', '{datos_bancarios}', '{pix}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditingText((prev) => `${prev} ${v}`)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                          v === '{datos_bancarios}' || v === '{pix}'
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold hover:bg-amber-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs text-zinc-800 font-mono whitespace-pre-line leading-relaxed">
                  {tpl.template}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
