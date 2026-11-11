import React, { useState } from 'react';
import { BeautyProProfile, DaySchedule, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import {
  Clock,
  Calendar,
  Check,
  Save,
  Sparkles,
  Coffee,
  CheckCircle2,
  XCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_WEEKLY_SCHEDULE } from '../data/initialData';

interface WeeklyScheduleManagerProps {
  profile: BeautyProProfile;
  onSaveSchedule: (weeklySchedule: DaySchedule[], slotDurationMinutes: number) => void;
  lang?: AppLanguage;
}

const DAY_LABELS = {
  pt: [
    { day: 0, name: 'Domingo', short: 'Dom', type: 'weekend' },
    { day: 1, name: 'Segunda-feira', short: 'Seg', type: 'weekday' },
    { day: 2, name: 'Terça-feira', short: 'Ter', type: 'weekday' },
    { day: 3, name: 'Quarta-feira', short: 'Qua', type: 'weekday' },
    { day: 4, name: 'Quinta-feira', short: 'Qui', type: 'weekday' },
    { day: 5, name: 'Sexta-feira', short: 'Sex', type: 'weekday' },
    { day: 6, name: 'Sábado', short: 'Sáb', type: 'weekend' }
  ],
  es: [
    { day: 0, name: 'Domingo', short: 'Dom', type: 'weekend' },
    { day: 1, name: 'Lunes', short: 'Lun', type: 'weekday' },
    { day: 2, name: 'Martes', short: 'Mar', type: 'weekday' },
    { day: 3, name: 'Miércoles', short: 'Mié', type: 'weekday' },
    { day: 4, name: 'Jueves', short: 'Jue', type: 'weekday' },
    { day: 5, name: 'Viernes', short: 'Vie', type: 'weekday' },
    { day: 6, name: 'Sábado', short: 'Sáb', type: 'weekend' }
  ],
  en: [
    { day: 0, name: 'Sunday', short: 'Sun', type: 'weekend' },
    { day: 1, name: 'Monday', short: 'Mon', type: 'weekday' },
    { day: 2, name: 'Tuesday', short: 'Tue', type: 'weekday' },
    { day: 3, name: 'Wednesday', short: 'Wed', type: 'weekday' },
    { day: 4, name: 'Thursday', short: 'Thu', type: 'weekday' },
    { day: 5, name: 'Friday', short: 'Fri', type: 'weekday' },
    { day: 6, name: 'Saturday', short: 'Sat', type: 'weekend' }
  ]
};

// Calculate total daily hours excluding break
function calculateDailyHours(schedule: DaySchedule): number {
  if (!schedule.isOpen) return 0;
  const [sh, sm] = (schedule.openTime || '09:00').split(':').map(Number);
  const [eh, em] = (schedule.closeTime || '19:00').split(':').map(Number);
  let totalMinutes = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));

  if (schedule.hasBreak && schedule.breakStart && schedule.breakEnd) {
    const [bsh, bsm] = schedule.breakStart.split(':').map(Number);
    const [beh, bem] = schedule.breakEnd.split(':').map(Number);
    const breakMinutes = (beh * 60 + (bem || 0)) - (bsh * 60 + (bsm || 0));
    if (breakMinutes > 0) {
      totalMinutes -= breakMinutes;
    }
  }

  return Math.max(0, totalMinutes / 60);
}

