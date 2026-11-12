import React, { useState, useRef } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  RotateCcw,
  Info,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  Coffee,
  Heart,
  Calendar,
  ExternalLink,
  Upload,
  Camera,
  Loader2,
  FolderHeart,
  Play,
  FileText,
  CheckCircle2,
  Bookmark,
  Share2
} from 'lucide-react';
import { ProfileHighlight, HighlightStoryItem, SalonPhoto } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { cleanPhoneNumber } from '../utils/whatsapp';
import { fileToOptimizedDataUrl } from '../utils/imageUtils';

export interface HighlightEditorProps {
  highlights: ProfileHighlight[];
  onChangeHighlights: (newHighlights: ProfileHighlight[]) => void;
  onSave?: (updatedHighlights: ProfileHighlight[]) => void;
  lang: 'pt' | 'es' | 'en';
  salonPhotos?: SalonPhoto[];
  salonName?: string;
  specialistName?: string;
  avatarUrl?: string;
  whatsapp?: string;
  className?: string;
}

// Curated high quality beauty & salon stock photos for quick 1-click selection
const CURATED_BEAUTY_IMAGES = [
  {
    category: 'space',
    title: 'Estúdio / Maca Luxo',
    url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'space',
    title: 'Ambiente Moderno',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'space',
    title: 'Recepção & Lounge',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'results',
    title: 'Extensão de Cílios',
    url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'results',
    title: 'Design de Sobrancelhas',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'results',
    title: 'Unhas & Manicure',
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'results',
    title: 'Pele Radiante & Glow',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'bio',
    title: 'Biosegurança & Esterilização',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'bio',
    title: 'Ferramentas Clínicas',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'review',
    title: 'Cliente Satisfeita',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'review',
    title: 'Olhar Marcante',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80'
  },
  {
    category: 'care',
    title: 'Pincéis & Cuidados',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80'
  }
];

// High-converting info templates for stories (PT / ES / EN)
const STORY_INFO_TEMPLATES = {
  pt: [
    {
      title: '🌿 Cuidados Pós-Procedimento',
      icon: Heart,
      text: '✨ CUIDADOS ESSENCIAIS:\n1. Não molhar a região nas primeiras 24 horas.\n2. Evite vapor quente, sauna e banhos escaldantes.\n3. Escove delicadamente com a escovinha fornecida.\n4. Realize a manutenção a cada 20-25 dias para manter o efeito perfeito!'
    },
    {
      title: '💎 Detalhes do Procedimento & Técnica',
      icon: Sparkles,
      text: '🌸 SOBRE NOSSA TÉCNICA EXCLUSIVA:\n• Fios levíssimos e acabamento premium sem pesar os naturais.\n• Mapeamento personalizado para valorizar o formato do seu olhar.\n• Procedimento indolor com durabilidade de até 30 dias.'
    },
    {
      title: '🛡️ Biosegurança & Esterilização',
      icon: ShieldCheck,
      text: '🏥 SUA SAÚDE EM PRIMEIRO LUGAR:\n• Instrumentos 100% esterilizados em autoclave hospitalar.\n• Materiais descartáveis de uso único por cliente.\n• Produtos dermatologicamente testados e registrados na Anvisa.'
    },
    {
      title: '☕ Conforto do Nosso Estúdio',
      icon: Coffee,
      text: '🛋️ EXPERIÊNCIA VIP NO SALÃO:\n• Maca ergonômica com aquecimento e almofada de alívio cervical.\n• Cardápio de chás relaxantes e café espresso de cortesia.\n• Ambiente aromatizado e playlist suave para seu relaxamento.'
    },
    {
      title: '⭐ Depoimento de Cliente',
      icon: Award,
      text: '💬 O QUE DIZEM NOSSAS CLIENTES:\n"Atendimento impecável do início ao fim! Meus cílios duraram 4 semanas intactos e meus naturais continuam fortes e saudáveis." — Agende seu horário!'
    },
    {
      title: '📅 Política de Agendamento',
      icon: Calendar,
      text: '📌 POLÍTICA DE ATENDIMENTO:\n• Agendamentos confirmados mediante pequeno sinal de reserva.\n• Tolerância de 10 minutos para não comprometer a próxima cliente.\n• Reagendamentos com aviso prévio de até 24 horas.'
    }
  ],
  es: [
    {
      title: '🌿 Cuidados Posteriores',
      icon: Heart,
      text: '✨ CUIDADOS ESENCIALES:\n1. No mojar la zona durante las primeras 24 horas.\n2. Evitar vapores, saunas y agua muy caliente.\n3. Cepillar suavemente con el cepillito entregado.\n4. Realizar el mantenimiento a los 20-25 días para mantener el diseño impecable.'
    },
    {
      title: '💎 Detalles del Procedimiento',
      icon: Sparkles,
      text: '🌸 NUESTRA TÉCNICA EXCLUSIVA:\n• Fibras ultra livianas que no dañan tu pestaña o ceja natural.\n• Diseño y visagismo personalizado según la anatomía de tu rostro.\n• Duración promedio de 25 a 30 días con los cuidados indicados.'
    },
    {
      title: '🛡️ Bioseguridad y Esterilización',
      icon: ShieldCheck,
      text: '🏥 TU SALUD ES PRIORIDAD:\n• Instrumental 100% esterilizado en autoclave de grado médico.\n• Materiales descartables de un solo uso por clienta.\n• Productos hipoalergénicos certificados internacionalmente.'
    },
    {
      title: '☕ Comodidades del Estudio',
      icon: Coffee,
      text: '🛋️ EXPERIENCIA VIP EN CABINA:\n• Camilla ergonómica acolchada para máxima relajación.\n• Café espresso, infusiones naturales y música relajante.\n• Espacio climatizado y desinfectado entre cada cita.'
    },
    {
      title: '⭐ Testimonio de Clienta',
      icon: Award,
      text: '💬 OPINIONES REALES:\n"¡El mejor servicio de la ciudad! El resultado es súper natural y duradero. La atención es de 10 estrellas." — Reserva tu cita hoy mismo.'
    },
    {
      title: '📅 Política de Reserva',
      icon: Calendar,
      text: '📌 POLÍTICA DE CITAS:\n• Confirmación con anticipo para apartar tu hora exclusiva.\n• Tolerancia máxima de 10 minutos de retraso.\n• Reprogramación con 24 horas de antelación sin penalidad.'
    }
  ],
  en: [
    {
      title: '🌿 Aftercare Instructions',
      icon: Heart,
      text: '✨ ESSENTIAL AFTERCARE:\n1. Avoid water and steam for the first 24 hours.\n2. Do not use oil-based products around the treatment area.\n3. Gently brush daily with the provided spoolie.\n4. Book maintenance within 20-25 days for flawless results.'
    },
    {
      title: '💎 Procedure & Technique',
      icon: Sparkles,
      text: '🌸 OUR SIGNATURE TECHNIQUE:\n• Ultra-lightweight lash fibers that preserve your natural lashes.\n• Custom face mapping and design tailored to your eyes.\n• Painless application with 3-4 weeks durability.'
    },
    {
      title: '🛡️ Sanitation & Bio-Safety',
      icon: ShieldCheck,
      text: '🏥 YOUR SAFETY COMES FIRST:\n• Medical-grade autoclave sterilization for all metal instruments.\n• Single-use disposables for every single client.\n• Hypoallergenic, salon-grade certified adhesives and products.'
    },
    {
      title: '☕ VIP Studio Experience',
      icon: Coffee,
      text: '🛋️ COMPLIMENTARY AMENITIES:\n• Ergonomic heated bed with orthopedic memory pillow.\n• Welcome espresso coffee and organic herbal tea.\n• Relaxing ambiance designed for you to unwind.'
    },
    {
      title: '⭐ Client Review',
      icon: Award,
      text: '💬 CLIENT TESTIMONIAL:\n"Absolutely loved my lashes! They feel weightless and lasted over 4 weeks without shedding. Best lash artist ever!"'
    },
    {
      title: '📅 Booking Policy',
      icon: Calendar,
      text: '📌 BOOKING POLICY:\n• Small deposit required to secure your appointment slot.\n• 10-minute grace period for arrival.\n• 24-hour advance notice for any rescheduling.'
    }
  ]
};

