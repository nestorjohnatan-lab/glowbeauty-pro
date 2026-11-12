import React, { useState, useEffect, useMemo } from 'react';
import {
  BeautyProProfile,
  CurrencyCode,
  SalonPhoto,
  ProfileHighlight,
  AppLanguage,
  DaySchedule,
  BankPaymentDetails,
  PixKeyType,
  BankAccountType,
  PaymentPreferenceMethod
} from '../types';
import {
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Save,
  Instagram,
  Camera,
  Layers,
  MapPin,
  Clock,
  Phone,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Upload,
  Eye,
  CalendarCheck,
  BookOpen,
  ArrowRight,
  Building,
  CheckCircle,
  ShieldCheck,
  Wallet,
  AlertCircle,
  Link2,
  RefreshCw,
  MessageSquare,
  Wand2,
  Store
} from 'lucide-react';
import { TRANSLATIONS, formatPrice } from '../utils/i18n';
import { buildWhatsAppUrl, cleanPhoneNumber, formatBankPaymentDetails } from '../utils/whatsapp';
import { WeeklyScheduleManager } from './WeeklyScheduleManager';
import { HighlightEditor } from './HighlightEditor';
import { fileToOptimizedDataUrl } from '../utils/imageUtils';

/**
 * Normalizes and converts a salon or business name into a clean, URL-safe slug
 * e.g. "Salón de Belleza Bella Donna" -> "salon-de-belleza-bella-donna"
 */
export function generateSlugFromSalonName(salonName: string): string {
  if (!salonName) return 'studio';
  return salonName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')     // replace spaces and special characters with hyphen
    .replace(/^-+|-+$/g, '')         // strip leading & trailing hyphens
    || 'studio';
}

interface ProfileAndShareManagerProps {
  profile: BeautyProProfile;
  onUpdateProfile: (updates: Partial<BeautyProProfile>) => void;
  onPreviewClientView: () => void;
  lang?: AppLanguage;
  onOpenTutorial?: (tab?: 'pro' | 'client') => void;
}

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: 'BRL', label: 'R$ Real Brasileiro (Brasil)' },
  { code: 'USD', label: '$ USD Dólar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'MXN', label: '$ MXN Peso Mexicano' },
  { code: 'COP', label: '$ COP Peso Colombiano' },
  { code: 'ARS', label: '$ ARS Peso Argentino' },
  { code: 'CLP', label: '$ CLP Peso Chileno' },
  { code: 'PEN', label: 'S/ PEN Sol Peruano' }
];

// Presets for instant cover & avatar selection
const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583001809873-a128495da465?w=1200&auto=format&fit=crop&q=80'
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
];

const STUDIO_PHOTO_PRESETS = [
  {
    title: 'Maca & Iluminação Ring Light',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Recepção Aconchegante',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Espaço de Atendimento Individual',
    url: 'https://images.unsplash.com/photo-1629380108605-6f9fb1978d38?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Bancada de Esterilização & Higiene',
    url: 'https://images.unsplash.com/photo-1588510841447-497b7b25ea0a?w=800&auto=format&fit=crop&q=80'
  }
];

