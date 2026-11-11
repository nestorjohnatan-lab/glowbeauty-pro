import { BeautyProProfile, BeautyService, Appointment, WhatsAppTemplate, DaySchedule, ClientTechnicalNote } from '../types';

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false }, // Domingo fechado
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' }, // Segunda
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' }, // Terça
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' }, // Quarta
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:30', hasBreak: true, breakStart: '12:30', breakEnd: '13:30' }, // Quinta
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '20:00', hasBreak: false }, // Sexta
  { dayOfWeek: 6, isOpen: true, openTime: '08:30', closeTime: '18:00', hasBreak: false }  // Sábado
];

export const INITIAL_CLIENT_TECHNICAL_NOTES: Record<string, ClientTechnicalNote> = {
  '+5511991223344': {
    id: 'note-larissa',
    clientPhone: '+5511991223344',
    clientName: 'Larissa Mendonça',
    serviceCategory: 'pestañas',
    lashCurvature: 'Curva D',
    lashThickness: '0.07 mm',
    lashLengths: '9mm - 13mm',
    lashMapping: 'Fox Eyes / Cat Eye (pontas alongadas)',
    lashAdhesive: 'Cola Premium 1s hipoalergênica',
    skinType: 'Mista con zona T oleosa',
    makeupFoundationTone: 'MAC NC25 (Subtono Cálido)',
    makeupFinishPreference: 'Glow natural ligero',
    makeupLipTone: 'Nude melocotón hidratante',
    nailTechnique: 'Fibra de Vidrio',
    nailShape: 'Almendra media',
    nailColorFavorite: 'Esmalte Nude Chic + Top Coat Ultra Brillo',
    allergies: 'Sensibilidad a cinta micropore común (usar cinta de silicona)',
    personalPreferences: 'Prefiere música suave / lo-fi en volumen bajo. Sin conversación durante el aislamiento de pestañas.',
    generalNotes: 'Pestañas naturales sanas con buena densidad. Retención excelente de 24 días en su última visita.',
    lastUpdated: new Date().toISOString().split('T')[0],
    tags: ['Cat Eye', 'Curva D', 'Cinta Silicona', 'Lofi Lover']
  },
  '+5511984445566': {
    id: 'note-beatriz',
    clientPhone: '+5511984445566',
    clientName: 'Beatriz Almeida',
    serviceCategory: 'cejas',
    browOrHairPigment: 'Castaño Claro Dorado (Refectocil 3.1 + oxidante suave 3%)',
    makeupFoundationTone: 'Estée Lauder 2N1 Desert Beige (Subtono Neutro)',
    skinType: 'Seca y sensible',
    makeupFinishPreference: 'Acabado satinado hidratante',
    makeupLipTone: 'Gloss labial con ácido hialurónico',
    nailTechnique: 'Blindaje de Diamante',
    nailShape: 'Cuadrada con esquinas suaves',
    nailColorFavorite: 'Francesita clásica fina',
    allergies: 'Sin alergias conocidas. Piel con leve enrojecimiento post-pinza (aplicar gel de manzanilla).',
    personalPreferences: 'Le encanta café con leche caliente. Le gusta que le expliquen cada paso del procedimiento.',
    generalNotes: 'Brow Lamination ideal para alinear pelos rebeldes de la cola de la ceja.',
    lastUpdated: new Date().toISOString().split('T')[0],
    tags: ['Brow Lamination', 'Piel Seca', 'Café con Leche', 'Neutro 2N1']
  },
  '+5511973332211': {
    id: 'note-juliana',
    clientPhone: '+5511973332211',
    clientName: 'Juliana Paes Costa',
    serviceCategory: 'uñas',
    nailTechnique: 'Extensión en Fibra de Vidrio + Gel Builder',
    nailShape: 'Almendra moderna',
    nailColorFavorite: 'Vía Láctea con Glazed Donut Chrome',
    skinType: 'Normal',
    makeupFoundationTone: 'Fenty Beauty 210 (Subtono Cálido)',
    lashCurvature: 'Curva C',
    lashThickness: '0.15 mm',
    lashMapping: 'Efecto Ojo de Muñeca (Doll Eye 10-12mm)',
    allergies: 'Sensible a monómero acrílico fuerte (usar siempre gel led/uv sin olor).',
    personalPreferences: 'Prefiere sesiones ágiles. Agua con gas fría.',
    generalNotes: 'Lecho ungueal largo, crecimiento rápido. Mantenimiento regular cada 20 a 25 días.',
    lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    tags: ['Soft Gel', 'Almendra', 'Glazed Donut', 'Sin Acrílico']
  },
  '+5511961118899': {
    id: 'note-fernanda',
    clientPhone: '+5511961118899',
    clientName: 'Fernanda Rocha',
    serviceCategory: 'pestañas',
    lashCurvature: 'Curva D + C en lagrimal',
    lashThickness: 'Fibras Y 0.15 tecnológicas',
    lashLengths: '8mm a 12mm',
    lashMapping: 'Efecto Ardilla / Delineado',
    lashAdhesive: 'Adhesivo transparente de baja emisión',
    makeupFoundationTone: 'MAC NC30',
    skinType: 'Grasa con tendencia a brillos',
    makeupFinishPreference: 'Mate aterciopelado de larga duración',
    makeupLipTone: 'Labial Mate Terracota',
    allergies: 'Sensibilidad a luz directa de lámpara (apuntar en diagonal, usar parches fríos).',
    personalPreferences: 'Manta suave en la camilla. Le gusta escuchar podcasts o charla amena.',
    generalNotes: 'El Volumen Brasileño le dura más de 28 días. Siempre acude puntual a su mantenimiento.',
    lastUpdated: new Date(Date.now() - 86400000 * 22).toISOString().split('T')[0],
    tags: ['Volumen Brasileño', 'Luz Diagonal', 'Fibras Y', 'NC30']
  }
};

