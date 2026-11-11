import React, { useState, useEffect } from 'react';
import { ClientTechnicalNote, ServiceCategory, AppLanguage } from '../types';
import {
  X,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  Eye,
  Heart,
  Check,
  Copy,
  Phone,
  User,
  Tag,
  Palette
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

interface ClientTechnicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientNote?: ClientTechnicalNote | null;
  initialClientName?: string;
  initialClientPhone?: string;
  initialCategory?: ServiceCategory;
  onSave: (note: ClientTechnicalNote) => void;
  lang?: AppLanguage;
}

export const ClientTechnicalNoteModal: React.FC<ClientTechnicalNoteModalProps> = ({
  isOpen,
  onClose,
  clientNote,
  initialClientName = '',
  initialClientPhone = '',
  initialCategory,
  onSave,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  const [activeTab, setActiveTab] = useState<'lashes' | 'makeup' | 'nails' | 'brows' | 'preferences'>('lashes');

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('pestañas');

  // Lashes
  const [lashCurvature, setLashCurvature] = useState('');
  const [lashThickness, setLashThickness] = useState('');
  const [lashLengths, setLashLengths] = useState('');
  const [lashMapping, setLashMapping] = useState('');
  const [lashAdhesive, setLashAdhesive] = useState('');

  // Makeup
  const [makeupFoundationTone, setMakeupFoundationTone] = useState('');
  const [skinType, setSkinType] = useState('');
  const [makeupFinishPreference, setMakeupFinishPreference] = useState('');
  const [makeupLipTone, setMakeupLipTone] = useState('');

  // Nails
  const [nailTechnique, setNailTechnique] = useState('');
  const [nailShape, setNailShape] = useState('');
  const [nailColorFavorite, setNailColorFavorite] = useState('');

  // Brows / Hair
  const [browOrHairPigment, setBrowOrHairPigment] = useState('');

  // Health & Preferences
  const [allergies, setAllergies] = useState('');
  const [personalPreferences, setPersonalPreferences] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (clientNote) {
      setClientName(clientNote.clientName || '');
      setClientPhone(clientNote.clientPhone || '');
      setServiceCategory(clientNote.serviceCategory || initialCategory || 'pestañas');

      setLashCurvature(clientNote.lashCurvature || '');
      setLashThickness(clientNote.lashThickness || '');
      setLashLengths(clientNote.lashLengths || '');
      setLashMapping(clientNote.lashMapping || '');
      setLashAdhesive(clientNote.lashAdhesive || '');

      setMakeupFoundationTone(clientNote.makeupFoundationTone || '');
      setSkinType(clientNote.skinType || '');
      setMakeupFinishPreference(clientNote.makeupFinishPreference || '');
      setMakeupLipTone(clientNote.makeupLipTone || '');

      setNailTechnique(clientNote.nailTechnique || '');
      setNailShape(clientNote.nailShape || '');
      setNailColorFavorite(clientNote.nailColorFavorite || '');

      setBrowOrHairPigment(clientNote.browOrHairPigment || '');
      setAllergies(clientNote.allergies || '');
      setPersonalPreferences(clientNote.personalPreferences || '');
      setGeneralNotes(clientNote.generalNotes || '');
      setTags(clientNote.tags || []);
    } else {
      setClientName(initialClientName || '');
      setClientPhone(initialClientPhone || '');
      setServiceCategory(initialCategory || 'pestañas');

      setLashCurvature('');
      setLashThickness('');
      setLashLengths('');
      setLashMapping('');
      setLashAdhesive('');

      setMakeupFoundationTone('');
      setSkinType('');
      setMakeupFinishPreference('');
      setMakeupLipTone('');

      setNailTechnique('');
      setNailShape('');
      setNailColorFavorite('');

      setBrowOrHairPigment('');
      setAllergies('');
      setPersonalPreferences('');
      setGeneralNotes('');
      setTags([]);
    }

    // Auto-select tab depending on category
    if (initialCategory === 'maquillaje') setActiveTab('makeup');
    else if (initialCategory === 'uñas') setActiveTab('nails');
    else if (initialCategory === 'cejas') setActiveTab('brows');
    else setActiveTab('lashes');
  }, [clientNote, initialClientName, initialClientPhone, initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleApplyQuickPreset = (presetType: 'lashes_cat' | 'lashes_doll' | 'makeup_nude' | 'nails_almond') => {
    if (presetType === 'lashes_cat') {
      setLashCurvature('Curva D');
      setLashThickness('0.07 mm');
      setLashLengths('9mm - 13mm');
      setLashMapping('Cat Eye / Fox Eyes (efecto delineado en puntas)');
      setLashAdhesive('Cola rápida 1s baja emisión');
      if (!tags.includes('Cat Eye')) setTags([...tags, 'Cat Eye', 'Curva D']);
    } else if (presetType === 'lashes_doll') {
      setLashCurvature('Curva C / CC');
      setLashThickness('0.07 mm');
      setLashLengths('8mm - 12mm');
      setLashMapping('Efecto Muñeca (Doll Eye, centro más alto)');
      setLashAdhesive('Cola hipoalergénica');
      if (!tags.includes('Doll Eye')) setTags([...tags, 'Doll Eye', 'Curva C']);
    } else if (presetType === 'makeup_nude') {
      setMakeupFoundationTone('MAC NC25 (Subtono Cálido)');
      setSkinType('Mixta a grasa');
      setMakeupFinishPreference('Mate aterciopelado con puntos de luz');
      setMakeupLipTone('Nude rosado satinado');
      if (!tags.includes('NC25')) setTags([...tags, 'NC25', 'Piel Mixta']);
    } else if (presetType === 'nails_almond') {
      setNailTechnique('Soft Gel / Tips completos');
      setNailShape('Almendra moderna');
      setNailColorFavorite('Vía Láctea con efecto Glazed Donut');
      if (!tags.includes('Soft Gel')) setTags([...tags, 'Soft Gel', 'Almendra']);
    }
  };

  const handleCopySummary = () => {
    const lines = [
      `📋 *FICHA TÉCNICA - ${clientName || 'CLIENTA'}*`,
      clientPhone ? `📱 WhatsApp: ${clientPhone}` : '',
      lashCurvature || lashMapping ? `👁️ *Pestañas:* ${[lashCurvature, lashThickness, lashLengths, lashMapping].filter(Boolean).join(' • ')}` : '',
      makeupFoundationTone ? `💄 *Maquillaje:* ${[makeupFoundationTone, skinType, makeupFinishPreference].filter(Boolean).join(' • ')}` : '',
      nailTechnique ? `💅 *Uñas:* ${[nailTechnique, nailShape, nailColorFavorite].filter(Boolean).join(' • ')}` : '',
      browOrHairPigment ? `✨ *Cejas/Cabello:* ${browOrHairPigment}` : '',
      allergies ? `⚠️ *ALERGIAS:* ${allergies}` : '',
      personalPreferences ? `☕ *Preferencias:* ${personalPreferences}` : '',
      generalNotes ? `📝 *Notas:* ${generalNotes}` : '',
      tags.length > 0 ? `🏷️ *Tags:* #${tags.join(' #')}` : ''
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const noteToSave: ClientTechnicalNote = {
      id: clientNote?.id || `note-${Date.now()}`,
      clientPhone: clientPhone.trim(),
      clientName: clientName.trim(),
      serviceCategory,
      lashCurvature: lashCurvature.trim() || undefined,
      lashThickness: lashThickness.trim() || undefined,
      lashLengths: lashLengths.trim() || undefined,
      lashMapping: lashMapping.trim() || undefined,
      lashAdhesive: lashAdhesive.trim() || undefined,
      makeupFoundationTone: makeupFoundationTone.trim() || undefined,
      skinType: skinType.trim() || undefined,
      makeupFinishPreference: makeupFinishPreference.trim() || undefined,
      makeupLipTone: makeupLipTone.trim() || undefined,
      nailTechnique: nailTechnique.trim() || undefined,
      nailShape: nailShape.trim() || undefined,
      nailColorFavorite: nailColorFavorite.trim() || undefined,
      browOrHairPigment: browOrHairPigment.trim() || undefined,
      allergies: allergies.trim() || undefined,
      personalPreferences: personalPreferences.trim() || undefined,
      generalNotes: generalNotes.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: tags.length > 0 ? tags : undefined
    };

    onSave(noteToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-amber-300/60 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-950 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 shrink-0">
              <ClipboardList className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-1.5">
                  {t.technicalSheetBtn}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {clientName ? clientName : 'Nueva Clienta'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 truncate max-w-[280px] sm:max-w-md">
                {lang === 'pt'
                  ? 'Ficha técnica confidencial, mapeamento e histórico'
                  : 'Historial técnico de aplicación, tonos y preferencias'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {clientName && (
              <button
                type="button"
                onClick={handleCopySummary}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors"
                title={t.copySummaryBtn}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Client Identity Fields */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.clientNameLabel} *</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Larissa Mendonça"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.clientPhoneLabel}</span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+55 11 99999-8888"
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Quick Category Templates / Presets Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Plantillas rápidas:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyQuickPreset('lashes_cat')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-[11px] font-medium transition-colors"
              >
                + Cat Eye D 9-13mm
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickPreset('lashes_doll')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-[11px] font-medium transition-colors"
              >
                + Doll Eye C
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickPreset('makeup_nude')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 text-[11px] font-medium transition-colors"
              >
                + Makeup NC25
              </button>
              <button
                type="button"
                onClick={() => handleApplyQuickPreset('nails_almond')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 text-[11px] font-medium transition-colors"
              >
                + Soft Gel Almendra
              </button>
            </div>
          </div>

          {/* Specialty Tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'lashes', label: t.lashTabLabel, icon: Eye, color: 'text-amber-600' },
              { id: 'makeup', label: t.makeupTabLabel, icon: Palette, color: 'text-rose-600' },
              { id: 'nails', label: t.nailTabLabel, icon: Sparkles, color: 'text-purple-600' },
              { id: 'brows', label: t.browsTabLabel, icon: Tag, color: 'text-indigo-600' },
              { id: 'preferences', label: t.preferencesTabLabel, icon: Heart, color: 'text-red-500' }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-amber-300 shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Lashes / Pestañas */}
          {activeTab === 'lashes' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.lashCurvatureLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['Curva C', 'Curva CC', 'Curva D', 'Curva L', 'Curva M'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setLashCurvature(c)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          lashCurvature === c
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={lashCurvature}
                    onChange={(e) => setLashCurvature(e.target.value)}
                    placeholder="Ej: Curva D + C en lagrimal"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.lashThicknessLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['0.05 mm', '0.07 mm', '0.15 mm', '0.20 mm', 'Fios Y'].map((th) => (
                      <button
                        type="button"
                        key={th}
                        onClick={() => setLashThickness(th)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          lashThickness === th
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={lashThickness}
                    onChange={(e) => setLashThickness(e.target.value)}
                    placeholder="Ej: 0.07 mm / Fios Tecnológicos Y"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.lashLengthsLabel}
                  </label>
                  <input
                    type="text"
                    value={lashLengths}
                    onChange={(e) => setLashLengths(e.target.value)}
                    placeholder="Ej: 8mm, 9mm, 10mm, 11mm, 12mm, 13mm"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.lashMappingLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['Cat Eye / Fox', 'Doll Eye / Boneca', 'Ardilla / Squirrel', 'Natural'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setLashMapping(m)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          lashMapping === m
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={lashMapping}
                    onChange={(e) => setLashMapping(e.target.value)}
                    placeholder="Ej: Cat Eye con final alargado en 13mm"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.lashAdhesiveLabel}
                </label>
                <input
                  type="text"
                  value={lashAdhesive}
                  onChange={(e) => setLashAdhesive(e.target.value)}
                  placeholder="Ej: Cola de secado rápido 1s, transparente, fórmula sin formaldehído"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Makeup / Maquillaje */}
          {activeTab === 'makeup' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.makeupToneLabel}
                  </label>
                  <input
                    type="text"
                    value={makeupFoundationTone}
                    onChange={(e) => setMakeupFoundationTone(e.target.value)}
                    placeholder="Ej: MAC NC25, Fenty 210, Subtono Cálido / Dorado"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.skinTypeLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['Mixta', 'Seca', 'Grasa', 'Sensible', 'Normal'].map((sk) => (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => setSkinType(sk)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          skinType === sk
                            ? 'bg-rose-100 border-rose-400 text-rose-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    placeholder="Ej: Zona T con tendencia a brillo, mejillas secas"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.makeupFinishLabel}
                  </label>
                  <input
                    type="text"
                    value={makeupFinishPreference}
                    onChange={(e) => setMakeupFinishPreference(e.target.value)}
                    placeholder="Ej: Mate luminoso, Cobertura media, Glow hidratado"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.makeupLipLabel}
                  </label>
                  <input
                    type="text"
                    value={makeupLipTone}
                    onChange={(e) => setMakeupLipTone(e.target.value)}
                    placeholder="Ej: Nude melocotón, Rojo cereza mate, Gloss ácido hialurónico"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Nails / Uñas */}
          {activeTab === 'nails' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.nailTechLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['Fibra de Vidrio', 'Soft Gel', 'Gel Moldado', 'Blindaje', 'Semipermanente'].map((tech) => (
                      <button
                        type="button"
                        key={tech}
                        onClick={() => setNailTechnique(tech)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          nailTechnique === tech
                            ? 'bg-purple-100 border-purple-400 text-purple-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={nailTechnique}
                    onChange={(e) => setNailTechnique(e.target.value)}
                    placeholder="Ej: Extensión en Fibra de Vidrio con Gel Builder"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.nailShapeLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {['Almendra', 'Cuadrada', 'Coffin', 'Oval', 'Stiletto'].map((sh) => (
                      <button
                        type="button"
                        key={sh}
                        onClick={() => setNailShape(sh)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                          nailShape === sh
                            ? 'bg-purple-100 border-purple-400 text-purple-900'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={nailShape}
                    onChange={(e) => setNailShape(e.target.value)}
                    placeholder="Ej: Almendra corta / Cuadrada con esquinas redondeadas"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.nailColorLabel}
                </label>
                <input
                  type="text"
                  value={nailColorFavorite}
                  onChange={(e) => setNailColorFavorite(e.target.value)}
                  placeholder="Ej: Esmalte Vía Láctea + Glazed Chrome / Francesita blanca fina"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Brows & Hair */}
          {activeTab === 'brows' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.browPigmentLabel}
                </label>
                <textarea
                  rows={2}
                  value={browOrHairPigment}
                  onChange={(e) => setBrowOrHairPigment(e.target.value)}
                  placeholder="Ej: Refectocil 3.1 Castaño Claro + 1 gota Grafito. Tiempo de pose: 7 min. Para cabello: Mezcla 7.1 + 8.13 a 20 vol."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Health & Client Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-fade-in">
              {/* Allergies - Highlighted Alert Style */}
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-3.5">
                <label className="block text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{t.allergiesLabel}</span>
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Ej: Alérgica a cinta micropore adhesiva (usar cinta de silicona). Sensibilidad leve a olores acrílicos."
                  className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.personalPreferencesLabel}</span>
                </label>
                <textarea
                  rows={2}
                  value={personalPreferences}
                  onChange={(e) => setPersonalPreferences(e.target.value)}
                  placeholder="Ej: Prefiere música relajante/lo-fi en volumen bajo. Prefiere no conversar durante la aplicación. Le gusta café con leche caliente."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* General Notes & Evolution */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.generalNotesLabel}
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Registro de evolución, retención de las pestañas en última sesión, comentarios técnicos..."
              className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-zinc-500" />
              <span>Etiquetas Rápidas</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Escribe una etiqueta y presiona Enter..."
                className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold"
              >
                + Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-amber-700 hover:text-amber-950 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-medium"
            >
              {t.close}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-500 hover:to-yellow-600 transition-all active:scale-95"
            >
              {t.saveNoteBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
