import React, { useState } from 'react';
import { BeautyService, BeautyProProfile, ServiceCategory, AppLanguage } from '../types';
import {
  Plus,
  Clock,
  RotateCw,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  Camera
} from 'lucide-react';
import { TRANSLATIONS, formatPrice, getCategoryLabel } from '../utils/i18n';

interface ServiceCatalogManagerProps {
  services: BeautyService[];
  profile: BeautyProProfile;
  onCreateService: (service: Partial<BeautyService>) => void;
  onUpdateService: (id: string, updates: Partial<BeautyService>) => void;
  onDeleteService: (id: string) => void;
  lang?: AppLanguage;
}

const CATEGORIES: { id: ServiceCategory; icon: string }[] = [
  { id: 'pestañas', icon: '✨' },
  { id: 'cejas', icon: '👁️' },
  { id: 'uñas', icon: '💅' },
  { id: 'facial', icon: '💆‍♀️' },
  { id: 'maquillaje', icon: '💄' },
  { id: 'cabello', icon: '✂️' },
  { id: 'depilacion', icon: '🌿' },
  { id: 'labios', icon: '💋' }
];

// Curated high quality presets for beauty salons & specialists
export const PRESET_SERVICE_PHOTOS = [
  {
    label: 'Extensão de Cílios Volume',
    category: 'pestañas',
    url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Cílios Clássico Fio a Fio',
    category: 'pestañas',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Design & Brow Lamination',
    category: 'cejas',
    url: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Micropigmentação Labial',
    category: 'labios',
    url: 'https://images.unsplash.com/photo-1588510841447-497b7b25ea0a?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Unhas em Gel / Nail Art',
    category: 'uñas',
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Alongamento Fibra de Vidro',
    category: 'uñas',
    url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Limpeza de Pele Profunda',
    category: 'facial',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Penteado & Penteados Noiva',
    category: 'cabello',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80'
  }
];