export const INITIAL_PRO_PROFILE: BeautyProProfile = {
  id: 'pro-camila-01',
  slug: 'camila-studio',
  name: 'Camila Santos',
  businessName: 'Camila Santos · Studio & Lash Design',
  headline: 'Master Lash Designer & Micropigmentadora Certificada',
  bio: 'Especialista em olhar com mais de 5 anos de experiência. Cílios com efeito natural, Volume Brasileiro, Lash Lifting e Design de Sobrancelhas Visagista. Atendimento exclusivo e produtos dermatologicamente testados.',
  whatsapp: '+5511989218844',
  instagram: '@camilasantos.beauty',
  tiktok: '@camilasantos.lashes',
  pixKey: '11989218844',
  pixType: 'celular',
  bankPaymentDetails: {
    enabled: true,
    preferenceMethod: 'both',
    pixKeyType: 'celular',
    pixKey: '11989218844',
    pixBeneficiaryName: 'Camila Santos · Studio & Lash Design',
    pixCity: 'São Paulo',
    bankName: 'Nubank (Nu Pagamentos S.A.)',
    accountType: 'corrente',
    accountNumber: '9283741-2',
    agencyNumber: '0001',
    accountHolderName: 'Camila Santos de Oliveira',
    accountHolderDocument: '348.912.448-90',
    interbankCodeOrAlias: 'camila.studio.nubank',
    requireDeposit: true,
    depositType: 'fixed',
    depositAmount: 30,
    paymentDeadlineHours: 2,
    instructions: 'Por favor envie o comprovante do sinal por este WhatsApp em até 2 horas para confirmar e reservar seu horário.'
  },
  address: 'Rua Oscar Freire, 1240 - Jardins',
  neighborhood: 'Cerqueira César / Jardins',
  city: 'São Paulo',
  state: 'SP',
  countryCode: 'BR',
  modality: 'studio',
  currency: 'BRL',
  workingDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  workingHours: {
    start: '09:00',
    end: '19:30'
  },
  weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
  slotDurationMinutes: 60,
  requireDeposit: true,
  depositPercentage: 20,
  depositFixedAmount: 30,
  bookingPolicy: 'Tolerância de 10 minutos. Para atendimento de cílios, favor vir sem máscara de cílios e sem maquiagem na região dos olhos. Remarcações com no mínimo 4h de antecedência.',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
  themeColor: 'gold',
  language: 'pt',
  clientTechnicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES,
  salonPhotos: [
    {
      id: 'photo-espaco-1',
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      title: 'Recepção e Sala de Espera Aconchegante',
      category: 'espaco'
    },
    {
      id: 'photo-espaco-2',
      url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=80',
      title: 'Maca Ergonômica com Iluminação Profissional',
      category: 'espaco'
    },
    {
      id: 'photo-espaco-3',
      url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&auto=format&fit=crop&q=80',
      title: 'Bancada de Nail Bar & Esmaltação em Gel',
      category: 'espaco'
    },
    {
      id: 'photo-espaco-4',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      title: 'Cantinho do Café & Espelho para Fotos',
      category: 'espaco'
    }
  ],
  highlights: [
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
          caption: 'Brow Lamination com alinhamento dos fios rebeldes + hidratação profunda com ácido hialurônico.'
        },
        {
          id: 'hl-2-3',
          url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&auto=format&fit=crop&q=80',
          caption: 'Alongamento em Fibra de Vidro formato Amendoado com esmaltação nude chic.'
        }
      ]
    },
    {
      id: 'hl-certificados',
      title: 'Certificados',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-3-1',
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: 'Certificação Master Lash Designer por Academia Internacional de Estética do Olhar.'
        },
        {
          id: 'hl-3-2',
          url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&auto=format&fit=crop&q=80',
          caption: 'Biossegurança e Esterilização em Autoclave Hospitalar — sua saúde em primeiro lugar sempre.'
        }
      ]
    },
    {
      id: 'hl-depoimentos',
      title: 'Avaliações ⭐',
      coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'hl-4-1',
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=80',
          caption: '“A Camila tem mãos de fada! Faço meus cílios há 2 anos e nunca estragaram os meus naturais.” — Larissa M.'
        },
        {
          id: 'hl-4-2',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
          caption: '“O espaço é impecável, limpo e super acolhedor. Não troco por nada em São Paulo!” — Gabriela T.'
        }
      ]
    }
  ],
  customShareText: '🌸 Olá! Já está disponível minha agenda online com nosso catálogo completo de serviços, fotos dos resultados e horários disponíveis!\n\n👉 Acesse e reserve seu horário exclusivo: {link}',
  customBioText: '✨ Especialista em Beleza & Bem-estar\n💖 Realce seu olhar com elegância e sofisticação\n📍 Agende seu horário online no link abaixo 👇\n{link}'
};