// Title suggestions for quick 1-click naming
const TITLE_SUGGESTIONS = {
  pt: [
    'Meu Espaço',
    'Antes & Depois',
    'Cuidados Pós',
    'Certificados',
    'Biosegurança',
    'Preços & Combos',
    'Depoimentos ⭐',
    'Dúvidas / FAQ'
  ],
  es: [
    'Mi Estudio',
    'Antes & Después',
    'Cuidados Post',
    'Certificados',
    'Bioseguridad',
    'Precios & Combos',
    'Testimonios ⭐',
    'Preguntas Frecuentes'
  ],
  en: [
    'Studio Tour',
    'Before & After',
    'Aftercare',
    'Certificates',
    'Bio-Safety',
    'Pricing & Sets',
    'Reviews ⭐',
    'FAQ'
  ]
};

// Default recommended highlight collections to restore or inspire
const RECOMMENDED_HIGHLIGHTS_TEMPLATES: Record<string, ProfileHighlight[]> = {
  pt: [
    {
      id: 'hl-espaco',
      title: 'Meu Espaço',
      coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-1-1',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80',
          caption: 'Nosso estúdio foi projetado para proporcionar momentos de relaxamento e beleza absoluta.'
        },
        {
          id: 'hl-1-2',
          url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=80',
          caption: 'Maca ergonômica com aquecimento e lençóis 100% esterilizados para seu máximo conforto.'
        },
        {
          id: 'hl-1-3',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
          caption: 'Cantinho VIP com café Nespresso, chás naturais e espelho iluminado para suas fotos!'
        }
      ]
    },
    {
      id: 'hl-resultados',
      title: 'Antes & Depois',
      coverUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-2-1',
          url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=900&auto=format&fit=crop&q=80',
          caption: 'Transformação de olhar com Volume Brasileiro Y — leveza, curvatura e durabilidade de até 25 dias.'
        },
        {
          id: 'hl-2-2',
          url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop&q=80',
          caption: 'Design e alinhamento de sobrancelhas personalizado para o formato único do seu rosto.'
        }
      ]
    },
    {
      id: 'hl-certificados',
      title: 'Certificados',
      coverUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-3-1',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Formação Master Internacional em Lash & Brow Artistry com certificação reconhecida.'
        },
        {
          id: 'hl-3-2',
          url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&auto=format&fit=crop&q=80',
          caption: 'Protocolos rigorosos de biosegurança com esterilização cirúrgica em autoclave.'
        }
      ]
    }
  ],
  es: [
    {
      id: 'hl-espacio',
      title: 'Mi Estudio',
      coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-e-1',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80',
          caption: 'Un espacio íntimo, climatizado y diseñado para que te relajes y disfrutes de tu momento.'
        },
        {
          id: 'hl-e-2',
          url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=80',
          caption: 'Camilla ergonómica acolchada con sábanas descartables y desinfección grado médico.'
        },
        {
          id: 'hl-e-3',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
          caption: 'Rincón de cortesía con café espresso, infusiones y espejo con iluminación profesional.'
        }
      ]
    },
    {
      id: 'hl-resultados-es',
      title: 'Antes & Después',
      coverUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-res-1',
          url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=900&auto=format&fit=crop&q=80',
          caption: 'Volumen Brasileño ultra ligero. Mirada despierta, sin pesadez y con duración de hasta un mes.'
        },
        {
          id: 'hl-res-2',
          url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop&q=80',
          caption: 'Visagismo y laminado de cejas: realzamos tu belleza natural respetando tu fisionomía.'
        }
      ]
    },
    {
      id: 'hl-cuidados-es',
      title: 'Cuidados Post',
      coverUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-c-1',
          url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80',
          caption: 'Guía de cuidados: No mojar por 24h, evitar productos oleosos y peinar diariamente con tu cepillito.'
        }
      ]
    }
  ],
  en: [
    {
      id: 'hl-space-en',
      title: 'Studio Tour',
      coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-s-1',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=80',
          caption: 'Welcome to our studio! Designed for absolute comfort, relaxation, and bespoke beauty treatments.'
        }
      ]
    },
    {
      id: 'hl-beforeafter-en',
      title: 'Before & After',
      coverUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-ba-1',
          url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=900&auto=format&fit=crop&q=80',
          caption: 'Feather-light lash extension sets that protect your natural lash integrity and enhance your eyes.'
        }
      ]
    }
  ]
};