export const ServiceCatalogManager: React.FC<ServiceCatalogManagerProps> = ({
  services,
  profile,
  onCreateService,
  onUpdateService,
  onDeleteService,
  lang = 'pt'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<ServiceCategory | 'todos'>('todos');

  // Quick photo switcher drawer on a specific service card
  const [quickPhotoServiceId, setQuickPhotoServiceId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('pestañas');
  const [price, setPrice] = useState('150');
  const [durationMinutes, setDurationMinutes] = useState('90');
  const [suggestedMaintenanceDays, setSuggestedMaintenanceDays] = useState('21');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [prepInstructions, setPrepInstructions] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [popular, setPopular] = useState(false);

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('pestañas');
    setPrice('140');
    setDurationMinutes('60');
    setSuggestedMaintenanceDays('21');
    setImageUrl('https://images.unsplash.com/photo-1583001809873-a128495da465?w=600&auto=format&fit=crop&q=80');
    setDescription('');
    setPrepInstructions('');
    setCareInstructions('');
    setPopular(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: BeautyService) => {
    setEditingServiceId(srv.id);
    setName(srv.name);
    setCategory(srv.category);
    setPrice(String(srv.price));
    setDurationMinutes(String(srv.durationMinutes));
    setSuggestedMaintenanceDays(String(srv.suggestedMaintenanceDays || 21));
    setImageUrl(srv.imageUrl || '');
    setDescription(srv.description || '');
    setPrepInstructions(srv.prepInstructions || '');
    setCareInstructions(srv.careInstructions || '');
    setPopular(Boolean(srv.popular));
    setIsModalOpen(true);
  };

  // Immediate photo switch directly from the card
  const handleQuickChangePhoto = (serviceId: string, photoUrl: string) => {
    onUpdateService(serviceId, { imageUrl: photoUrl });
    setQuickPhotoServiceId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<BeautyService> = {
      name: name.trim(),
      category,
      price: Number(price) || 120,
      durationMinutes: Number(durationMinutes) || 60,
      suggestedMaintenanceDays: Number(suggestedMaintenanceDays) || 21,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim(),
      prepInstructions: prepInstructions.trim(),
      careInstructions: careInstructions.trim(),
      popular,
      isActive: true
    };

    if (editingServiceId) {
      onUpdateService(editingServiceId, payload);
    } else {
      onCreateService(payload);
    }

    setIsModalOpen(false);
  };

  const filteredServices = services.filter((srv) => {
    if (selectedFilterCategory === 'todos') return true;
    return srv.category === selectedFilterCategory;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner - Luxurious Gold, Black & Light Gray */}
      <div className="bg-gradient-to-r from-white via-zinc-50 to-amber-50/50 border border-[#72202E]/30/70 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#72202E]/10 text-[#72202E] border border-[#72202E]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Catálogo & Fotos em Alta Definição' : 'Fotos HD'}</span>
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {services.length} {lang === 'pt' ? 'procedimentos ativos' : 'servicios activos'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">
            {t.servicesManagerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {t.servicesManagerSub}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.addServiceBtn}</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedFilterCategory('todos')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedFilterCategory === 'todos'
              ? 'bg-[#72202E] text-white font-bold shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
          }`}
        >
          {getCategoryLabel('todos', lang)} ({services.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = services.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedFilterCategory === cat.id
                  ? 'bg-[#72202E] text-white font-bold shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{getCategoryLabel(cat.id, lang)}</span>
              <span className="opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid with Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`group bg-white border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:border-[#72202E]/40 shadow-xs hover:shadow-md ${
              service.isActive ? 'border-zinc-200' : 'border-zinc-200 opacity-60'
            }`}
          >
            <div>
              {/* Photo Banner with Badges */}
              <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                {service.imageUrl ? (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50 text-[#C4A480]" />
                    <span className="text-xs">{lang === 'pt' ? 'Sem foto cadastrada' : 'Sin foto'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Quick Photo Switcher Button on Card */}
                <button
                  type="button"
                  onClick={() => setQuickPhotoServiceId(quickPhotoServiceId === service.id ? null : service.id)}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/95 hover:bg-white text-zinc-900 border border-zinc-200 backdrop-blur-md shadow-sm transition-transform active:scale-95 flex items-center gap-1 text-[11px] font-medium"
                  title="Trocar foto rapidamente"
                >
                  <Camera className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Trocar Foto' : 'Foto'}</span>
                </button>

                {/* Price Tag in Brazilian Reais with Gold styling */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#72202E]/30 text-[#72202E] font-bold text-sm shadow-sm">
                  {formatPrice(service.price, profile.currency, lang)}
                </div>

                {/* Duration & Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/70 backdrop-blur-md text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {service.durationMinutes} min
                  </span>
                  {service.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#72202E] text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {lang === 'pt' ? 'Mais Pedido' : 'Popular'}
                    </span>
                  )}
                </div>

                {/* Maintenance cycle pill */}
                {service.suggestedMaintenanceDays && (
                  <div className="absolute top-3 right-3 bg-white/90 border border-[#72202E]/30 backdrop-blur-md text-[#72202E] px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <RotateCw className="w-2.5 h-2.5 text-[#72202E]" />
                    {service.suggestedMaintenanceDays} {lang === 'pt' ? 'dias retorno' : 'días'}
                  </div>
                )}
              </div>

              {/* Quick Photo Presets Drawer on Card */}
              {quickPhotoServiceId === service.id && (
                <div className="bg-zinc-50 p-3 border-b border-zinc-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#72202E]" />
                      {lang === 'pt' ? 'Clique para trocar e salvar a foto:' : 'Elige una foto:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickPhotoServiceId(null)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PRESET_SERVICE_PHOTOS.slice(0, 5).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickChangePhoto(service.id, preset.url)}
                        className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                          service.imageUrl === preset.url
                            ? 'border-amber-500 ring-2 ring-amber-400'
                            : 'border-zinc-200 opacity-80 hover:opacity-100 hover:border-[#72202E]/40'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Info Content */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base text-zinc-950 group-hover:text-[#72202E] transition-colors line-clamp-1">
                    {service.name}
                  </h3>
                  <span className="text-[11px] text-zinc-600 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded shrink-0 border border-zinc-200 font-medium">
                    {getCategoryLabel(service.category, lang)}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {service.description || (lang === 'pt' ? 'Procedimento personalizado de beleza.' : 'Servicio personalizado.')}
                </p>

                {/* Instructions snippet */}
                {service.maintenanceNote && (
                  <div className="bg-[#F4EFEB] border border-[#EAE3D9] rounded-lg p-2 text-[11px] text-[#72202E] flex items-start gap-1.5">
                    <RotateCw className="w-3 h-3 mt-0.5 shrink-0 text-[#72202E]" />
                    <span className="line-clamp-2">{service.maintenanceNote}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onUpdateService(service.id, { isActive: !service.isActive })}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  service.isActive
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    : 'text-[#72202E] bg-[#F4EFEB] border border-[#72202E]/30'
                }`}
                title={service.isActive ? 'Pausar serviço' : 'Ativar serviço'}
              >
                {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-[11px]">
                  {service.isActive ? (lang === 'pt' ? 'Ativo' : 'Activo') : (lang === 'pt' ? 'Pausado' : 'Pausado')}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(service)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-zinc-200 hover:border-[#72202E]/40"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{t.editServiceBtn}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(lang === 'pt' ? 'Deseja excluir este procedimento?' : '¿Eliminar este servicio?')) {
                      onDeleteService(service.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add or Edit Service with Full Photo Customizer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#72202E]/10 border border-[#72202E]/30 flex items-center justify-center text-[#72202E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-zinc-950">
                  {editingServiceId ? t.editServiceBtn : t.addServiceBtn}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Photo Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#72202E]">
                  📸 {t.photoUpload}
                </label>

                {/* Photo Preview */}
                <div className="relative h-40 w-full rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1 rounded-full bg-zinc-950/70 text-white hover:bg-red-600 transition-colors"
                        title="Remover foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4 text-zinc-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50 text-[#72202E]" />
                      <span className="text-xs block">
                        {lang === 'pt' ? 'Nenhuma foto selecionada' : 'Sin foto seleccionada'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload or Link input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-600 font-medium flex items-center gap-1 mb-1">
                      <LinkIcon className="w-3 h-3 text-[#72202E]" />
                      {lang === 'pt' ? 'Link da Imagem (URL):' : 'URL de imagen:'}
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-600 font-medium flex items-center gap-1 mb-1">
                      <Upload className="w-3 h-3 text-[#72202E]" />
                      {lang === 'pt' ? 'Ou envie do seu celular/PC:' : 'O subir foto:'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-200 file:text-zinc-900 hover:file:bg-zinc-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preset Suggestions */}
                <div className="pt-1">
                  <span className="text-[11px] text-zinc-600 block mb-1.5 font-medium">
                    ✨ {t.presetPhotos}
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PRESET_SERVICE_PHOTOS.slice(0, 5).map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImageUrl(preset.url)}
                        className={`group relative rounded-lg overflow-hidden border aspect-square ${
                          imageUrl === preset.url
                            ? 'border-amber-500 ring-2 ring-amber-400'
                            : 'border-zinc-200 opacity-80 hover:opacity-100 hover:border-[#72202E]/40'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/75 text-[8px] text-white p-0.5 truncate text-center">
                          {preset.label.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.serviceName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'pt' ? 'Ex: Volume Brasileiro Efeito Boneca' : 'Ej: Volumen Ruso'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.serviceCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {getCategoryLabel(cat.id, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.servicePriceInput} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-[#72202E] font-bold">
                      {profile.currency === 'BRL' ? 'R$' : '$'}
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="150"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.serviceDurationInput}
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-[#72202E]" />
                    <span>{t.maintenanceCycleDays}</span>
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="90"
                    value={suggestedMaintenanceDays}
                    onChange={(e) => setSuggestedMaintenanceDays(e.target.value)}
                    placeholder="21"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {lang === 'pt' ? 'Gera lembrete de retorno automático no WhatsApp' : 'Dispara alerta de retoque'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.serviceDescription}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'pt' ? 'Descreva os benefícios, técnica utilizada e resultado final...' : 'Descripción del servicio...'}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              {/* Popular Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-zinc-300 text-[#C4A480] focus:ring-amber-400"
                />
                <span className="text-xs text-zinc-800 font-medium">
                  🌟 {lang === 'pt' ? 'Destacar como "Mais Pedido" no catálogo' : 'Destacar como popular'}
                </span>
              </label>

              {/* Pre & Post Care Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    {t.prepTips}
                  </label>
                  <textarea
                    rows={2}
                    value={prepInstructions}
                    onChange={(e) => setPrepInstructions(e.target.value)}
                    placeholder={lang === 'pt' ? 'Ex: Chegar sem rímel ou óleos...' : 'Recomendaciones previas...'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    {t.aftercareTips}
                  </label>
                  <textarea
                    rows={2}
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    placeholder={lang === 'pt' ? 'Ex: Não molhar em 24h, pentear diariamente...' : 'Cuidados posteriores...'}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 text-xs font-medium"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  {t.saveService}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