export const INITIAL_SERVICES: BeautyService[] = [
  {
    id: 'srv-lashes-brasileiro',
    category: 'pestañas',
    name: 'Volume Brasileiro (Fio Tecnológico Y)',
    description: 'Técnica queridinha no Brasil! Fios em formato Y ultraleves que conferem densidade marcante, efeito delineado e toque suave sem pesar o fio natural.',
    durationMinutes: 110,
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 21,
    maintenanceNote: 'Recomendamos manutenção entre 18 e 21 dias para repor os fios que caíram no ciclo natural de renovação.',
    prepInstructions: 'Chegar com a região dos olhos sem rímel, óleos ou maquiagem. Retirar lentes de contato se utilizar.',
    careInstructions: 'Não molhar as extensões nas primeiras 12 a 24 horas. Evitar água quente no rosto e nunca usar rímel ou demaquilante bifásico.',
    isActive: true,
    popular: true
  },
  {
    id: 'srv-lashes-classico',
    category: 'pestañas',
    name: 'Extensão Clássica Fio a Fio',
    description: 'Aplicação delicada de uma extensão sobre cada cílio natural. Realça o olhar de forma elegante, clean e muito sutil para o dia a dia.',
    durationMinutes: 90,
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1500840216050-6ffa99d75160?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 20,
    maintenanceNote: 'Retoque sugerido aos 20 dias para manter alinhamento e simetria.',
    prepInstructions: 'Rosto limpo e sem maquiagem.',
    careInstructions: 'Higienizar diariamente com espuma específica para cílios e pentear suavemente.',
    isActive: true,
    popular: true
  },
  {
    id: 'srv-lashes-manutencao',
    category: 'pestañas',
    name: 'Manutenção de Cílios (Até 21 dias)',
    description: 'Remoção segura dos fios que cresceram e preenchimento completo para deixar seu olhar impecável como no primeiro dia.',
    durationMinutes: 60,
    price: 100,
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 18,
    maintenanceNote: 'Válido para clientes que mantêm ao menos 40% das extensões aplicadas.',
    prepInstructions: 'Cílios higienizados e escovados.',
    careInstructions: 'Pentear com a escovinha fornecida após o banho.',
    isActive: true,
    popular: true
  },
  {
    id: 'srv-sobrancelhas-lamination',
    category: 'cejas',
    name: 'Brow Lamination + Design Personalizado',
    description: 'Tendência mundial de alinhamento e nutrição dos fios das sobrancelhas para efeito encorpado, volumoso e moderno. Inclui tintura suave.',
    durationMinutes: 50,
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 30,
    maintenanceNote: 'O efeito dura de 4 a 6 semanas. Indicado retoque do design com 20 dias.',
    prepInstructions: 'Não depilar as sobrancelhas por 10 dias antes do procedimento.',
    careInstructions: 'Evitar molhar ou aplicar ácidos na região por 24 horas.',
    isActive: true,
    popular: true
  },
  {
    id: 'srv-sobrancelhas-design',
    category: 'cejas',
    name: 'Design de Sobrancelhas com Henna Premium',
    description: 'Mapeamento facial com paquímetro para valorizar suas feições e aplicação de henna orgânica com efeito degradê sombreado.',
    durationMinutes: 40,
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 15,
    maintenanceNote: 'A henna dura em média 7 a 12 dias na pele e 20 dias no pelo.',
    prepInstructions: 'Pele limpa e sem esfoliantes recentes.',
    careInstructions: 'Não esfregar com sabonete forte na região.',
    isActive: true,
    popular: false
  },
  {
    id: 'srv-unhas-gel',
    category: 'uñas',
    name: 'Alongamento em Fibra de Vidro + Esmaltação em Gel',
    description: 'Unhas perfeitas, resistentes e de aspecto ultrafino e natural. Inclui cutilagem combinada e esmaltação em gel com secagem em cabine LED.',
    durationMinutes: 110,
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 25,
    maintenanceNote: 'Manutenção necessária a cada 20 a 25 dias para garantir a integridade da lâmina ungueal.',
    prepInstructions: 'Não cortar as unhas muito rentes antes do procedimento.',
    careInstructions: 'Usar luvas para produtos químicos de limpeza e hidratar as cutículas à noite.',
    isActive: true,
    popular: true
  },
  {
    id: 'srv-unhas-blindagem',
    category: 'uñas',
    name: 'Blindagem de Diamante + Esmaltação em Gel',
    description: 'Camada protetora em gel sobre a unha natural para evitar quebras e descamação, garantindo esmalte impecável por até 20 dias.',
    durationMinutes: 60,
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 20,
    maintenanceNote: 'Retoque a cada 20 dias.',
    prepInstructions: 'Unhas limpas sem esmalte tradicional.',
    careInstructions: 'Óleo de cutícula diário.',
    isActive: true,
    popular: false
  },
  {
    id: 'srv-facial-limpeza',
    category: 'facial',
    name: 'Limpeza de Pele Profunda + Hidragloss Lips',
    description: 'Remoção de cravos e impurezas com vapor de ozônio, extração indolor, máscara de LED e hidratação labial profunda com ácido hialurônico.',
    durationMinutes: 80,
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    suggestedMaintenanceDays: 30,
    maintenanceNote: 'Recomendada mensalmente para renovação celular e controle de oleosidade.',
    prepInstructions: 'Evitar sol intenso 2 dias antes.',
    careInstructions: 'Uso obrigatório de protetor solar FPS 50 e não usar ácidos nas próximas 48h.',
    isActive: true,
    popular: true
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01',
    clientName: 'Larissa Mendonça',
    clientWhatsapp: '+5511991223344',
    clientNotes: 'Adora efeito gatinho (fox eyes) e pontas mais longas',
    technicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES['+5511991223344'],
    serviceId: 'srv-lashes-brasileiro',
    serviceName: 'Volume Brasileiro (Fio Tecnológico Y)',
    serviceCategory: 'pestañas',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '14:00',
    durationMinutes: 110,
    price: 180,
    currency: 'BRL',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    depositPaid: true,
    depositAmount: 30,
    reminder24hSent: true,
    reminderTodaySent: false,
    maintenanceAlertSent: false
  },
  {
    id: 'apt-02',
    clientName: 'Beatriz Almeida',
    clientWhatsapp: '+5511984445566',
    clientNotes: 'Primeira vez no estúdio, veio por indicação do Instagram',
    technicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES['+5511984445566'],
    serviceId: 'srv-sobrancelhas-lamination',
    serviceName: 'Brow Lamination + Design Personalizado',
    serviceCategory: 'cejas',
    date: new Date().toISOString().split('T')[0], // Hoje
    time: '16:30',
    durationMinutes: 50,
    price: 120,
    currency: 'BRL',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    depositPaid: true,
    depositAmount: 30,
    reminder24hSent: true,
    reminderTodaySent: true,
    maintenanceAlertSent: false
  },
  {
    id: 'apt-03',
    clientName: 'Juliana Paes Costa',
    clientWhatsapp: '+5511973332211',
    clientNotes: 'Prefere formato amendoado nas unhas',
    technicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES['+5511973332211'],
    serviceId: 'srv-unhas-gel',
    serviceName: 'Alongamento em Fibra de Vidro + Esmaltação em Gel',
    serviceCategory: 'uñas',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
    time: '10:00',
    durationMinutes: 110,
    price: 160,
    currency: 'BRL',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    depositPaid: false,
    reminder24hSent: false,
    reminderTodaySent: false,
    maintenanceAlertSent: false
  },
  {
    id: 'apt-04',
    clientName: 'Fernanda Rocha',
    clientWhatsapp: '+5511961118899',
    clientNotes: 'Fez volume brasileiro há 22 dias, ciclo de retorno',
    technicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES['+5511961118899'],
    serviceId: 'srv-lashes-brasileiro',
    serviceName: 'Volume Brasileiro (Fio Tecnológico Y)',
    serviceCategory: 'pestañas',
    date: new Date(Date.now() - 86400000 * 22).toISOString().split('T')[0],
    time: '15:00',
    durationMinutes: 110,
    price: 180,
    currency: 'BRL',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    depositPaid: true,
    reminder24hSent: true,
    reminderTodaySent: true,
    maintenanceAlertSent: false
  },
  {
    id: 'apt-05',
    clientName: 'Camila Guimarães',
    clientWhatsapp: '+5511995556677',
    clientNotes: 'Alongamento em fibra feito há 24 dias',
    serviceId: 'srv-unhas-gel',
    serviceName: 'Alongamento em Fibra de Vidro + Esmaltação em Gel',
    serviceCategory: 'uñas',
    date: new Date(Date.now() - 86400000 * 24).toISOString().split('T')[0],
    time: '11:00',
    durationMinutes: 110,
    price: 160,
    currency: 'BRL',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 26).toISOString(),
    depositPaid: true,
    reminder24hSent: true,
    reminderTodaySent: true,
    maintenanceAlertSent: false
  }
];

