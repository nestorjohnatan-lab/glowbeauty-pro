import React, { useState, useMemo } from 'react';
import { ClientTechnicalNote, AppLanguage, BeautyProProfile } from '../types';
import {
  ClipboardList,
  Search,
  Plus,
  Eye,
  Palette,
  Sparkles,
  AlertTriangle,
  Heart,
  Copy,
  Check,
  Phone,
  Calendar,
  Tag,
  Clock,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';
import { cleanPhoneNumber } from '../utils/whatsapp';

interface ClientTechnicalNotesSectionProps {
  notesMap: Record<string, ClientTechnicalNote>;
  profile: BeautyProProfile;
  onOpenNoteModal: (note?: ClientTechnicalNote, clientName?: string, clientPhone?: string) => void;
  onFilterAgendaByClient?: (clientPhone: string) => void;
  lang?: AppLanguage;
}

export const ClientTechnicalNotesSection: React.FC<ClientTechnicalNotesSectionProps> = ({
  notesMap,
  profile,
  onOpenNoteModal,
  onFilterAgendaByClient,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lashes' | 'makeup' | 'nails' | 'allergies'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const notesList = useMemo(() => {
    return Object.values(notesMap);
  }, [notesMap]);

  // Statistics
  const stats = useMemo(() => {
    const total = notesList.length;
    const withAllergies = notesList.filter((n) => Boolean(n.allergies?.trim())).length;
    const withLashes = notesList.filter((n) => Boolean(n.lashCurvature || n.lashMapping)).length;
    const withMakeup = notesList.filter((n) => Boolean(n.makeupFoundationTone)).length;
    const withNails = notesList.filter((n) => Boolean(n.nailTechnique)).length;

    return { total, withAllergies, withLashes, withMakeup, withNails };
  }, [notesList]);

  // Filtered List
  const filteredNotes = useMemo(() => {
    return notesList.filter((note) => {
      // Category filter
      if (selectedFilter === 'lashes' && !note.lashCurvature && !note.lashMapping) return false;
      if (selectedFilter === 'makeup' && !note.makeupFoundationTone && !note.skinType) return false;
      if (selectedFilter === 'nails' && !note.nailTechnique && !note.nailShape) return false;
      if (selectedFilter === 'allergies' && !note.allergies) return false;

      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = note.clientName.toLowerCase().includes(query);
        const matchPhone = note.clientPhone.includes(query);
        const matchLash = (note.lashCurvature + ' ' + note.lashMapping + ' ' + note.lashLengths).toLowerCase().includes(query);
        const matchMakeup = (note.makeupFoundationTone + ' ' + note.skinType).toLowerCase().includes(query);
        const matchNail = (note.nailTechnique + ' ' + note.nailColorFavorite).toLowerCase().includes(query);
        const matchAllergy = (note.allergies || '').toLowerCase().includes(query);
        const matchPref = (note.personalPreferences || '').toLowerCase().includes(query);
        const matchNotes = (note.generalNotes || '').toLowerCase().includes(query);
        const matchTags = (note.tags || []).some((tag) => tag.toLowerCase().includes(query));

        if (!matchName && !matchPhone && !matchLash && !matchMakeup && !matchNail && !matchAllergy && !matchPref && !matchNotes && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
  }, [notesList, selectedFilter, searchTerm]);

  const handleCopySummary = (note: ClientTechnicalNote) => {
    const lines = [
      `📋 *FICHA TÉCNICA - ${note.clientName.toUpperCase()}*`,
      note.clientPhone ? `📱 WhatsApp: ${note.clientPhone}` : '',
      note.lashCurvature || note.lashMapping ? `👁️ *Pestañas:* ${[note.lashCurvature, note.lashThickness, note.lashLengths, note.lashMapping].filter(Boolean).join(' • ')}` : '',
      note.makeupFoundationTone ? `💄 *Maquillaje:* ${[note.makeupFoundationTone, note.skinType, note.makeupFinishPreference].filter(Boolean).join(' • ')}` : '',
      note.nailTechnique ? `💅 *Uñas:* ${[note.nailTechnique, note.nailShape, note.nailColorFavorite].filter(Boolean).join(' • ')}` : '',
      note.browOrHairPigment ? `✨ *Cejas/Cabello:* ${note.browOrHairPigment}` : '',
      note.allergies ? `⚠️ *ALERGIA/SENSIBILIDAD:* ${note.allergies}` : '',
      note.personalPreferences ? `☕ *Preferencias:* ${note.personalPreferences}` : '',
      note.generalNotes ? `📝 *Historial:* ${note.generalNotes}` : '',
      note.lastUpdated ? `🕒 *Actualizado:* ${note.lastUpdated}` : ''
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.total} {lang === 'pt' ? 'fichas registradas' : 'fichas técnicas'}</span>
            </span>
            {stats.withAllergies > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/70 text-red-300 border border-red-500/40 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>{stats.withAllergies} {lang === 'pt' ? 'com alertas de alergia' : 'con advertencias'}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {t.clientNotesSectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
            {t.clientNotesSectionSub}
          </p>
        </div>

        <button
          onClick={() => onOpenNoteModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.btnNewClientNote}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: t.filterCategoryAll, count: stats.total },
            { id: 'lashes', label: '👁️ ' + (lang === 'pt' ? 'Cílios' : 'Pestañas'), count: stats.withLashes },
            { id: 'makeup', label: '💄 ' + (lang === 'pt' ? 'Maquiagem' : 'Maquillaje'), count: stats.withMakeup },
            { id: 'nails', label: '💅 ' + (lang === 'pt' ? 'Unhas' : 'Uñas'), count: stats.withNails },
            { id: 'allergies', label: '⚠️ ' + (lang === 'pt' ? 'Alergias' : 'Alergias'), count: stats.withAllergies }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedFilter === item.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedFilter === item.id ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchClientNotesPlaceholder}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Grid of Client Cards */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 space-y-3 shadow-xs">
          <ClipboardList className="w-12 h-12 mx-auto text-zinc-300 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-zinc-800">{t.noNotesFound}</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {lang === 'pt'
              ? 'Registre a primeira ficha técnica com mapeamento de cílios, tons de maquiagem ou formatos de unhas para ter acesso rápido durante os atendimentos.'
              : 'Registra la primera ficha técnica con mapeo de pestañas, tonos de maquillaje o formatos de uñas para tener acceso rápido durante las citas.'}
          </p>
          <button
            onClick={() => onOpenNoteModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t.btnNewClientNote}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const cleanPhone = cleanPhoneNumber(note.clientPhone);
            const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : undefined;
            const hasAllergies = Boolean(note.allergies?.trim());

            return (
              <div
                key={note.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                  hasAllergies
                    ? 'border-red-200 ring-1 ring-red-400/20'
                    : 'border-zinc-200 hover:border-amber-300'
                }`}
              >
                {/* Top: Avatar, Name, Phone & Allergy Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400/80 flex items-center justify-center text-amber-950 font-bold text-base shadow-xs shrink-0">
                        {note.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-950 truncate">
                            {note.clientName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            Ficha Técnica
                          </span>
                        </div>
                        {note.clientPhone ? (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{note.clientPhone}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">Sin teléfono registrado</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopySummary(note)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                        title={t.copySummaryBtn}
                      >
                        {copiedId === note.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Allergy Alert if present */}
                  {hasAllergies && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-red-900">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-bold block text-[11px] uppercase tracking-wide text-red-700">
                          {t.allergiesAlertBadge}
                        </span>
                        <p className="font-medium text-xs text-red-950 mt-0.5">{note.allergies}</p>
                      </div>
                    </div>
                  )}

                  {/* Technical Specs Cards */}
                  <div className="space-y-2 text-xs">
                    {/* Eyelashes Specs */}
                    {(note.lashCurvature || note.lashMapping || note.lashLengths) && (
                      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          <span>{lang === 'pt' ? 'Cílios / Lashes' : 'Pestañas'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-zinc-800 text-xs">
                          {note.lashCurvature && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-semibold text-amber-950">
                              {note.lashCurvature}
                            </span>
                          )}
                          {note.lashThickness && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-medium text-zinc-700">
                              {note.lashThickness}
                            </span>
                          )}
                          {note.lashLengths && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 font-medium text-zinc-700">
                              {note.lashLengths}
                            </span>
                          )}
                          {note.lashMapping && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                              {note.lashMapping}
                            </span>
                          )}
                        </div>
                        {note.lashAdhesive && (
                          <p className="text-[11px] text-zinc-500 pt-0.5">
                            <span className="font-semibold text-zinc-700">Adhesivo:</span> {note.lashAdhesive}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Makeup Specs */}
                    {(note.makeupFoundationTone || note.skinType || note.makeupLipTone) && (
                      <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 text-[11px]">
                          <Palette className="w-3.5 h-3.5 text-rose-600" />
                          <span>{lang === 'pt' ? 'Maquiagem & Pele' : 'Maquillaje & Rostro'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {note.makeupFoundationTone && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 font-bold text-rose-950">
                              💄 {note.makeupFoundationTone}
                            </span>
                          )}
                          {note.skinType && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 font-medium text-zinc-700">
                              Piel: {note.skinType}
                            </span>
                          )}
                          {note.makeupFinishPreference && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-medium">
                              {note.makeupFinishPreference}
                            </span>
                          )}
                        </div>
                        {note.makeupLipTone && (
                          <p className="text-[11px] text-zinc-600 pt-0.5">
                            <span className="font-semibold text-rose-900">Labial:</span> {note.makeupLipTone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Nails Specs */}
                    {(note.nailTechnique || note.nailShape || note.nailColorFavorite) && (
                      <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-purple-900 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{lang === 'pt' ? 'Unhas & Manicure' : 'Uñas & Manicura'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {note.nailTechnique && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-purple-200 font-bold text-purple-950">
                              {note.nailTechnique}
                            </span>
                          )}
                          {note.nailShape && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-purple-200 font-medium text-zinc-700">
                              {note.nailShape}
                            </span>
                          )}
                          {note.nailColorFavorite && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-medium">
                              Color: {note.nailColorFavorite}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Brow / Hair */}
                    {note.browOrHairPigment && (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs">
                        <span className="font-bold text-zinc-800 text-[11px] block mb-0.5">
                          ✨ Cejas / Cabello / Fórmulas:
                        </span>
                        <p className="text-zinc-700 font-medium">{note.browOrHairPigment}</p>
                      </div>
                    )}

                    {/* Client Preferences */}
                    {note.personalPreferences && (
                      <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-2.5 text-xs flex items-start gap-2">
                        <Heart className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-950 text-[11px] block">
                            Preferencias de atención:
                          </span>
                          <p className="text-zinc-700 font-medium">{note.personalPreferences}</p>
                        </div>
                      </div>
                    )}

                    {/* General evolution notes */}
                    {note.generalNotes && (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs">
                        <span className="font-semibold text-zinc-600 text-[11px] block mb-0.5">
                          Historial & Notas libres:
                        </span>
                        <p className="text-zinc-800 italic">{note.generalNotes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{note.lastUpdated ? `${t.lastUpdateLabel}: ${note.lastUpdated}` : ''}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onFilterAgendaByClient && (
                      <button
                        onClick={() => onFilterAgendaByClient(note.clientPhone || note.clientName)}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={t.viewClientAppointmentsBtn}
                      >
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="hidden sm:inline">Citas</span>
                      </button>
                    )}

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors"
                        title="WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => onOpenNoteModal(note)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold text-xs shadow-xs hover:from-amber-500 hover:to-yellow-600 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>{t.btnEditClientNote}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