export const ProfileAndShareManager: React.FC<ProfileAndShareManagerProps> = ({
  profile,
  onUpdateProfile,
  onPreviewClientView,
  lang = 'pt',
  onOpenTutorial
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;

  // Active sub-tab in manager
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'schedule' | 'space_photos' | 'highlights' | 'share' | 'tutorials'>('profile');

  // Handler for saving weekly availability schedule
  const handleSaveWeeklySchedule = (newWeeklySchedule: DaySchedule[], newSlotDuration: number) => {
    const openDays = newWeeklySchedule.filter((s) => s.isOpen).map((s) => s.dayOfWeek);
    const openSchedules = newWeeklySchedule.filter((s) => s.isOpen);
    const minStart = openSchedules.length > 0
      ? openSchedules.map((s) => s.openTime).sort()[0]
      : '09:00';
    const maxEnd = openSchedules.length > 0
      ? openSchedules.map((s) => s.closeTime).sort().reverse()[0]
      : '19:00';

    onUpdateProfile({
      weeklySchedule: newWeeklySchedule,
      slotDurationMinutes: newSlotDuration,
      workingDays: openDays,
      workingHours: {
        start: minStart,
        end: maxEnd
      }
    });
    setSaveFeedback(t.scheduleSavedSuccess);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Form State initialized from profile
  const [name, setName] = useState(profile.name);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [instagram, setInstagram] = useState(profile.instagram || '');
  const [tiktok, setTiktok] = useState(profile.tiktok || '');
  const [pixKey, setPixKey] = useState(profile.pixKey || '');
  const [pixType, setPixType] = useState(profile.pixType || 'celular');
  const [depositFixedAmount, setDepositFixedAmount] = useState(String(profile.depositFixedAmount || 30));
  const [address, setAddress] = useState(profile.address || '');
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood || '');
  const [city, setCity] = useState(profile.city || '');
  const [state, setState] = useState(profile.state || '');
  const [currency, setCurrency] = useState<CurrencyCode>(profile.currency || 'BRL');
  const [startHour, setStartHour] = useState(profile.workingHours?.start || '09:00');
  const [endHour, setEndHour] = useState(profile.workingHours?.end || '19:00');
  const [bookingPolicy, setBookingPolicy] = useState(profile.bookingPolicy || '');

  // Detailed Bank & PIX Payment State
  const initialBank = profile.bankPaymentDetails;
  const [bankEnabled, setBankEnabled] = useState(initialBank?.enabled ?? true);
  const [preferenceMethod, setPreferenceMethod] = useState<PaymentPreferenceMethod>(initialBank?.preferenceMethod || 'both');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(initialBank?.pixKeyType || (profile.pixType as PixKeyType) || 'celular');
  const [pixKeyVal, setPixKeyVal] = useState(initialBank?.pixKey || profile.pixKey || '');
  const [pixBeneficiaryName, setPixBeneficiaryName] = useState(initialBank?.pixBeneficiaryName || profile.name || '');
  const [pixCity, setPixCity] = useState(initialBank?.pixCity || profile.city || '');
  const [bankName, setBankName] = useState(initialBank?.bankName || '');
  const [accountType, setAccountType] = useState<BankAccountType>(initialBank?.accountType || 'corrente');
  const [accountNumber, setAccountNumber] = useState(initialBank?.accountNumber || '');
  const [agencyNumber, setAgencyNumber] = useState(initialBank?.agencyNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(initialBank?.accountHolderName || profile.name || '');
  const [accountHolderDocument, setAccountHolderDocument] = useState(initialBank?.accountHolderDocument || '');
  const [interbankCodeOrAlias, setInterbankCodeOrAlias] = useState(initialBank?.interbankCodeOrAlias || '');
  const [requireDeposit, setRequireDeposit] = useState(initialBank?.requireDeposit ?? profile.requireDeposit ?? true);
  const [depositType, setDepositType] = useState<'fixed' | 'percentage'>(initialBank?.depositType || 'fixed');
  const [depositAmount, setDepositAmount] = useState(String(initialBank?.depositAmount ?? profile.depositFixedAmount ?? 30));
  const [paymentDeadlineHours, setPaymentDeadlineHours] = useState(String(initialBank?.paymentDeadlineHours || 2));
  const [instructions, setInstructions] = useState(
    initialBank?.instructions ||
      (lang === 'pt'
        ? 'Por favor envie o comprovante do sinal por este WhatsApp em até 2 horas para garantir sua reserva na agenda.'
        : 'Por favor envía el comprobante del anticipo por este WhatsApp dentro de 2 horas para asegurar tu cita.')
  );
  const [copiedBankText, setCopiedBankText] = useState(false);

  // Keep local state synced when profile prop updates
  useEffect(() => {
    setName(profile.name);
    setBusinessName(profile.businessName);
    setHeadline(profile.headline || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatarUrl);
    setCoverUrl(profile.coverUrl);
    setWhatsapp(profile.whatsapp);
    setInstagram(profile.instagram || '');
    setTiktok(profile.tiktok || '');
    setPixKey(profile.pixKey || '');
    setPixType(profile.pixType || 'celular');
    setDepositFixedAmount(String(profile.depositFixedAmount || 30));
    setAddress(profile.address || '');
    setNeighborhood(profile.neighborhood || '');
    setCity(profile.city || '');
    setState(profile.state || '');
    setCurrency(profile.currency || 'BRL');
    setStartHour(profile.workingHours?.start || '09:00');
    setEndHour(profile.workingHours?.end || '19:00');
    setBookingPolicy(profile.bookingPolicy || '');

    // Sync bank details
    if (profile.bankPaymentDetails) {
      const b = profile.bankPaymentDetails;
      setBankEnabled(b.enabled ?? true);
      setPreferenceMethod(b.preferenceMethod || 'both');
      setPixKeyType(b.pixKeyType || 'celular');
      setPixKeyVal(b.pixKey || profile.pixKey || '');
      setPixBeneficiaryName(b.pixBeneficiaryName || profile.name || '');
      setPixCity(b.pixCity || profile.city || '');
      setBankName(b.bankName || '');
      setAccountType(b.accountType || 'corrente');
      setAccountNumber(b.accountNumber || '');
      setAgencyNumber(b.agencyNumber || '');
      setAccountHolderName(b.accountHolderName || profile.name || '');
      setAccountHolderDocument(b.accountHolderDocument || '');
      setInterbankCodeOrAlias(b.interbankCodeOrAlias || '');
      setRequireDeposit(b.requireDeposit ?? profile.requireDeposit ?? true);
      setDepositType(b.depositType || 'fixed');
      setDepositAmount(String(b.depositAmount ?? profile.depositFixedAmount ?? 30));
      setPaymentDeadlineHours(String(b.paymentDeadlineHours || 2));
      if (b.instructions) setInstructions(b.instructions);
    } else {
      setPixKeyVal(profile.pixKey || '');
      setPixKeyType((profile.pixType as PixKeyType) || 'celular');
    }

    if (profile.salonPhotos) {
      setSalonPhotos(profile.salonPhotos);
    }
    if (profile.highlights) {
      setHighlights(profile.highlights);
    }
    if (profile.slug) {
      setSlug(profile.slug);
    }
    if (profile.customShareText !== undefined) {
      setCustomShareText(profile.customShareText);
    }
    if (profile.customShareLink !== undefined) {
      setCustomShareLink(profile.customShareLink);
    }
    if (profile.customBioText !== undefined) {
      setCustomBioText(profile.customBioText);
    }
  }, [profile]);

  // Salon Photos list
  const [salonPhotos, setSalonPhotos] = useState<SalonPhoto[]>(profile.salonPhotos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');

  // Stories Highlights list
  const [highlights, setHighlights] = useState<ProfileHighlight[]>(profile.highlights || []);

  // Custom Slug & Share Messages State
  const [slug, setSlug] = useState(profile.slug || 'studio');
  const [customShareLink, setCustomShareLink] = useState(profile.customShareLink || '');

  const defaultShareTemplate = useMemo(() => {
    return lang === 'pt'
      ? '🌸 Olá! Já está disponível minha agenda online com nosso catálogo completo de serviços, fotos dos resultados e horários disponíveis!\n\n👉 Acesse e reserve seu horário exclusivo: {link}'
      : lang === 'es'
      ? '🌸 ¡Hola! Ya está disponible mi agenda online con catálogo completo de servicios, fotos de resultados y horarios disponibles.\n\n👉 Reserva tu cita aquí: {link}'
      : '🌸 Hello! My online booking portal is live with my full service catalog, gallery, and available slots.\n\n👉 Book your appointment here: {link}';
  }, [lang]);

  const defaultBioTemplate = useMemo(() => {
    const loc = neighborhood ? `${neighborhood}, ` : '';
    return lang === 'pt'
      ? `✨ ${businessName || 'Meu Estúdio de Beleza'}\n💖 ${headline || 'Especialista em Beleza & Bem-estar'}\n📍 ${loc}${city} - ${state}\n👇 Agende seu horário online no link:\n{link}`
      : lang === 'es'
      ? `✨ ${businessName || 'Mi Estudio de Belleza'}\n💖 ${headline || 'Especialista en Belleza'}\n📍 ${loc}${city}\n👇 Reserva tu cita aquí:\n{link}`
      : `✨ ${businessName || 'Beauty Studio'}\n💖 ${headline || 'Beauty Specialist'}\n📍 ${city}\n👇 Book online below:\n{link}`;
  }, [businessName, headline, neighborhood, city, state, lang]);

  const [customShareText, setCustomShareText] = useState(profile.customShareText || defaultShareTemplate);
  const [customBioText, setCustomBioText] = useState(profile.customBioText || defaultBioTemplate);

  // Visual feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBioText, setCopiedBioText] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleSlugChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
    setSlug(cleaned);
  };

  // Feedback state when generating link from salon name
  const [salonSlugFeedback, setSalonSlugFeedback] = useState<string | null>(null);

  // Suggested slug derived purely from salon/business name
  const suggestedSalonSlug = useMemo(() => {
    return generateSlugFromSalonName(businessName || name || 'studio');
  }, [businessName, name]);

  // Suggested preset options based on salon name, city, and professional name
  const suggestedPresets = useMemo(() => {
    const list: { label: string; slugVal: string; icon: string }[] = [];
    if (businessName) {
      list.push({
        label: businessName,
        slugVal: generateSlugFromSalonName(businessName),
        icon: '🏪',
      });
      if (city) {
        list.push({
          label: `${businessName} (${city})`,
          slugVal: generateSlugFromSalonName(`${businessName}-${city}`),
          icon: '📍',
        });
      }
    }
    if (name && (!businessName || generateSlugFromSalonName(name) !== generateSlugFromSalonName(businessName))) {
      list.push({
        label: name,
        slugVal: generateSlugFromSalonName(name),
        icon: '👤',
      });
    }
    return list;
  }, [businessName, city, name]);

  const handleGenerateFromSalonName = (chosenSlug?: string) => {
    const newSlug = chosenSlug || suggestedSalonSlug;
    setSlug(newSlug);
    // If customShareLink was filled, clear it so the clean salon-named URL takes effect immediately
    if (customShareLink) {
      setCustomShareLink('');
    }
    setSalonSlugFeedback(newSlug);
    setTimeout(() => setSalonSlugFeedback(null), 3500);
  };

  // Link generation: default system booking URL based on slug
  const activeSlug = slug.trim() || profile.slug || 'studio';
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=client&pro=${activeSlug}`
    : `https://meustudio.com.br/${activeSlug}`;

  // Effective sharing / referral link: uses customShareLink if entered by user, otherwise currentUrl
  const effectiveShareLink = (customShareLink && customShareLink.trim())
    ? customShareLink.trim()
    : currentUrl;

  // Resolved dynamic texts replacing variables
  const resolvedShareText = useMemo(() => {
    const textToUse = (customShareText && customShareText.trim()) ? customShareText : defaultShareTemplate;
    let txt = textToUse
      .replace(/{link}/g, effectiveShareLink)
      .replace(/{profesional}/g, name)
      .replace(/{profissional}/g, name)
      .replace(/{estudio}/g, businessName)
      .replace(/{negocio}/g, businessName);
    if (!txt.includes(effectiveShareLink)) {
      txt += `\n\n👉 ${effectiveShareLink}`;
    }
    return txt;
  }, [customShareText, defaultShareTemplate, effectiveShareLink, name, businessName]);

  const resolvedBioText = useMemo(() => {
    const textToUse = (customBioText && customBioText.trim()) ? customBioText : defaultBioTemplate;
    return textToUse
      .replace(/{link}/g, effectiveShareLink)
      .replace(/{profesional}/g, name)
      .replace(/{profissional}/g, name)
      .replace(/{estudio}/g, businessName)
      .replace(/{negocio}/g, businessName);
  }, [customBioText, defaultBioTemplate, effectiveShareLink, name, businessName]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveShareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
    }
  };

  const handleCopyBioText = async () => {
    try {
      await navigator.clipboard.writeText(resolvedBioText);
      setCopiedBioText(true);
      setTimeout(() => setCopiedBioText(false), 2500);
    } catch {
      setCopiedBioText(true);
    }
  };

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(resolvedShareText);
      setCopiedShareText(true);
      setTimeout(() => setCopiedShareText(false), 2500);
    } catch {
      setCopiedShareText(true);
    }
  };

  const handleShareToWhatsAppStatus = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(resolvedShareText)}`;
    window.open(url, '_blank');
  };

  const handleSaveShareSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSlug = slug.trim() || profile.slug || 'studio';
    onUpdateProfile({
      slug: cleanSlug,
      customShareText: customShareText.trim(),
      customShareLink: customShareLink.trim(),
      customBioText: customBioText.trim()
    });
    setSaveFeedback(t.shareSettingsSaved || (lang === 'pt' ? 'Link e textos salvos com sucesso!' : '¡Enlace y textos guardados!'));
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleResetShareTemplates = () => {
    setCustomShareText(defaultShareTemplate);
    setCustomShareLink('');
    setCustomBioText(defaultBioTemplate);
    setSaveFeedback(lang === 'pt' ? 'Modelos restaurados!' : '¡Modelos restaurados!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  // Instant update handlers so user changes are never lost
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newUrl = reader.result;
          setAvatarUrl(newUrl);
          onUpdateProfile({ avatarUrl: newUrl });
          setSaveFeedback(lang === 'pt' ? 'Foto de perfil salva!' : '¡Foto de perfil guardada!');
          setTimeout(() => setSaveFeedback(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatarPreset = (preset: string) => {
    setAvatarUrl(preset);
    onUpdateProfile({ avatarUrl: preset });
    setSaveFeedback(lang === 'pt' ? 'Foto de perfil salva!' : '¡Foto de perfil guardada!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newUrl = reader.result;
          setCoverUrl(newUrl);
          onUpdateProfile({ coverUrl: newUrl });
          setSaveFeedback(lang === 'pt' ? 'Foto de capa salva!' : '¡Portada guardada!');
          setTimeout(() => setSaveFeedback(null), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCoverPreset = (preset: string) => {
    setCoverUrl(preset);
    onUpdateProfile({ coverUrl: preset });
    setSaveFeedback(lang === 'pt' ? 'Foto de capa salva!' : '¡Portada guardada!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const [isUploadingSpacePhoto, setIsUploadingSpacePhoto] = useState(false);

  const handleSpacePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingSpacePhoto(true);
      const dataUrl = await fileToOptimizedDataUrl(file, 1200, 1200, 0.85);
      handleAddSpacePhoto(dataUrl, newPhotoTitle || (lang === 'pt' ? 'Meu Espaço' : 'Mi Espacio'));
    } catch (err: any) {
      alert(err?.message || 'Error al cargar la foto');
    } finally {
      setIsUploadingSpacePhoto(false);
      e.target.value = '';
    }
  };

  const handleAddSpacePhoto = (url: string, title: string) => {
    if (!url.trim()) return;
    const item: SalonPhoto = {
      id: `photo-${Date.now()}`,
      url: url.trim(),
      title: title.trim() || 'Meu Espaço de Beleza',
      category: 'espaco'
    };
    const updated = [...salonPhotos, item];
    setSalonPhotos(updated);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    onUpdateProfile({ salonPhotos: updated });
    setSaveFeedback(lang === 'pt' ? 'Foto do espaço adicionada!' : '¡Foto agregada!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const handleDeleteSpacePhoto = (id: string) => {
    const updated = salonPhotos.filter((p) => p.id !== id);
    setSalonPhotos(updated);
    onUpdateProfile({ salonPhotos: updated });
    setSaveFeedback(lang === 'pt' ? 'Foto removida!' : '¡Foto eliminada!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const handleSaveBankDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPix = pixKeyVal.trim();
    const cleanDeposit = Number(depositAmount) || 30;
    const bankDetails: BankPaymentDetails = {
      enabled: bankEnabled,
      preferenceMethod,
      pixKeyType,
      pixKey: cleanPix,
      pixBeneficiaryName: pixBeneficiaryName.trim(),
      pixCity: pixCity.trim(),
      bankName: bankName.trim(),
      accountType,
      accountNumber: accountNumber.trim(),
      agencyNumber: agencyNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      accountHolderDocument: accountHolderDocument.trim(),
      interbankCodeOrAlias: interbankCodeOrAlias.trim(),
      requireDeposit,
      depositType,
      depositAmount: cleanDeposit,
      paymentDeadlineHours: Number(paymentDeadlineHours) || 2,
      instructions: instructions.trim()
    };

    onUpdateProfile({
      bankPaymentDetails: bankDetails,
      pixKey: cleanPix,
      pixType: pixKeyType as any,
      depositFixedAmount: cleanDeposit,
      requireDeposit
    });

    setSaveFeedback(lang === 'pt' ? 'Dados bancários e PIX salvos com sucesso!' : '¡Datos bancarios y PIX guardados!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const simulatedBankText = useMemo(() => {
    return formatBankPaymentDetails(
      {
        ...profile,
        currency,
        name,
        city,
        pixKey: pixKeyVal || pixKey,
        pixType: pixKeyType as any,
        depositFixedAmount: Number(depositAmount) || 30,
        bankPaymentDetails: {
          enabled: bankEnabled,
          preferenceMethod,
          pixKeyType,
          pixKey: pixKeyVal || pixKey,
          pixBeneficiaryName: pixBeneficiaryName || name,
          pixCity: pixCity || city,
          bankName,
          accountType,
          accountNumber,
          agencyNumber,
          accountHolderName: accountHolderName || name,
          accountHolderDocument,
          interbankCodeOrAlias,
          requireDeposit,
          depositType,
          depositAmount: Number(depositAmount) || 30,
          paymentDeadlineHours: Number(paymentDeadlineHours) || 2,
          instructions
        }
      },
      lang,
      Number(depositAmount) || 30
    );
  }, [
    profile,
    currency,
    name,
    city,
    pixKeyVal,
    pixKey,
    pixKeyType,
    pixBeneficiaryName,
    pixCity,
    bankName,
    accountType,
    accountNumber,
    agencyNumber,
    accountHolderName,
    accountHolderDocument,
    interbankCodeOrAlias,
    requireDeposit,
    depositType,
    depositAmount,
    paymentDeadlineHours,
    instructions,
    bankEnabled,
    preferenceMethod,
    lang
  ]);

  const handleCopySimulatedBankText = async () => {
    try {
      await navigator.clipboard.writeText(simulatedBankText);
      setCopiedBankText(true);
      setTimeout(() => setCopiedBankText(false), 2500);
    } catch {
      setCopiedBankText(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPix = pixKeyVal.trim() || pixKey.trim();
    const cleanDeposit = Number(depositAmount) || Number(depositFixedAmount) || 30;

    onUpdateProfile({
      slug: slug.trim() || profile.slug || 'studio',
      customShareText: customShareText.trim(),
      customShareLink: customShareLink.trim(),
      customBioText: customBioText.trim(),
      name: name.trim(),
      businessName: businessName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      avatarUrl,
      coverUrl,
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
      pixKey: cleanPix,
      pixType: pixKeyType as any,
      depositFixedAmount: cleanDeposit,
      requireDeposit,
      bankPaymentDetails: {
        enabled: bankEnabled,
        preferenceMethod,
        pixKeyType,
        pixKey: cleanPix,
        pixBeneficiaryName: pixBeneficiaryName.trim() || name.trim(),
        pixCity: pixCity.trim() || city.trim(),
        bankName: bankName.trim(),
        accountType,
        accountNumber: accountNumber.trim(),
        agencyNumber: agencyNumber.trim(),
        accountHolderName: accountHolderName.trim() || name.trim(),
        accountHolderDocument: accountHolderDocument.trim(),
        interbankCodeOrAlias: interbankCodeOrAlias.trim(),
        requireDeposit,
        depositType,
        depositAmount: cleanDeposit,
        paymentDeadlineHours: Number(paymentDeadlineHours) || 2,
        instructions: instructions.trim()
      },
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      currency,
      workingHours: {
        start: startHour,
        end: endHour
      },
      bookingPolicy: bookingPolicy.trim(),
      salonPhotos,
      highlights
    });
    setSaveFeedback(t.savedSuccess);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Feedback Alert */}
      {saveFeedback && (
        <div className="fixed top-20 right-4 z-50 bg-[#72202E] text-white text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#72202E]/30 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span className="text-xs">{saveFeedback}</span>
        </div>
      )}

      {/* Top Banner - Luxurious Gold, Black & Light Gray */}
      <div className="bg-gradient-to-r from-white via-zinc-50 to-amber-50/50 border border-[#72202E]/30/70 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#72202E]/10 text-[#72202E] border border-[#72202E]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Design Dourado, Preto & Cinza' : 'Diseño Dorado, Negro & Gris'}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950">
            {t.profileManagerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {t.profileManagerSub}
          </p>
        </div>

        <button
          onClick={onPreviewClientView}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 text-xs font-semibold shadow-xs transition-colors hover:border-[#72202E]/40"
        >
          <Eye className="w-4 h-4 text-[#72202E]" />
          <span>{t.previewClientBtn}</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Perfil & Dados' : 'Perfil & Datos'}</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t.paymentsTab}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {pixKeyVal || bankName ? '✓' : '!'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.weeklyScheduleTab}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {profile.weeklySchedule ? profile.weeklySchedule.filter((s) => s.isOpen).length : (profile.workingDays?.length || 6)}d
          </span>
        </button>

        <button
          onClick={() => setActiveTab('space_photos')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'space_photos'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Fotos do Salão & Espaço' : 'Fotos del Salón'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {salonPhotos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('highlights')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'highlights'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Destaques Stories' : 'Historias Destacadas'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/15 text-zinc-950 font-bold">
            {highlights.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'share'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Divulgar Link na Bio' : 'Compartir Link'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tutorials')}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tutorials'
              ? 'bg-gradient-to-r from-[#72202E] to-[#581520] text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Tutoriais & Guias' : lang === 'es' ? 'Tutoriales & Guías' : 'Tutorials & Guides'}</span>
        </button>
      </div>

      {/* TAB 1: Profile & Visual Customizer */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Visual Profile Preview Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Cover Banner */}
            <div className="relative h-44 sm:h-52 w-full bg-zinc-100 overflow-hidden">
              {coverUrl ? (
                <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                  <span className="text-xs">{t.coverTitle}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Cover change controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <label className="cursor-pointer bg-white/95 hover:bg-white text-zinc-950 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 backdrop-blur-md transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Alterar Foto de Capa' : 'Cambiar Portada'}</span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Profile Avatar & Header content */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                {/* Avatar with Metallic Gold Gradient Ring */}
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#C4A480] via-[#E6C280] to-[#72202E] shadow-xl">
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover rounded-full bg-zinc-100"
                    />
                  </div>
                  <label className="absolute bottom-1 right-1 p-2 rounded-full bg-white border border-zinc-200 text-zinc-900 hover:text-[#72202E] shadow-md cursor-pointer transition-transform active:scale-90" title="Subir foto de perfil">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                {/* Cover Presets Selector */}
                <div className="flex items-center gap-1.5 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-600 font-semibold px-1">
                    {lang === 'pt' ? 'Trocar Capa Rápida:' : 'Modelos de Capa:'}
                  </span>
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCoverPreset(preset)}
                      className={`w-10 h-7 rounded-md overflow-hidden border transition-all ${
                        coverUrl === preset ? 'ring-2 ring-amber-500 border-white scale-105' : 'border-zinc-300 opacity-70 hover:opacity-100'
                      }`}
                      title="Aplicar modelo de capa"
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Presets Selector */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <span className="text-[11px] text-zinc-800 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Escolha sua Foto de Perfil (salva instantaneamente):' : 'Fotos de perfil sugeridas:'}</span>
                </span>
                <div className="flex items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAvatarPreset(preset)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === preset ? 'border-amber-500 ring-2 ring-amber-400 scale-110' : 'border-zinc-300 opacity-70 hover:opacity-100'
                      }`}
                      title="Usar esta foto de perfil"
                    >
                      <img src={preset} alt="avatar preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Profile Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.specialistName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Camila Santos"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-zinc-700">
                      {t.businessName} *
                    </label>
                    {businessName && (
                      <button
                        type="button"
                        onClick={() => handleGenerateFromSalonName()}
                        className="text-[11px] font-semibold text-[#72202E] hover:text-[#72202E] flex items-center gap-1 transition-colors hover:underline cursor-pointer"
                        title={lang === 'pt' ? 'Gerar link da agenda usando o nome do salão' : 'Generar link de difusión con este nombre'}
                      >
                        <Wand2 className="w-3 h-3 text-[#72202E]" />
                        <span>{lang === 'pt' ? 'Usar no Link' : 'Usar en Enlace'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Camila Santos · Studio & Lash Design"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {lang === 'pt' ? 'Nome oficial do seu salão ou estúdio de beleza.' : 'Nombre oficial de tu salón o estudio de belleza.'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#72202E]" />
                      <span>{t.slugLabel}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateFromSalonName()}
                      className="text-xs font-semibold text-[#72202E] bg-[#72202E]/10 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-[#72202E]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={lang === 'pt' ? `Gerar link com o nome: ${suggestedSalonSlug}` : `Generar enlace con el nombre: ${suggestedSalonSlug}`}
                    >
                      <Wand2 className="w-3 h-3 text-[#72202E]" />
                      <span>{t.useSalonNameAction || (lang === 'pt' ? 'Tomar Nome do Salão' : 'Tomar Nombre del Salón')}</span>
                    </button>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3.5 py-2.5 bg-zinc-100 border border-r-0 border-zinc-300 rounded-l-xl text-xs font-mono text-zinc-500 select-none">
                      .../?view=client&pro=
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="camila-studio"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-r-xl px-3.5 py-2.5 text-sm font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                    <span>{t.slugHelper}</span>
                    <span className="font-mono text-[#72202E] font-semibold truncate max-w-xs">
                      ...&pro={activeSlug}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.headline}
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Ex: Master Lash Designer & Micropigmentadora Certificada"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.bio}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      lang === 'pt'
                        ? 'Conte um pouco sobre sua trajetória, especialidades e o carinho com que atende suas clientes...'
                        : 'Sobre ti y tus servicios...'
                    }
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact, Social Networks & Brazil PIX Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
              <Instagram className="w-4 h-4 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Redes Sociais, WhatsApp & Chave PIX' : 'Redes Sociales & Pagos'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.whatsappPro} (com DDD)</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +55 11 98921-8844"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{t.instagramHandle}</span>
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@camilasantos.beauty"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{t.tiktokHandle}</span>
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@camilasantos.lashes"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              {/* PIX Key */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{t.pixKeyLabel}</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={pixType}
                    onChange={(e) => {
                      setPixType(e.target.value as any);
                      setPixKeyType(e.target.value as any);
                    }}
                    className="bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2.5 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                  >
                    <option value="celular">Celular</option>
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Aleatória</option>
                  </select>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => {
                      setPixKey(e.target.value);
                      setPixKeyVal(e.target.value);
                    }}
                    placeholder="11989218844 ou email"
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>

              {/* Full Bank & PIX Setup Banner */}
              <div className="sm:col-span-2 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 border border-[#72202E]/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#72202E] text-white text-zinc-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <Wallet className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950">
                      {lang === 'pt' ? 'Dados Bancários Completos & Mensagens Automáticas' : 'Datos Bancarios Completos & Confirmaciones'}
                    </h4>
                    <p className="text-[11px] text-zinc-600">
                      {lang === 'pt'
                        ? 'Configure banco, agência, conta, titular e instruções dinâmicas para confirmação no WhatsApp.'
                        : 'Configura banco, cuenta, titular e instrucciones dinámicas de confirmación por WhatsApp.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-xs"
                >
                  <span>{lang === 'pt' ? 'Configurar Detalhes' : 'Configurar Detalles'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Location & Address Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Localização & Endereço do Estúdio' : 'Ubicación'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.addressLabel}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua Oscar Freire, 1240 - Sala 42"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.neighborhoodLabel}
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Jardins / Cerqueira César"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.cityLabel}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.stateLabel}
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="SP"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E] uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {lang === 'pt' ? 'Moeda de Cobrança' : 'Moneda'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 bg-gradient-to-r from-amber-50/60 to-zinc-50 border border-[#EAE3D9]/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#72202E] text-white/20 border border-[#72202E]/30 flex items-center justify-center text-[#72202E] shrink-0">
                    <Clock className="w-4 h-4 text-[#72202E]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">
                      {t.weeklyScheduleTitle}
                    </span>
                    <span className="text-[11px] text-zinc-600">
                      {profile.weeklySchedule
                        ? `${profile.weeklySchedule.filter((s) => s.isOpen).length} ${lang === 'pt' ? 'dias abertos por semana' : 'días abiertos por semana'}`
                        : `${profile.workingDays?.length || 6} dias ativos`} • {startHour} às {endHour}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 shadow-xs flex items-center gap-1.5 transition-colors hover:border-[#72202E]/40 shrink-0"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Configurar Dias & Horas' : 'Configurar Horarios'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs">
            <span className="text-xs text-zinc-500">
              {lang === 'pt' ? 'Todas as alterações são salvas permanentemente.' : 'Cambios guardados permanentemente.'}
            </span>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveProfileBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: Detailed Bank & PIX Payment Configuration */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveBankDetails} className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-white via-amber-50/40 to-yellow-50/30 border border-[#72202E]/30 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#72202E]/10 text-[#1F1E1D] border border-[#72202E]/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Automação WhatsApp & Agendamento' : 'Automatización WhatsApp & Citas'}</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {bankEnabled ? (lang === 'pt' ? 'Ativo' : 'Activo') : (lang === 'pt' ? 'Desativado' : 'Desactivado')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-950 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[#72202E]" />
                <span>{t.paymentsTitle}</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                {t.paymentsSub}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopySimulatedBankText}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-[#72202E]/40 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {copiedBankText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#72202E]" />}
                <span>{copiedBankText ? t.paymentDetailsCopied : t.copyPaymentDetailsBtn}</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Salvar Dados' : 'Guardar Datos'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Preferred Payment Method Selection */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#72202E]" />
              <span>{t.paymentPreferenceLabel}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPreferenceMethod('pix')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  preferenceMethod === 'pix'
                    ? 'bg-[#F4EFEB]/70 border-[#72202E]/40 shadow-xs ring-1 ring-amber-400'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#72202E]" />
                    <span>{t.prefPixOnly}</span>
                  </span>
                  {preferenceMethod === 'pix' && <Check className="w-4 h-4 text-[#72202E] stroke-[3]" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {lang === 'pt' ? 'Chave rápida (CPF, celular, e-mail). Ideal no Brasil.' : 'Llave rápida para cobro instantáneo.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreferenceMethod('bank_transfer')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  preferenceMethod === 'bank_transfer'
                    ? 'bg-[#F4EFEB]/70 border-[#72202E]/40 shadow-xs ring-1 ring-amber-400'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#72202E]" />
                    <span>{t.prefBankOnly}</span>
                  </span>
                  {preferenceMethod === 'bank_transfer' && <Check className="w-4 h-4 text-[#72202E] stroke-[3]" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {lang === 'pt' ? 'Banco, agência, conta corrente ou poupança.' : 'Banco, número de cuenta y CLABE / CBU.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreferenceMethod('both')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  preferenceMethod === 'both'
                    ? 'bg-[#F4EFEB]/70 border-[#72202E]/40 shadow-xs ring-1 ring-amber-400'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#72202E]" />
                    <span>{t.prefBoth}</span>
                  </span>
                  {preferenceMethod === 'both' && <Check className="w-4 h-4 text-[#72202E] stroke-[3]" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {lang === 'pt' ? 'Oferece ambas as opções na mensagem da cliente.' : 'Ofrece ambas alternativas en el mensaje.'}
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: PIX Key Details */}
          {(preferenceMethod === 'pix' || preferenceMethod === 'both') && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#72202E]" />
                  <span>{lang === 'pt' ? 'Configuração da Chave PIX (Brasil)' : 'Datos de Llave PIX'}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {lang === 'pt' ? 'Inserido em {pix} e {datos_bancarios}' : 'Disponible en plantilla'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.pixTypeLabel} *
                  </label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => {
                      setPixKeyType(e.target.value as PixKeyType);
                      setPixType(e.target.value as any);
                    }}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  >
                    <option value="celular">Celular / Teléfono</option>
                    <option value="cpf">CPF (Pessoa Física)</option>
                    <option value="cnpj">CNPJ (Pessoa Jurídica / MEI)</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.pixKeyLabel} *
                  </label>
                  <input
                    type="text"
                    value={pixKeyVal}
                    onChange={(e) => {
                      setPixKeyVal(e.target.value);
                      setPixKey(e.target.value);
                    }}
                    placeholder={
                      pixKeyType === 'celular' ? 'Ex: 11989218844' :
                      pixKeyType === 'cpf' ? 'Ex: 123.456.789-00' :
                      pixKeyType === 'cnpj' ? 'Ex: 12.345.678/0001-90' :
                      pixKeyType === 'email' ? 'Ex: pagamentos@meustudio.com.br' :
                      'Ex: 123e4567-e89b-12d3-a456-426614174000'
                    }
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.pixBeneficiaryLabel}
                  </label>
                  <input
                    type="text"
                    value={pixBeneficiaryName}
                    onChange={(e) => setPixBeneficiaryName(e.target.value)}
                    placeholder="Ex: Camila Santos · Studio & Lash"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.pixCityLabel}
                  </label>
                  <input
                    type="text"
                    value={pixCity}
                    onChange={(e) => setPixCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Traditional Bank Account Details */}
          {(preferenceMethod === 'bank_transfer' || preferenceMethod === 'both') && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#72202E]" />
                <span>{lang === 'pt' ? 'Dados da Conta Bancária para Transferência' : 'Datos Bancarios para Transferencia'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.bankNameLabel} *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: Nubank, Banco do Brasil, Itaú, BBVA, Santander, Bancolombia"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.bankAccountTypeLabel}
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  >
                    <option value="corrente">{t.accountTypeChecking}</option>
                    <option value="poupanca">{t.accountTypeSavings}</option>
                    <option value="ahorros">{lang === 'es' ? 'Cuenta de Ahorros' : 'Poupança / Ahorros'}</option>
                    <option value="corriente">{lang === 'es' ? 'Cuenta Corriente / Cheques' : 'Corrente'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.agencyNumberLabel}
                  </label>
                  <input
                    type="text"
                    value={agencyNumber}
                    onChange={(e) => setAgencyNumber(e.target.value)}
                    placeholder="Ex: 0001 (Agência)"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.accountNumberLabel} *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ex: 9283741-2"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 font-mono focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.accountHolderNameLabel} *
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Ex: Camila Santos de Oliveira"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.accountHolderDocLabel}
                  </label>
                  <input
                    type="text"
                    value={accountHolderDocument}
                    onChange={(e) => setAccountHolderDocument(e.target.value)}
                    placeholder="Ex: 348.912.448-90 (CPF / RFC / RUT / DNI)"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    {t.interbankCodeLabel}
                  </label>
                  <input
                    type="text"
                    value={interbankCodeOrAlias}
                    onChange={(e) => setInterbankCodeOrAlias(e.target.value)}
                    placeholder="Ex: CLABE interbancaria (México), CBU/Alias (Argentina), Nequi (Colombia), ou Chave de Transferência"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Deposit / Sinal Policy & Instructions */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#72202E]" />
              <span>{lang === 'pt' ? 'Política de Sinal, Adiantamento & Comprovantes' : 'Política de Anticipo & Reserva'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-zinc-950 block">
                    {t.requireDepositToggle}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {lang === 'pt'
                      ? 'Ao ativar, o valor do sinal e os dados bancários serão destacados para a cliente confirmar a vaga.'
                      : 'Al activar, se solicita comprobante para garantizar la reserva de cupo.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={requireDeposit}
                  onChange={(e) => setRequireDeposit(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.depositAmountLabel} ({currency})
                </label>
                <div className="flex gap-2">
                  <select
                    value={depositType}
                    onChange={(e) => setDepositType(e.target.value as any)}
                    className="bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2.5 text-xs text-zinc-800 focus:bg-white focus:outline-none"
                  >
                    <option value="fixed">{lang === 'pt' ? 'Valor Fixo' : 'Monto Fijo'}</option>
                    <option value="percentage">{lang === 'pt' ? 'Porcentagem (%)' : 'Porcentaje (%)'}</option>
                  </select>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      setDepositFixedAmount(e.target.value);
                    }}
                    placeholder="30"
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 font-bold focus:bg-white focus:outline-none focus:border-[#72202E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.paymentDeadlineLabel}
                </label>
                <select
                  value={paymentDeadlineHours}
                  onChange={(e) => setPaymentDeadlineHours(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                >
                  <option value="1">1 {lang === 'pt' ? 'hora após o agendamento' : 'hora tras reservar'}</option>
                  <option value="2">2 {lang === 'pt' ? 'horas (Recomendado)' : 'horas (Recomendado)'}</option>
                  <option value="4">4 {lang === 'pt' ? 'horas' : 'horas'}</option>
                  <option value="12">12 {lang === 'pt' ? 'horas' : 'horas'}</option>
                  <option value="24">24 {lang === 'pt' ? 'horas' : 'horas'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t.paymentInstructionsLabel}
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t.paymentInstructionsPlaceholder}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#72202E]"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Real-time Live WhatsApp Preview of Confirmation Message */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#72202E] flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>{t.liveConfirmationPreviewTitle}</span>
              </h3>
              <span className="text-[10px] font-semibold text-zinc-500">
                {lang === 'pt' ? 'Inserção automática de {datos_bancarios} e {pix}' : 'Vista en tiempo real'}
              </span>
            </div>

            <p className="text-xs text-zinc-600">
              {lang === 'pt'
                ? 'Este é o bloco exato de pagamento que você ou a cliente enviarão no WhatsApp para confirmação de agendamentos:'
                : 'Este es el bloque que se insertará en tus mensajes de WhatsApp:'}
            </p>

            <div className="bg-zinc-950 text-zinc-100 p-4 rounded-2xl border border-zinc-800 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner selection:bg-[#72202E] text-white selection:text-zinc-950">
              {simulatedBankText}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#72202E] shrink-0" />
                <span>
                  {lang === 'pt'
                    ? 'Disponível instantaneamente na Agenda (botão "Confirmar & PIX") e na Central de Alertas.'
                    : 'Disponible en Agenda (botón "Confirmar & Datos") y Centro de Alertas.'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopySimulatedBankText}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedBankText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#72202E]" />}
                  <span>{copiedBankText ? t.paymentDetailsCopied : t.copyPaymentDetailsBtn}</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Salvar Configurações' : 'Guardar Configuración'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB: Weekly Schedule & Availability Manager */}
      {activeTab === 'schedule' && (
        <WeeklyScheduleManager
          profile={profile}
          onSaveSchedule={handleSaveWeeklySchedule}
          lang={lang}
        />
      )}

      {/* TAB 2: Studio & Salon Space Photos Gallery Manager */}
      {activeTab === 'space_photos' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#72202E]" />
                <span>{t.salonSpacePhotosTitle}</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {t.salonSpaceSub}
              </p>
            </div>

            {/* Add New Space Photo Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#72202E] block">
                  + {t.addSalonPhotoBtn}
                </span>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#72202E] text-white font-bold text-xs shadow-xs hover:from-amber-300 hover:to-yellow-400 transition-all self-start sm:self-auto">
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isUploadingSpacePhoto ? t.uploadingPhoto : t.uploadFromGalleryBtn}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSpacePhotoUpload}
                    disabled={isUploadingSpacePhoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#72202E]"
                />
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder={lang === 'pt' ? 'Ex: Maca com iluminação Ring Light' : 'Título de la foto'}
                  className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#72202E]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                {/* Preset Suggestions with instant add */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                    {lang === 'pt' ? 'Sugestões de fotos:' : 'Sugerencias:'}
                  </span>
                  {STUDIO_PHOTO_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSpacePhoto(p.url, p.title)}
                      className="px-2 py-1 rounded-md bg-white text-[10px] text-zinc-700 hover:text-[#72202E] hover:bg-[#F4EFEB] whitespace-nowrap border border-zinc-200"
                    >
                      + {p.title.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddSpacePhoto(newPhotoUrl, newPhotoTitle)}
                  disabled={!newPhotoUrl.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#72202E] to-[#581520] hover:from-amber-500 hover:to-yellow-600 disabled:opacity-40 text-zinc-950 font-bold text-xs shrink-0 flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'pt' ? 'Adicionar Foto' : 'Agregar Foto'}</span>
                </button>
              </div>
            </div>

            {/* Current Studio Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {salonPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-900 line-clamp-1">
                      {photo.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpacePhoto(photo.id)}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Instagram-Style Story Highlights & Visual Editor */}
      {activeTab === 'highlights' && (
        <HighlightEditor
          highlights={highlights}
          onChangeHighlights={(newHls) => {
            setHighlights(newHls);
            onUpdateProfile({ highlights: newHls });
          }}
          onSave={(newHls) => {
            setHighlights(newHls);
            onUpdateProfile({ highlights: newHls });
            setSaveFeedback(t.highlightsSavedSuccess || t.savedSuccess);
            setTimeout(() => setSaveFeedback(null), 3000);
          }}
          lang={lang}
          salonPhotos={salonPhotos}
          salonName={businessName || profile.businessName}
          specialistName={name || profile.name}
          avatarUrl={avatarUrl || profile.avatarUrl}
          whatsapp={whatsapp || profile.whatsapp}
        />
      )}

      {/* TAB 4: Customizable Share Link & Promotional Texts */}
      {activeTab === 'share' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#72202E]" />
                  <span>{t.shareTitle}</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {t.shareSub}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetShareTemplates}
                  className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Restaurar textos padrão"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.resetToDefaultText}</span>
                </button>
                <button
                  type="button"
                  onClick={onPreviewClientView}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#72202E]" />
                  <span>{t.openMyLinkBtn}</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: Personalizar Link de Referência & Identificador da Agenda */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#72202E]/10 text-[#72202E] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-[#72202E]" />
                      <span>{t.customizeLinkTitle}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      {t.customizeLinkSub}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? t.linkCopied : t.copyLinkBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onPreviewClientView}
                    className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 shadow-xs cursor-pointer"
                    title={t.openMyLinkBtn}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#72202E]" />
                  </button>
                </div>
              </div>

              {/* GENERADOR RÁPIDO: Generar Link con el Nombre del Salón */}
              <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border-2 border-[#72202E]/40/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shadow-sm shrink-0">
                      <Wand2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900">
                          {t.generateFromSalonBtn || (lang === 'pt' ? 'Gerar Link com Nome do Salão' : 'Generar Enlace con Nombre del Salón')}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#72202E] text-white text-zinc-950">
                          {lang === 'pt' ? '1-Clique' : '1-Clic'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {t.generateFromSalonSub || (lang === 'pt' ? 'Cria automaticamente um link amigável usando o nome do seu estúdio' : 'Crea automáticamente un enlace amigable usando el nombre de tu salón')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateFromSalonName()}
                    className="px-4 py-2.5 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                    <span>{t.useSalonNameAction || (lang === 'pt' ? 'Usar Nome do Salão' : 'Usar Nombre del Salón')}</span>
                  </button>
                </div>

                {/* Current salon name pill & Quick presets */}
                <div className="bg-white/90 backdrop-blur-xs border border-[#EAE3D9]/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-700">
                    <Store className="w-4 h-4 text-[#72202E] shrink-0" />
                    <span className="text-zinc-500 font-medium">
                      {t.currentSalonNameLabel || (lang === 'pt' ? 'Nome do Salão Atual:' : 'Nombre del Salón Actual:')}
                    </span>
                    <span className="font-bold text-zinc-900 bg-[#72202E]/10/70 px-2 py-0.5 rounded-md border border-[#EAE3D9] truncate max-w-xs">
                      {businessName || name || (lang === 'pt' ? 'Meu Estúdio' : 'Mi Salón')}
                    </span>
                  </div>

                  {suggestedPresets.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-zinc-500 mr-1">
                        {t.quickPresetsLabel || (lang === 'pt' ? 'Sugestões:' : 'Sugerencias:')}
                      </span>
                      {suggestedPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleGenerateFromSalonName(preset.slugVal)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                            slug === preset.slugVal
                              ? 'bg-[#72202E] text-zinc-950 border-amber-600 font-bold shadow-2xs'
                              : 'bg-zinc-50 hover:bg-[#F4EFEB] text-zinc-700 hover:text-zinc-900 border-zinc-200 hover:border-[#72202E]/30'
                          }`}
                          title={`Usar: ${preset.slugVal}`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.slugVal}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback when generated */}
                {salonSlugFeedback && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3.5 py-2 rounded-xl animate-fade-in font-medium">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>
                      {t.linkGeneratedNotice || (lang === 'pt' ? 'Link atualizado com sucesso usando o nome do salão!' : '¡Enlace actualizado con éxito usando el nombre de tu salón!')}
                    </span>
                    <span className="font-mono font-bold text-emerald-900">
                      &pro={salonSlugFeedback}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Link Indicator Card */}
              <div className="bg-[#F4EFEB]/90 border border-[#EAE3D9] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <Sparkles className="w-4 h-4 text-[#72202E] shrink-0" />
                  <span className="text-[#72202E] font-semibold shrink-0">
                    {lang === 'pt' ? 'Link Ativo para Divulgação:' : 'Enlace Activo para Difusión:'}
                  </span>
                  <span className="font-mono font-bold text-zinc-950 truncate max-w-sm sm:max-w-md bg-white/70 px-2 py-0.5 rounded border border-[#EAE3D9]/60">
                    {effectiveShareLink}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1.5 rounded-lg bg-[#72202E] hover:bg-[#581520] text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (lang === 'pt' ? 'Copiado!' : '¡Copiado!') : (lang === 'pt' ? 'Copiar' : 'Copiar')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onPreviewClientView}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#72202E]" />
                    <span>{t.openMyLinkBtn}</span>
                  </button>
                </div>
              </div>

              {/* Input A: Link de Referência Personalizado (URL direta ou externa) */}
              <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-1.5 shadow-2xs">
                <label className="block text-xs font-semibold text-zinc-800">
                  {t.customShareLinkInputLabel || (lang === 'pt' ? 'Link de Referência / Enlace de Divulgação Personalizado' : 'Link de Referencia / Enlace de Divulgación')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customShareLink}
                    onChange={(e) => setCustomShareLink(e.target.value)}
                    placeholder="https://meustudio.com.br/agenda (ou deixe vazio para usar o link gerado abaixo)"
                    className="w-full px-3 py-2 text-xs font-mono text-zinc-900 bg-zinc-50 border border-zinc-300 rounded-lg focus:bg-white focus:outline-none focus:border-[#72202E] focus:ring-1 focus:ring-amber-400"
                  />
                  {customShareLink && (
                    <button
                      type="button"
                      onClick={() => setCustomShareLink('')}
                      className="px-2.5 py-2 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 bg-zinc-100 rounded-lg border border-zinc-200 shrink-0 cursor-pointer"
                      title="Usar link padrão gerado"
                    >
                      {lang === 'pt' ? 'Usar Gerado' : 'Usar Generado'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {t.customShareLinkInputHelper || (lang === 'pt' ? 'Insira sua URL personalizada ou deixe em branco para usar o link oficial da agenda gerado pelo sistema.' : 'Ingresa tu URL personalizada o déjala vacía para usar el enlace generado por el sistema.')}
                </p>
              </div>

              {/* Input B: Identificador do Link (Slug da Agenda) */}
              <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-800">
                    {t.slugLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateFromSalonName()}
                    className="text-[11px] text-[#72202E] hover:text-[#1F1E1D] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-[#72202E]" />
                    <span>{lang === 'pt' ? `Usar "${suggestedSalonSlug}"` : `Usar "${suggestedSalonSlug}"`}</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center bg-zinc-50 border border-zinc-300 rounded-lg overflow-hidden focus-within:border-amber-500 focus-within:bg-white">
                    <span className="px-2.5 py-2 bg-zinc-100 border-r border-zinc-200 text-xs font-mono text-zinc-500 select-none whitespace-nowrap">
                      .../?view=client&pro=
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="camila-studio"
                      className="w-full px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{t.slugHelper}</span>
                  <span className="font-mono text-[#72202E] font-medium truncate max-w-xs">{currentUrl}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: Personalizar Texto de Difusión para WhatsApp / Redes Sociales */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>{t.customShareTextTitle}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      {t.customShareTextSub}
                    </p>
                  </div>
                </div>

                {/* Variable insertion chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-zinc-500 font-medium">{lang === 'pt' ? 'Variáveis:' : 'Variables:'}</span>
                  <button
                    type="button"
                    onClick={() => setCustomShareText((prev) => prev + ' {link}')}
                    className="px-2 py-0.5 rounded-md bg-white border border-zinc-300 hover:border-amber-500 text-[10px] font-mono text-[#72202E] font-semibold"
                  >
                    + &#123;link&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomShareText((prev) => prev + ' {profesional}')}
                    className="px-2 py-0.5 rounded-md bg-white border border-zinc-300 hover:border-amber-500 text-[10px] font-mono text-[#72202E] font-semibold"
                  >
                    + &#123;profesional&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomShareText((prev) => prev + ' {estudio}')}
                    className="px-2 py-0.5 rounded-md bg-white border border-zinc-300 hover:border-amber-500 text-[10px] font-mono text-[#72202E] font-semibold"
                  >
                    + &#123;estudio&#125;
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={4}
                  value={customShareText}
                  onChange={(e) => setCustomShareText(e.target.value)}
                  placeholder="Escreva a mensagem personalizada..."
                  className="w-full bg-white border border-zinc-300 rounded-xl p-3.5 text-xs text-zinc-900 leading-relaxed focus:outline-none focus:border-[#72202E] focus:ring-2 focus:ring-amber-200/50"
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                  <span>{lang === 'pt' ? 'A tag {link} será substituída pelo seu link exclusivo.' : 'La etiqueta {link} se reemplazará por tu enlace real.'}</span>
                  <span>{customShareText.length} {lang === 'pt' ? 'caracteres' : 'caracteres'}</span>
                </div>
              </div>

              {/* Live Preview & Direct WhatsApp Share */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'pt' ? 'Prévia da Mensagem (com o seu link inserido):' : 'Vista Previa del Mensaje (con tu link real):'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShareText}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-300 flex items-center gap-1"
                  >
                    {copiedShareText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareText ? (lang === 'pt' ? 'Copiado!' : '¡Copiado!') : (lang === 'pt' ? 'Copiar Mensagem' : 'Copiar Mensaje')}</span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-200 font-sans text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                  {resolvedShareText}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleShareToWhatsAppStatus}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.shareOnWhatsAppBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Personalizar Texto para Bio (Instagram & TikTok) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span>{t.customBioTextTitle}</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      {t.customBioTextSub}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBioText}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 shadow-xs"
                >
                  {copiedBioText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-pink-600" />}
                  <span>{copiedBioText ? (lang === 'pt' ? 'Copiado para Bio!' : '¡Copiado para Bio!') : t.copyBioTextBtn}</span>
                </button>
              </div>

              {/* Bio Textarea */}
              <div>
                <textarea
                  rows={4}
                  value={customBioText}
                  onChange={(e) => setCustomBioText(e.target.value)}
                  placeholder="Escreva a biografia para suas redes..."
                  className="w-full bg-white border border-zinc-300 rounded-xl p-3.5 text-xs font-mono text-zinc-900 leading-relaxed focus:outline-none focus:border-[#72202E] focus:ring-2 focus:ring-amber-200/50"
                />
              </div>

              {/* Bio Preview */}
              <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  {lang === 'pt' ? 'Como fica no seu Instagram / TikTok:' : 'Cómo se ve en tu Instagram / TikTok:'}
                </span>
                <div className="font-mono text-xs text-zinc-800 whitespace-pre-line leading-relaxed">
                  {resolvedBioText}
                </div>
              </div>
            </div>

            {/* SAVE ALL SHARE SETTINGS BUTTON */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-200">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#72202E] shrink-0" />
                <span>
                  {lang === 'pt'
                    ? 'Todas as alterações ficam salvas no Cloud SQL e associadas ao seu perfil.'
                    : 'Todos los cambios se guardan en Cloud SQL y quedan asociados a tu perfil.'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveShareSettings}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveShareSettingsBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Tutorials & Guides Hub */}
      {activeTab === 'tutorials' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Intro Card */}
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white rounded-2xl p-5 sm:p-6 border border-[#72202E]/40/30 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#72202E] text-white/20 text-amber-300 border border-[#72202E]/40/40 inline-flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{lang === 'pt' ? 'Centro de Capacitação' : 'Centro de Aprendizaje'}</span>
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                  {lang === 'pt' ? 'Tutoriais Completos de Uso da Aplicação' : 'Tutoriales Completos de Uso de la Aplicación'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                  {lang === 'pt'
                    ? 'Aprenda a configurar seu estúdio, gerenciar sua agenda sem esforço e ensine suas clientes a agendarem sozinhas em menos de 1 minuto.'
                    : 'Aprende a configurar tu estudio, gestionar tu agenda sin esfuerzo y enseña a tus clientas a reservar solas en menos de 1 minuto.'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#72202E] text-white/10 border border-[#72202E]/40/30 flex items-center justify-center shrink-0 text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Pro Tutorial */}
            <div className="bg-white border border-[#72202E]/30/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#72202E]/40 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#72202E]/10 text-[#72202E] border border-[#72202E]/30">
                    💼 {lang === 'pt' ? 'Para a Profissional' : 'Para el Profesional'}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">5 {lang === 'pt' ? 'passos' : 'pasos'}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-zinc-950 mb-1.5">
                  {lang === 'pt' ? 'Guia do Painel & Gestão da Especialista' : 'Guía del Panel y Gestión del Especialista'}
                </h3>
                <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                  {lang === 'pt'
                    ? 'Aprenda como dominar cada ferramenta para economizar horas no WhatsApp e multiplicar seus atendimentos.'
                    : 'Aprende cómo dominar cada herramienta para ahorrar horas en WhatsApp y multiplicar tus atenciones.'}
                </p>

                <div className="space-y-2 text-xs text-zinc-700 bg-zinc-50 rounded-xl p-3 border border-zinc-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>{lang === 'pt' ? 'Perfil, fotos e horário semanal com intervalos' : 'Perfil, fotos y horario semanal con intervalos'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>{lang === 'pt' ? 'Catálogo de procedimentos e prazos de retorno' : 'Catálogo de procedimientos y plazos de retorno'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>{lang === 'pt' ? 'Divulgação na bio do Instagram e QR Code físico' : 'Difusión en la bio de Instagram y Código QR'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>{lang === 'pt' ? 'Alertas sonoros e notificações no navegador' : 'Alertas sonoras y notificaciones en navegador'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">5</span>
                    <span>{lang === 'pt' ? 'Agenda diária e lembretes automáticos no WhatsApp' : 'Agenda diaria y recordatorios en WhatsApp'}</span>
                  </div>
                </div>
              </div>

              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={() => onOpenTutorial('pro')}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Abrir Tutorial da Profissional' : 'Abrir Tutorial del Profesional'}</span>
                </button>
              )}
            </div>

            {/* Card 2: Client Tutorial */}
            <div className="bg-white border border-[#72202E]/30/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#72202E]/40 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#72202E]/10 text-[#72202E] border border-[#72202E]/30">
                    🌸 {lang === 'pt' ? 'Para as Clientes' : 'Para los Clientes'}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">4 {lang === 'pt' ? 'passos' : 'pasos'}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-zinc-950 mb-1.5">
                  {lang === 'pt' ? 'Guia de Autoagendamento da Cliente' : 'Guía de Reserva de la Clienta'}
                </h3>
                <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                  {lang === 'pt'
                    ? 'Conheça exatamente o fluxo visual que suas clientes percorrem para agendar sem dúvidas.'
                    : 'Conoce con exactitud el flujo visual que tus clientas recorren para agendar sin dudas ni fricción.'}
                </p>

                <div className="space-y-2 text-xs text-zinc-700 bg-zinc-50 rounded-xl p-3 border border-zinc-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>{lang === 'pt' ? 'Escolha do serviço, fotos de trabalhos e valores' : 'Selección de servicio, fotos de trabajos y precios'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>{lang === 'pt' ? 'Seleção do dia e horário livre no calendário' : 'Selección de día y turno disponible en calendario'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>{lang === 'pt' ? 'Preenchimento rápido do Nome e WhatsApp' : 'Ingreso de Nombre y WhatsApp sin contraseñas'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#72202E] text-white/20 text-[#72202E] flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>{lang === 'pt' ? 'Confirmação na hora e envio direto no WhatsApp' : 'Confirmación inmediata y comprobante por WhatsApp'}</span>
                  </div>
                </div>
              </div>

              {onOpenTutorial && (
                <button
                  type="button"
                  onClick={() => onOpenTutorial('client')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#72202E] hover:bg-[#581520] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 border border-[#72202E]/30"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Ver Tutorial da Cliente' : 'Ver Tutorial del Cliente'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