export const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-confirmation',
    type: 'confirmation',
    title: 'Confirmação de Agendamento (Com Dados Bancários & PIX)',
    template: 'Olá {cliente}! ✨ Seu agendamento foi *CONFIRMADO* com sucesso em *{negocio}*!\n\n📅 Data: {fecha}\n⏰ Horário: {hora}h\n✂️ Procedimento: {servicio}\n💰 Valor Total: {precio}\n📍 Local: {direccion}\n\n{datos_bancarios}\n\n⚠️ Em caso de imprevisto, avise com antecedência. Estamos ansiosos para te receber! 💕'
  },
  {
    id: 'tpl-reminder-24h',
    type: 'reminder_24h',
    title: 'Lembrete de Véspera (24h de Antecedência)',
    template: 'Olá {cliente}! 🌸 Passando para lembrar do seu atendimento amanhã em *{negocio}*:\n\n📅 Data: {fecha}\n⏰ Horário: {hora}h\n✨ Procedimento: {servicio}\n📍 Endereço: {direccion}\n💰 Valor: {precio}\n\n⚠️ Em caso de imprevisto, avise com antecedência. Você confirma sua presença? Estamos te esperando com muito carinho! 💕'
  },
  {
    id: 'tpl-reminder-today',
    type: 'reminder_today',
    title: 'Lembrete de Hoje (Dia do Atendimento)',
    template: 'Bom dia {cliente}! ✨ Seu horário de *{servicio}* está confirmado para hoje às *{hora}h* em nosso estúdio (*{negocio}*).\n\n📍 Endereço: {direccion}\n☕ Preparamos um cafezinho para te receber. Até logo!'
  },
  {
    id: 'tpl-maintenance',
    type: 'maintenance',
    title: 'Alerta de Retorno & Manutenção (Pós 18-25 dias)',
    template: 'Olá {cliente}! ✨ Tudo bem? Aqui é a {profesional} do *{negocio}*.\n\nJá se passaram *{dias} dias* desde a sua última sessão de *{servicio}* e queremos saber como você está se sentindo com seus resultados 💕\n\n💅 Para manter o acabamento lindo e a saúde dos seus fios/unhas, este é o momento ideal para a sua manutenção!\n\n👉 Escolha seu melhor dia e horário diretamente no meu catálogo:\n{link}\n\nVou amar te receber novamente! ✨'
  },
  {
    id: 'tpl-aftercare',
    type: 'aftercare',
    title: 'Agradecimento & Cuidados Pós-Atendimento',
    template: 'Muito obrigada pela sua visita hoje, {cliente}! 💖 Foi um enorme prazer te atender em *{negocio}*.\n\nPara que seu *{servicio}* dure muito mais tempo impecável, lembre-se dos cuidados principais:\n🌸 {cuidados}\n\nQualquer dúvida estou à sua total disposição por aqui. Tenha uma semana radiante! ✨'
  }
];