export const WeeklyScheduleManager: React.FC<WeeklyScheduleManagerProps> = ({
  profile,
  onSaveSchedule,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const daysMeta = DAY_LABELS[lang] || DAY_LABELS.pt;

  // Initialize schedule with fallback to default
  const [scheduleList, setScheduleList] = useState<DaySchedule[]>(() => {
    if (Array.isArray(profile.weeklySchedule) && profile.weeklySchedule.length === 7) {
      return JSON.parse(JSON.stringify(profile.weeklySchedule));
    }
    return JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
  });

  const [slotDuration, setSlotDuration] = useState<number>(profile.slotDurationMinutes || 60);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Toggle open status for a day
  const handleToggleDay = (dayOfWeek: number) => {
    setScheduleList((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? { ...item, isOpen: !item.isOpen }
          : item
      )
    );
  };

  // Update opening or closing time
  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setScheduleList((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Toggle lunch break
  const handleToggleBreak = (dayOfWeek: number) => {
    setScheduleList((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek !== dayOfWeek) return item;
        const newHasBreak = !item.hasBreak;
        return {
          ...item,
          hasBreak: newHasBreak,
          breakStart: item.breakStart || '12:30',
          breakEnd: item.breakEnd || '13:30'
        };
      })
    );
  };

  // Update break times
  const handleBreakTimeChange = (dayOfWeek: number, field: 'breakStart' | 'breakEnd', value: string) => {
    setScheduleList((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Quick Preset 1: Monday to Saturday (Beauty Salon Standard)
  const applyPresetSegSab = () => {
    setScheduleList([
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false }, // Dom
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '20:00', hasBreak: false },
      { dayOfWeek: 6, isOpen: true, openTime: '08:30', closeTime: '18:00', hasBreak: false }
    ]);
  };

  // Quick Preset 2: Tuesday to Saturday (Day off on Monday)
  const applyPresetTerSab = () => {
    setScheduleList([
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false }, // Dom
      { dayOfWeek: 1, isOpen: false, openTime: '09:00', closeTime: '19:00', hasBreak: false }, // Seg
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '20:00', hasBreak: false },
      { dayOfWeek: 6, isOpen: true, openTime: '08:30', closeTime: '18:00', hasBreak: false }
    ]);
  };

  // Quick Preset 3: Monday to Friday
  const applyPresetSegSex = () => {
    setScheduleList([
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false }, // Dom
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:30', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:30', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:30', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:30', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:30', hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false } // Sab
    ]);
  };

  // Copy Monday's hours to all weekdays (Tue-Fri)
  const copyMondayToWeekdays = () => {
    const monday = scheduleList.find((s) => s.dayOfWeek === 1);
    if (!monday) return;
    setScheduleList((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek >= 2 && item.dayOfWeek <= 5) {
          return {
            ...item,
            isOpen: true,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            hasBreak: monday.hasBreak,
            breakStart: monday.breakStart,
            breakEnd: monday.breakEnd
          };
        }
        return item;
      })
    );
  };

  // Submit and save
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSchedule(scheduleList, slotDuration);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  // Aggregate stats
  const openDaysCount = scheduleList.filter((s) => s.isOpen).length;
  const totalWeeklyHours = scheduleList.reduce((acc, s) => acc + calculateDailyHours(s), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {savedFeedback && (
        <div className="fixed top-20 right-4 z-50 bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span className="text-xs">{t.scheduleSavedSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'pt' ? 'Validação Automática em Tempo Real' : 'Validación Automática'}</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-950 font-serif">
            {t.weeklyScheduleTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            {t.weeklyScheduleSub}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{t.scheduleSaveBtn}</span>
        </button>
      </div>

      {/* Weekly Stats & Auto-validation Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            {lang === 'pt' ? 'Dias Ativos' : 'Días Activos'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif text-zinc-950">{openDaysCount}</span>
            <span className="text-xs text-zinc-500">/ 7 {t.openDaysCount}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            {lang === 'pt' ? 'Carga Horária' : 'Carga Semanal'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-serif text-amber-700">{totalWeeklyHours.toFixed(1)}h</span>
            <span className="text-xs text-zinc-500">{t.hoursPerWeek}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50/70 to-zinc-50 border border-amber-200/80 rounded-xl p-4 shadow-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-950 block">
              {lang === 'pt' ? 'Validação na Reserva' : 'Validado en Reservas'}
            </span>
            <span className="text-zinc-600 text-[11px] leading-tight block mt-0.5">
              {lang === 'pt'
                ? 'Dias fechados bloqueiam o calendário. Horários de intervalo não são ofertados para clientes.'
                : 'Días cerrados bloquean el calendario y pausas de almuerzo no generan turnos.'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Schedule Presets & Interval Selector */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'pt' ? 'Modelos Prontos de Horário (Clique para aplicar)' : 'Plantillas Rápidas'}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyPresetSegSab}
              className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-amber-50 border border-zinc-200 hover:border-amber-400 text-xs text-zinc-800 font-medium transition-colors"
            >
              ⭐ {t.presetSegSab}
            </button>
            <button
              type="button"
              onClick={applyPresetTerSab}
              className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-amber-50 border border-zinc-200 hover:border-amber-400 text-xs text-zinc-800 font-medium transition-colors"
            >
              📅 {t.presetTerSab}
            </button>
            <button
              type="button"
              onClick={applyPresetSegSex}
              className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-amber-50 border border-zinc-200 hover:border-amber-400 text-xs text-zinc-800 font-medium transition-colors"
            >
              💼 {t.presetSegSex}
            </button>
            <button
              type="button"
              onClick={copyMondayToWeekdays}
              className="px-3 py-1.5 rounded-lg bg-amber-100/60 hover:bg-amber-100 border border-amber-300 text-xs text-amber-900 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3 h-3 text-amber-700" />
              <span>{t.applyToWeekdaysBtn}</span>
            </button>
          </div>
        </div>

        {/* Slot Duration preference */}
        <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-zinc-900 block">
              {t.slotDurationLabel}
            </span>
            <span className="text-[11px] text-zinc-500">
              {lang === 'pt'
                ? 'Intervalo padrão de blocos exibidos para o cliente escolher'
                : 'Paso de tiempo mostrado al cliente para elegir'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSlotDuration(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  slotDuration === mins
                    ? 'bg-zinc-950 text-amber-400 border-zinc-950 shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Days of Week List */}
      <div className="space-y-3">
        {daysMeta.map((meta) => {
          const schedule = scheduleList.find((s) => s.dayOfWeek === meta.day) || {
            dayOfWeek: meta.day,
            isOpen: false,
            openTime: '09:00',
            closeTime: '19:00',
            hasBreak: false
          };

          const dailyHours = calculateDailyHours(schedule);

          return (
            <div
              key={meta.day}
              className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                schedule.isOpen
                  ? 'border-zinc-200 hover:border-amber-300'
                  : 'border-zinc-200/60 bg-zinc-50/70 opacity-80'
              }`}
            >
              {/* Day Header Row: Name, Status Badge, Open Toggle */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                      schedule.isOpen
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {meta.short}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-950">
                        {meta.name}
                      </span>
                      {meta.type === 'weekend' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                          {lang === 'pt' ? 'Fim de semana' : 'Fin de semana'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          schedule.isOpen ? 'text-emerald-700' : 'text-zinc-500'
                        }`}
                      >
                        {schedule.isOpen ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t.dayOpenBadge}</span>
                            <span className="text-zinc-400">•</span>
                            <span className="text-zinc-600 font-normal">
                              {dailyHours.toFixed(1)}h {lang === 'pt' ? 'disponíveis' : 'disponibles'}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-400" />
                            <span>{t.dayClosedBadge}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day Open / Close Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleDay(meta.day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                    schedule.isOpen
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${schedule.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <span>{schedule.isOpen ? t.dayOpenBadge : t.dayClosedBadge}</span>
                </button>
              </div>

              {/* Day Time Controls (Visible only if day is Open) */}
              {schedule.isOpen ? (
                <div className="pt-3.5 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Opening Time */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t.openingTimeLabel}</span>
                      </label>
                      <input
                        type="time"
                        value={schedule.openTime || '09:00'}
                        onChange={(e) => handleTimeChange(meta.day, 'openTime', e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Closing Time */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t.closingTimeLabel}</span>
                      </label>
                      <input
                        type="time"
                        value={schedule.closeTime || '19:00'}
                        onChange={(e) => handleTimeChange(meta.day, 'closeTime', e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Lunch Break Section */}
                  <div className="bg-zinc-50/80 border border-zinc-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800">
                        <Coffee className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t.lunchBreakLabel}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleToggleBreak(meta.day)}
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-medium transition-colors border ${
                          schedule.hasBreak
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {schedule.hasBreak
                          ? (lang === 'pt' ? 'Ativado' : 'Activo')
                          : (lang === 'pt' ? '+ Adicionar Pausa' : '+ Agregar Pausa')}
                      </button>
                    </div>

                    {schedule.hasBreak && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">
                            {t.breakStartLabel}
                          </label>
                          <input
                            type="time"
                            value={schedule.breakStart || '12:30'}
                            onChange={(e) => handleBreakTimeChange(meta.day, 'breakStart', e.target.value)}
                            className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-0.5">
                            {t.breakEndLabel}
                          </label>
                          <input
                            type="time"
                            value={schedule.breakEnd || '13:30'}
                            onChange={(e) => handleBreakTimeChange(meta.day, 'breakEnd', e.target.value)}
                            className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-3 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {lang === 'pt'
                        ? 'Clientes não poderão selecionar este dia no portal.'
                        : 'Las clientas no podrán agendar este día en el portal.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDay(meta.day)}
                    className="text-amber-700 hover:underline font-semibold text-xs"
                  >
                    {lang === 'pt' ? 'Abrir atendimento' : 'Abrir este día'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-zinc-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="text-xs text-zinc-600">
          <span className="font-semibold text-zinc-900 block">
            {openDaysCount} {lang === 'pt' ? 'dias com agenda aberta' : 'días con agenda abierta'}
          </span>
          <span className="text-[11px] text-zinc-500">
            {totalWeeklyHours.toFixed(1)} {t.hoursPerWeek}
          </span>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{t.scheduleSaveBtn}</span>
        </button>
      </div>
    </div>
  );
};