export const HighlightEditor: React.FC<HighlightEditorProps> = ({
  highlights,
  onChangeHighlights,
  onSave,
  lang,
  salonPhotos = [],
  salonName = 'GlowBeauty Pro',
  specialistName = 'Especialista',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  whatsapp = '',
  className = ''
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.es;

  // Selected highlight to view/edit its visual elements & stories
  const [selectedHighlightId, setSelectedHighlightId] = useState<string>(
    highlights[0]?.id || ''
  );

  // Modals state for Highlight Folder (Title + Cover)
  const [isEditingHighlightDetails, setIsEditingHighlightDetails] = useState<boolean>(false);
  const [highlightDetailsForm, setHighlightDetailsForm] = useState<{
    id?: string;
    title: string;
    coverUrl: string;
    isNew: boolean;
  }>({
    title: '',
    coverUrl: '',
    isNew: false
  });

  // Story Item Editor state (Title/Header, Visual Story Photo from Gallery, Description/Caption)
  const [editingStory, setEditingStory] = useState<{
    highlightId: string;
    storyId?: string;
    url: string;
    caption: string;
    isNew: boolean;
  } | null>(null);

  // Live Story Player Modal
  const [previewHighlight, setPreviewHighlight] = useState<ProfileHighlight | null>(null);
  const [previewStoryIndex, setPreviewStoryIndex] = useState<number>(0);

  // Toast notification
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Gallery photo upload states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [storyImageTab, setStoryImageTab] = useState<'upload' | 'salon' | 'presets' | 'url'>('upload');
  const [coverImageTab, setCoverImageTab] = useState<'upload' | 'salon' | 'presets' | 'url'>('upload');

  // Hidden file input refs
  const storyFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  // Active highlight object
  const activeHighlight = highlights.find((h) => h.id === selectedHighlightId) || highlights[0] || null;

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Gallery file upload handler with canvas optimization
  const handleStoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const dataUrl = await fileToOptimizedDataUrl(file, 1080, 1920, 0.85);
      if (editingStory) {
        setEditingStory({
          ...editingStory,
          url: dataUrl
        });
      }
      showToast(lang === 'pt' ? 'Foto da galeria carregada!' : lang === 'es' ? '¡Foto de la galería cargada con éxito!' : 'Gallery photo uploaded!');
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la foto');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleStoryDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const dataUrl = await fileToOptimizedDataUrl(file, 1080, 1920, 0.85);
      if (editingStory) {
        setEditingStory({
          ...editingStory,
          url: dataUrl
        });
      }
      showToast(lang === 'pt' ? 'Foto da galeria carregada!' : lang === 'es' ? '¡Foto de la galería cargada con éxito!' : 'Gallery photo uploaded!');
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const dataUrl = await fileToOptimizedDataUrl(file, 600, 600, 0.85);
      setHighlightDetailsForm((prev) => ({
        ...prev,
        coverUrl: dataUrl
      }));
      showToast(lang === 'pt' ? 'Foto de capa carregada!' : lang === 'es' ? '¡Foto de portada cargada con éxito!' : 'Cover photo uploaded!');
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la foto');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Highlight actions
  const handleOpenNewHighlightModal = () => {
    const defaultCover = CURATED_BEAUTY_IMAGES[0]?.url || avatarUrl;
    setHighlightDetailsForm({
      id: `hl-${Date.now()}`,
      title: lang === 'pt' ? 'Novo Destaque' : lang === 'es' ? 'Nuevo Destaque' : 'New Highlight',
      coverUrl: defaultCover,
      isNew: true
    });
    setCoverImageTab('upload');
    setIsEditingHighlightDetails(true);
  };

  const handleOpenEditHighlightModal = (hl: ProfileHighlight) => {
    setHighlightDetailsForm({
      id: hl.id,
      title: hl.title,
      coverUrl: hl.coverUrl,
      isNew: false
    });
    setCoverImageTab('upload');
    setIsEditingHighlightDetails(true);
  };

  const handleSaveHighlightDetails = () => {
    if (!highlightDetailsForm.title.trim()) {
      alert(lang === 'pt' ? 'Por favor insira um título' : 'Por favor ingresa un título');
      return;
    }

    let updated: ProfileHighlight[];
    if (highlightDetailsForm.isNew) {
      const newHl: ProfileHighlight = {
        id: highlightDetailsForm.id || `hl-${Date.now()}`,
        title: highlightDetailsForm.title.trim(),
        coverUrl: highlightDetailsForm.coverUrl.trim() || CURATED_BEAUTY_IMAGES[0].url,
        items: [
          {
            id: `story-${Date.now()}-1`,
            url: highlightDetailsForm.coverUrl.trim() || CURATED_BEAUTY_IMAGES[0].url,
            caption: lang === 'pt'
              ? 'Bem-vinda ao nosso destaque! Aqui você confere detalhes, dicas e informações exclusivas.'
              : lang === 'es'
              ? '¡Bienvenida a nuestro destaque! Aquí encontrarás detalles, recomendaciones e información exclusiva.'
              : 'Welcome to our highlight! Discover details, tips, and exclusive information.'
          }
        ]
      };
      updated = [...highlights, newHl];
      setSelectedHighlightId(newHl.id);
    } else {
      updated = highlights.map((hl) => {
        if (hl.id === highlightDetailsForm.id) {
          return {
            ...hl,
            title: highlightDetailsForm.title.trim(),
            coverUrl: highlightDetailsForm.coverUrl.trim() || hl.coverUrl
          };
        }
        return hl;
      });
    }

    onChangeHighlights(updated);
    setIsEditingHighlightDetails(false);
    showToast(lang === 'pt' ? 'Destaque atualizado!' : '¡Destaque actualizado con éxito!');
  };

  const handleDeleteHighlight = (hlId: string) => {
    const hl = highlights.find((h) => h.id === hlId);
    if (!hl) return;
    const confirmMsg = lang === 'pt'
      ? `Tem certeza que deseja excluir o destaque "${hl.title}" e todos os seus stories?`
      : `¿Estás segura de que deseas eliminar el destaque "${hl.title}" y todas sus historias?`;
    if (!window.confirm(confirmMsg)) return;

    const filtered = highlights.filter((h) => h.id !== hlId);
    onChangeHighlights(filtered);
    if (selectedHighlightId === hlId) {
      setSelectedHighlightId(filtered[0]?.id || '');
    }
    showToast(lang === 'pt' ? 'Destaque removido' : 'Destaque eliminado');
  };

  const handleMoveHighlight = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= highlights.length) return;
    const copy = [...highlights];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChangeHighlights(copy);
  };

  // Story actions
  const handleOpenAddStory = (highlightId: string) => {
    const hl = highlights.find((h) => h.id === highlightId);
    const defaultImg = hl?.coverUrl || CURATED_BEAUTY_IMAGES[0].url;
    setEditingStory({
      highlightId,
      storyId: `story-${Date.now()}`,
      url: defaultImg,
      caption: '',
      isNew: true
    });
    setStoryImageTab('upload');
  };

  const handleOpenEditStory = (highlightId: string, item: HighlightStoryItem) => {
    setEditingStory({
      highlightId,
      storyId: item.id,
      url: item.url,
      caption: item.caption || '',
      isNew: false
    });
    setStoryImageTab('upload');
  };

  const handleSaveStory = () => {
    if (!editingStory) return;
    if (!editingStory.url.trim()) {
      alert(lang === 'pt' ? 'Por favor escolha ou faça upload de uma foto' : 'Por favor elige o sube una foto de la galería');
      return;
    }

    const updated = highlights.map((hl) => {
      if (hl.id === editingStory.highlightId) {
        let newItems: HighlightStoryItem[];
        if (editingStory.isNew) {
          const newItem: HighlightStoryItem = {
            id: editingStory.storyId || `story-${Date.now()}`,
            url: editingStory.url.trim(),
            caption: editingStory.caption.trim()
          };
          newItems = [...(hl.items || []), newItem];
        } else {
          newItems = (hl.items || []).map((it) => {
            if (it.id === editingStory.storyId) {
              return {
                ...it,
                url: editingStory.url.trim(),
                caption: editingStory.caption.trim()
              };
            }
            return it;
          });
        }
        return {
          ...hl,
          items: newItems
        };
      }
      return hl;
    });

    onChangeHighlights(updated);
    setEditingStory(null);
    showToast(lang === 'pt' ? 'História salva com sucesso!' : '¡Historia guardada con éxito!');
  };

  const handleDeleteStory = (highlightId: string, storyId: string) => {
    const confirmMsg = lang === 'pt'
      ? 'Deseja excluir esta história do destaque?'
      : '¿Deseas eliminar esta historia del destaque?';
    if (!window.confirm(confirmMsg)) return;

    const updated = highlights.map((hl) => {
      if (hl.id === highlightId) {
        return {
          ...hl,
          items: (hl.items || []).filter((it) => it.id !== storyId)
        };
      }
      return hl;
    });

    onChangeHighlights(updated);
    showToast(lang === 'pt' ? 'História removida' : 'Historia eliminada');
  };

  const handleMoveStory = (highlightId: string, index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const hl = highlights.find((h) => h.id === highlightId);
    if (!hl || !hl.items) return;
    if (targetIndex < 0 || targetIndex >= hl.items.length) return;

    const newItems = [...hl.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = highlights.map((h) => {
      if (h.id === highlightId) {
        return { ...h, items: newItems };
      }
      return h;
    });

    onChangeHighlights(updated);
  };

  const handleRestoreDefaultTemplates = () => {
    const confirmMsg = lang === 'pt'
      ? 'Deseja carregar a sugestão de destaques recomendados? Os destaques atuais serão substituídos.'
      : '¿Deseas cargar la sugerencia de destaques recomendados? Tus destaques actuales serán reemplazados con plantillas optimizadas.';
    if (!window.confirm(confirmMsg)) return;

    const template = RECOMMENDED_HIGHLIGHTS_TEMPLATES[lang] || RECOMMENDED_HIGHLIGHTS_TEMPLATES.es;
    onChangeHighlights(template);
    setSelectedHighlightId(template[0]?.id || '');
    showToast(lang === 'pt' ? 'Destaques padrão carregados!' : '¡Destaques recomendados cargados!');
  };

  const handleApplyCaptionTemplate = (templateText: string) => {
    if (!editingStory) return;
    setEditingStory({
      ...editingStory,
      caption: templateText
    });
  };

  const handleTriggerDirectStoryGalleryPick = () => {
    storyFileInputRef.current?.click();
  };

  const handleTriggerDirectCoverGalleryPick = () => {
    coverFileInputRef.current?.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-zinc-900/95 text-white px-4 py-3 rounded-xl shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <span>{t.highlightsManagerTitle || 'Historias Destacadas (Estilo Instagram)'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {highlights.length} {lang === 'pt' ? 'destaques' : 'destaques'}
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lang === 'pt'
                    ? 'Gerencie títulos, fotos da galeria e descrições com informações que suas clientes verão antes de agendar.'
                    : lang === 'es'
                    ? 'Gestiona títulos, fotos de la galería y descripciones informativas que tus clientas verán antes de reservar.'
                    : 'Manage titles, gallery photos, and informative descriptions your clients will view before booking.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaultTemplates}
              className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Cargar plantillas de destaques recomendadas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Restaurar Padrão' : lang === 'es' ? 'Plantillas Sugeridas' : 'Load Presets'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewHighlightModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addHighlightBtn || 'Crear Nuevo Destaque'}</span>
            </button>

            {onSave && (
              <button
                type="button"
                onClick={() => onSave(highlights)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Salvar Destaques' : 'Guardar Destaques'}</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: Instagram-like Circular Highlights Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <FolderHeart className="w-4 h-4 text-rose-500" />
              <span>{lang === 'pt' ? 'Círculos de Destaque' : 'Círculos de Destaque Activos'}</span>
            </span>
            <span className="text-xs text-zinc-600">
              {lang === 'pt' ? 'Clique em um círculo para editar seu conteúdo' : 'Haz clic en un círculo para editar sus fotos y textos'}
            </span>
          </div>

          <div className="p-4 bg-gradient-to-b from-zinc-50/80 to-zinc-100/40 border border-zinc-200/80 rounded-2xl overflow-x-auto no-scrollbar">
            <div className="flex items-start gap-4 sm:gap-6 min-w-max">
              {/* Add Highlight Circle Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenNewHighlightModal}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-zinc-300 hover:border-rose-400 bg-white hover:bg-rose-50/50 flex flex-col items-center justify-center gap-1 transition-all group shadow-2xs"
                  title="Crear un nuevo círculo de destaque"
                >
                  <Plus className="w-6 h-6 text-zinc-400 group-hover:text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-rose-600">
                    {lang === 'pt' ? 'Novo' : 'Nuevo'}
                  </span>
                </button>
                <span className="text-[11px] font-semibold text-zinc-500 max-w-[70px] text-center truncate">
                  {lang === 'pt' ? 'Adicionar' : 'Agregar'}
                </span>
              </div>

              {/* Highlight Bubbles */}
              {highlights.map((hl, index) => {
                const isSelected = hl.id === (activeHighlight?.id || selectedHighlightId);
                const storiesCount = hl.items?.length || 0;

                return (
                  <div key={hl.id} className="flex flex-col items-center gap-1.5 relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedHighlightId(hl.id)}
                      className={`relative p-0.5 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'ring-3 ring-rose-500 ring-offset-2 ring-offset-white scale-105 shadow-md'
                          : 'hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      title={`Ver contenido de "${hl.title}"`}
                    >
                      {/* Gradient Ring Border */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-xs">
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                          <img
                            src={hl.coverUrl || CURATED_BEAUTY_IMAGES[0].url}
                            alt={hl.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>

                      {/* Stories counter badge */}
                      <span className="absolute bottom-0 right-0 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                        {storiesCount}
                      </span>
                    </button>

                    {/* Title under circle */}
                    <span
                      onClick={() => setSelectedHighlightId(hl.id)}
                      className={`text-[11px] font-bold max-w-[75px] sm:max-w-[85px] text-center truncate cursor-pointer transition-colors ${
                        isSelected ? 'text-rose-600 font-extrabold' : 'text-zinc-700 hover:text-zinc-900'
                      }`}
                    >
                      {hl.title}
                    </span>

                    {/* Quick highlight actions (Reorder & Edit) */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveHighlight(index, 'left')}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                          title="Mover a la izquierda"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditHighlightModal(hl)}
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Editar título y foto de portada"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {index < highlights.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveHighlight(index, 'right')}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                          title="Mover a la derecha"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: Active Highlight Content & Visual Story Elements Manager */}
        {activeHighlight ? (
          <div className="space-y-4 pt-2">
            {/* Active Highlight Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-500 shrink-0">
                  <img
                    src={activeHighlight.coverUrl || CURATED_BEAUTY_IMAGES[0].url}
                    alt={activeHighlight.title}
                    className="w-full h-full object-cover rounded-full border border-white"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">
                      {activeHighlight.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleOpenEditHighlightModal(activeHighlight)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{lang === 'pt' ? 'Mudar título / capa' : 'Cambiar título / portada'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {activeHighlight.items?.length || 0}{' '}
                    {lang === 'pt' ? 'histórias/slides publicados neste destaque' : 'historias/slides publicadas con fotos y textos'}
                  </p>
                </div>
              </div>

              {/* Action buttons for active highlight */}
              <div className="flex items-center gap-2">
                {/* Live Preview Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewHighlight(activeHighlight);
                    setPreviewStoryIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Probar en simulador de teléfono móvil"
                >
                  <Play className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'pt' ? 'Ver Stories' : 'Previsualizar Historias'}</span>
                </button>

                {/* Add Story Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAddStory(activeHighlight.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'pt' ? 'Adicionar História / Foto' : 'Añadir Historia / Foto'}</span>
                </button>

                {/* Delete Highlight */}
                {highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(activeHighlight.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar este destaque completo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Story Slides for this Highlight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C4A480]" />
                  <span>{lang === 'pt' ? 'Diapositivos / Stories Deste Destaque' : 'Historias y Contenido Visual'}</span>
                </span>
                <span className="text-xs text-zinc-600">
                  {lang === 'pt' ? 'Fotos da galeria com textos informativos' : 'Sube fotos de tu galería y personaliza la información de cada una'}
                </span>
              </div>

              {(!activeHighlight.items || activeHighlight.items.length === 0) ? (
                <div className="p-8 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">
                      {lang === 'pt' ? 'Nenhuma história neste destaque' : 'Este destaque aún no tiene fotos ni historias'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      {lang === 'pt'
                        ? 'Adicione fotos da sua galeria do celular e coloque dicas, cuidados ou informações para suas clientes.'
                        : 'Sube fotos desde tu galería (celular o PC) y redacta la información clave que convencerá a tus clientas.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddStory(activeHighlight.id)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'pt' ? 'Adicionar Primeira História' : 'Subir Foto y Añadir Historia'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeHighlight.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[9/12] w-full overflow-hidden bg-zinc-900">
                        <img
                          src={item.url}
                          alt={`Historia ${itemIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Slide Badge */}
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                          <span>Slide #{itemIdx + 1}</span>
                        </div>

                        {/* Top Right Quick Reorder & Delete */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs p-1 rounded-lg border border-white/20">
                          {itemIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveStory(activeHighlight.id, itemIdx, 'up')}
                              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                              title="Subir de posición"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {itemIdx < activeHighlight.items.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveStory(activeHighlight.id, itemIdx, 'down')}
                              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                              title="Bajar de posición"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(activeHighlight.id, item.id)}
                            className="p-1 rounded text-red-300 hover:text-red-100 hover:bg-red-500/40 transition-colors ml-0.5"
                            title="Eliminar esta foto/historia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Gradient Overlay on Thumbnail */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6 text-white">
                          <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                            {item.caption ? (
                              item.caption
                            ) : (
                              <span className="italic text-zinc-300">
                                {lang === 'pt' ? '(Sem texto explicativo)' : '(Sin descripción de texto)'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom: Edit Information Button */}
                      <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStory(activeHighlight.id, item)}
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-zinc-200 hover:border-rose-300 hover:text-rose-600 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                          <span>{lang === 'pt' ? 'Editar Foto & Texto' : 'Editar Foto y Descripción'}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Story Card */}
                  <div
                    onClick={() => handleOpenAddStory(activeHighlight.id)}
                    className="aspect-[9/12] rounded-2xl border-2 border-dashed border-zinc-200 hover:border-rose-400 bg-zinc-50/50 hover:bg-rose-50/30 transition-all flex flex-col items-center justify-center gap-2 p-4 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 group-hover:border-rose-300 flex items-center justify-center text-zinc-400 group-hover:text-rose-600 group-hover:scale-110 transition-all shadow-xs">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-600 group-hover:text-rose-600">
                      {lang === 'pt' ? '+ Adicionar História' : '+ Añadir Otra Historia'}
                    </span>
                    <span className="text-[11px] text-zinc-600 text-center">
                      {lang === 'pt' ? 'Foto da galeria com texto' : 'Sube foto de la galería con información explicativa'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT HIGHLIGHT DETAILS (TITLE & COVER PHOTO)     */}
      {/* ======================================================== */}
      {isEditingHighlightDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-100 space-y-5 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <FolderHeart className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {highlightDetailsForm.isNew
                      ? lang === 'pt' ? 'Criar Novo Destaque' : 'Crear Nuevo Destaque'
                      : lang === 'pt' ? 'Editar Destaque' : 'Editar Destaque'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {lang === 'pt'
                      ? 'Defina o título e a foto de capa que aparecerá no círculo.'
                      : 'Define el título y la foto de portada que aparecerá en el círculo.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingHighlightDetails(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden cover file input */}
            <input
              type="file"
              ref={coverFileInputRef}
              onChange={handleCoverFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Highlight Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  {lang === 'pt' ? 'Título do Destaque (Nome no Círculo)' : 'Título del Destaque (Nombre en el Círculo)'}
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={highlightDetailsForm.title}
                  onChange={(e) =>
                    setHighlightDetailsForm({ ...highlightDetailsForm, title: e.target.value })
                  }
                  placeholder={lang === 'pt' ? 'Ex: Cuidados Pós, Resultados...' : 'Ej: Cuidados Post, Mi Espacio, Antes & Después...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-sm font-medium"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-600">
                  <span>{lang === 'pt' ? 'Recomendado: 1 a 2 palavras curtas' : 'Recomendado: nombres cortos para que se lean completos'}</span>
                  <span>{highlightDetailsForm.title.length}/25</span>
                </div>

                {/* Quick Title Suggestions */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    {lang === 'pt' ? '💡 Sugestões rápidas de títulos:' : '💡 Sugerencias rápidas de títulos:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(TITLE_SUGGESTIONS[lang] || TITLE_SUGGESTIONS.es).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() =>
                          setHighlightDetailsForm({ ...highlightDetailsForm, title: sug })
                        }
                        className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-700 text-zinc-700 text-[11px] font-medium transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Photo Preview & Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  {lang === 'pt' ? 'Foto de Capa do Círculo' : 'Foto de Portada del Círculo'}
                </label>

                {/* Live Circle Preview */}
                <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 mb-3">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                      <img
                        src={highlightDetailsForm.coverUrl || CURATED_BEAUTY_IMAGES[0].url}
                        alt="Preview Capa"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">
                      {highlightDetailsForm.title || (lang === 'pt' ? 'Nome do Destaque' : 'Nombre del Destaque')}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {lang === 'pt' ? 'Assim suas clientes verão este destaque' : 'Así se visualizará el círculo en tu perfil'}
                    </span>
                  </div>
                </div>

                {/* Cover Selector Tabs */}
                <div className="flex border-b border-zinc-200 mb-3 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCoverImageTab('upload')}
                    className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                      coverImageTab === 'upload'
                        ? 'border-rose-600 text-rose-600'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Subir da Galeria' : 'Subir de Galería'}</span>
                  </button>
                  {salonPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCoverImageTab('salon')}
                      className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                        coverImageTab === 'salon'
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Fotos do Salão' : 'Fotos del Salón'} ({salonPhotos.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCoverImageTab('presets')}
                    className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                      coverImageTab === 'presets'
                        ? 'border-rose-600 text-rose-600'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Presets' : 'Presets Pro'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImageTab('url')}
                    className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                      coverImageTab === 'url'
                        ? 'border-rose-600 text-rose-600'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>URL</span>
                  </button>
                </div>

                {/* Tab: Direct Gallery Upload */}
                {coverImageTab === 'upload' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={handleTriggerDirectCoverGalleryPick}
                      className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 text-rose-700 flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                      ) : (
                        <Camera className="w-6 h-6 text-rose-500" />
                      )}
                      <span className="text-xs font-bold">
                        {isUploadingPhoto
                          ? (lang === 'pt' ? 'Processando foto...' : 'Optimizando foto...')
                          : (lang === 'pt' ? 'Escolher Foto da Galeria do Aparelho' : 'Elegir Foto desde la Galería de tu Dispositivo')}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {lang === 'pt' ? 'PNG, JPG ou WEBP (celular ou computador)' : 'PNG, JPG o WEBP (desde tu celular o computadora)'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Tab: Salon Photos */}
                {coverImageTab === 'salon' && (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {salonPhotos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setHighlightDetailsForm({ ...highlightDetailsForm, coverUrl: p.url })
                        }
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                          highlightDetailsForm.coverUrl === p.url
                            ? 'border-rose-500 ring-2 ring-rose-300 scale-95'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        {highlightDetailsForm.coverUrl === p.url && (
                          <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Curated Presets */}
                {coverImageTab === 'presets' && (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {CURATED_BEAUTY_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setHighlightDetailsForm({ ...highlightDetailsForm, coverUrl: img.url })
                        }
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative group ${
                          highlightDetailsForm.coverUrl === img.url
                            ? 'border-rose-500 ring-2 ring-rose-300 scale-95'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                        title={img.title}
                      >
                        <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                        {highlightDetailsForm.coverUrl === img.url && (
                          <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: URL input */}
                {coverImageTab === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={highlightDetailsForm.coverUrl}
                      onChange={(e) =>
                        setHighlightDetailsForm({ ...highlightDetailsForm, coverUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsEditingHighlightDetails(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold"
              >
                {lang === 'pt' ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleSaveHighlightDetails}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Salvar Destaque' : 'Guardar Destaque'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT STORY ITEM (VISUAL PHOTO FROM GALLERY & INFORMATIVE CAPTION) */}
      {/* ========================================================================= */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-100 space-y-5 my-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {editingStory.isNew
                      ? lang === 'pt' ? 'Adicionar Nova História' : 'Añadir Nueva Historia / Diapositiva'
                      : lang === 'pt' ? 'Editar História e Informação' : 'Editar Foto y Descripción de la Historia'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {lang === 'pt'
                      ? 'Escolha uma foto da galeria e escreva o texto explicativo (cuidados, preços, biossegurança).'
                      : 'Elige una foto desde tu galería y redacta la información explicativa para tus clientas.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden file input for device gallery upload */}
            <input
              type="file"
              ref={storyFileInputRef}
              onChange={handleStoryFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Modal Body: Split between visual preview / photo picker and caption builder */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Visual Photo Preview & Upload (5 Cols) */}
              <div className="md:col-span-5 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  {lang === 'pt' ? '1. Foto do Story' : '1. Foto de la Historia'}
                </label>

                {/* Vertical Phone-ratio Preview Container */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleStoryDrop}
                  className="relative aspect-[9/14] w-full rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-200 shadow-md group"
                >
                  {editingStory.url ? (
                    <img
                      src={editingStory.url}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-400">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">
                        {lang === 'pt' ? 'Nenhuma foto selecionada' : 'Ninguna foto seleccionada'}
                      </span>
                    </div>
                  )}

                  {/* Drag and Drop overlay & upload trigger */}
                  <div
                    onClick={handleTriggerDirectStoryGalleryPick}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-white text-center cursor-pointer backdrop-blur-2xs"
                  >
                    <Upload className="w-8 h-8 text-rose-400" />
                    <span className="text-xs font-bold">
                      {lang === 'pt' ? 'Clique para trocar pela galeria' : 'Haz clic para cambiar desde tu galería'}
                    </span>
                    <span className="text-[10px] text-zinc-300">
                      {lang === 'pt' ? 'ou arraste uma imagem aqui' : 'o arrastra una imagen aquí'}
                    </span>
                  </div>

                  {/* Caption badge preview at bottom */}
                  {editingStory.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 text-white">
                      <p className="text-[11px] line-clamp-3 leading-snug font-medium">
                        {editingStory.caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Upload Button from Device Gallery */}
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={handleTriggerDirectStoryGalleryPick}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {isUploadingPhoto
                      ? (lang === 'pt' ? 'Carregando foto...' : 'Cargando foto...')
                      : (lang === 'pt' ? 'Subir Foto da Galeria' : 'Subir Foto de la Galería')}
                  </span>
                </button>
              </div>

              {/* Right Column: Photo Source Selector & Information Caption (7 Cols) */}
              <div className="md:col-span-7 space-y-4">
                {/* Photo Sources Selector Tabs */}
                <div>
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1.5">
                    {lang === 'pt' ? 'Outras Opções de Foto' : 'Opciones para la Foto'}
                  </span>

                  <div className="flex border-b border-zinc-200 gap-3 text-xs font-semibold mb-2">
                    <button
                      type="button"
                      onClick={() => setStoryImageTab('upload')}
                      className={`pb-1.5 border-b-2 flex items-center gap-1 ${
                        storyImageTab === 'upload'
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Galeria' : 'Galería'}</span>
                    </button>
                    {salonPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setStoryImageTab('salon')}
                        className={`pb-1.5 border-b-2 flex items-center gap-1 ${
                          storyImageTab === 'salon'
                            ? 'border-rose-600 text-rose-600'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{lang === 'pt' ? 'Do Meu Salão' : 'De Mi Salón'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStoryImageTab('presets')}
                      className={`pb-1.5 border-b-2 flex items-center gap-1 ${
                        storyImageTab === 'presets'
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Fotos Estúdio' : 'Fotos Pro'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoryImageTab('url')}
                      className={`pb-1.5 border-b-2 flex items-center gap-1 ${
                        storyImageTab === 'url'
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>URL</span>
                    </button>
                  </div>

                  {/* Salon Photos Picker */}
                  {storyImageTab === 'salon' && (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-zinc-50 rounded-xl border border-zinc-200">
                      {salonPhotos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setEditingStory({ ...editingStory, url: p.url })}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                            editingStory.url === p.url ? 'border-rose-500 ring-2 ring-rose-300' : 'border-zinc-200'
                          }`}
                        >
                          <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Stock Preset Picker */}
                  {storyImageTab === 'presets' && (
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-zinc-50 rounded-xl border border-zinc-200">
                      {CURATED_BEAUTY_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditingStory({ ...editingStory, url: img.url })}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                            editingStory.url === img.url ? 'border-rose-500 ring-2 ring-rose-300' : 'border-zinc-200'
                          }`}
                          title={img.title}
                        >
                          <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* URL Input */}
                  {storyImageTab === 'url' && (
                    <input
                      type="url"
                      value={editingStory.url}
                      onChange={(e) => setEditingStory({ ...editingStory, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-rose-500"
                    />
                  )}
                </div>

                {/* Informative Description / Caption Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>{lang === 'pt' ? '2. Informação / Descrição da História' : '2. Información y Descripción de la Historia'}</span>
                    </label>
                    <span className="text-[11px] text-zinc-600">
                      {editingStory.caption.length} {lang === 'pt' ? 'caracteres' : 'caracteres'}
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={editingStory.caption}
                    onChange={(e) => setEditingStory({ ...editingStory, caption: e.target.value })}
                    placeholder={
                      lang === 'pt'
                        ? 'Escreva a descrição explicativa que aparecerá no rodapé do story (ex: cuidados, biosegurança, tempo de duração, promoção)...'
                        : 'Escribe la descripción explicativa que aparecerá al pie de la historia (ej: cuidados, técnica utilizada, bioseguridad, precios)...'
                    }
                    className="w-full p-3 rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs font-medium leading-relaxed"
                  />

                  {/* Quick High-Converting Template Inspirations */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-zinc-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C4A480]" />
                      <span>{lang === 'pt' ? 'Modelos de textos prontos para inserir:' : 'Plantillas de información listas para insertar:'}</span>
                    </span>

                    <div className="grid grid-cols-2 gap-1.5">
                      {(STORY_INFO_TEMPLATES[lang] || STORY_INFO_TEMPLATES.es).map((tmpl, idx) => {
                        const Icon = tmpl.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleApplyCaptionTemplate(tmpl.text)}
                            className="p-2 rounded-xl bg-zinc-50 hover:bg-rose-50 hover:border-rose-300 border border-zinc-200 text-left transition-colors flex items-center gap-2 group"
                          >
                            <span className="p-1 rounded-md bg-white text-zinc-600 group-hover:text-rose-600 shadow-2xs">
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-700 group-hover:text-rose-700 truncate">
                              {tmpl.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setEditingStory(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold"
              >
                {lang === 'pt' ? 'Cancelar' : 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleSaveStory}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Salvar História' : 'Guardar Historia'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INTERACTIVE LIVE STORY PLAYER (PHONE SIMULATOR) */}
      {/* ======================================================== */}
      {previewHighlight && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          {/* Phone Mockup Frame */}
          <div className="relative w-full max-w-sm aspect-[9/18.5] max-h-[92vh] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-zinc-800 flex flex-col">
            {/* Top Instagram Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
              {(previewHighlight.items || []).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < previewStoryIndex
                        ? 'w-full'
                        : idx === previewStoryIndex
                        ? 'w-full animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Top Story Header with Avatar & Salon Name */}
            <div className="absolute top-7 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-500">
                  <img
                    src={avatarUrl}
                    alt={specialistName}
                    className="w-full h-full object-cover rounded-full border border-white"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {salonName}
                  </span>
                  <span className="text-[10px] text-white/80 block">
                    {previewHighlight.title} • {previewStoryIndex + 1}/{previewHighlight.items?.length || 1}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewHighlight(null)}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Slide Photo */}
            <div className="relative flex-1 w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
              {previewHighlight.items && previewHighlight.items[previewStoryIndex] ? (
                <img
                  src={previewHighlight.items[previewStoryIndex].url}
                  alt="Story photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-zinc-500 text-xs">
                  {lang === 'pt' ? 'Sem fotos neste destaque' : 'Sin fotos en este destaque'}
                </div>
              )}

              {/* Tap Left / Tap Right Navigation Zones */}
              <div
                onClick={() => {
                  if (previewStoryIndex > 0) {
                    setPreviewStoryIndex(previewStoryIndex - 1);
                  }
                }}
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                title="Historia anterior"
              />
              <div
                onClick={() => {
                  if (
                    previewHighlight.items &&
                    previewStoryIndex < previewHighlight.items.length - 1
                  ) {
                    setPreviewStoryIndex(previewStoryIndex + 1);
                  } else {
                    setPreviewHighlight(null);
                  }
                }}
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
                title="Siguiente historia"
              />
            </div>

            {/* Bottom Translucent Info Card & WhatsApp/Booking Button */}
            <div className="absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-black via-black/85 to-transparent space-y-3">
              {previewHighlight.items && previewHighlight.items[previewStoryIndex]?.caption && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-white max-h-36 overflow-y-auto no-scrollbar shadow-lg">
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-white/95">
                    {previewHighlight.items[previewStoryIndex].caption}
                  </p>
                </div>
              )}

              {/* Action Buttons for Clients */}
              <div className="flex items-center gap-2 pt-1">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(whatsapp)}?text=${encodeURIComponent(
                      lang === 'pt'
                        ? `Olá! Vi o destaque "${previewHighlight.title}" e gostaria de mais informações.`
                        : `¡Hola! Vi el destaque "${previewHighlight.title}" y quisiera consultar disponibilidad.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewHighlight(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Agendar Agora' : 'Reservar Cita'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
