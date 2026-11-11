export type CurrencyCode =
  | 'BRL'
  | 'MXN'
  | 'COP'
  | 'ARS'
  | 'CLP'
  | 'PEN'
  | 'USD'
  | 'EUR';

export type AppLanguage = 'pt' | 'es' | 'en';

export type ServiceCategory =
  | 'pestañas' // cílios
  | 'cejas' // sobrancelhas
  | 'uñas' // unhas
  | 'cabello' // cabelo
  | 'facial' // facial
  | 'maquillaje' // maquiagem
  | 'depilacion' // depilação
  | 'labios' // lábios / micropigmentação
  | 'outro';

export interface SalonPhoto {
  id: string;
  url: string;
  title: string;
  category?: 'espaco' | 'resultados' | 'detalhes';
}

export interface HighlightStoryItem {
  id: string;
  url: string;
  caption?: string;
}

export interface ProfileHighlight {
  id: string;
  title: string;
  coverUrl: string;
  items: HighlightStoryItem[];
}

export interface DaySchedule {
  dayOfWeek: number; // 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
  isOpen: boolean;
  openTime: string; // '09:00'
  closeTime: string; // '19:30'
  hasBreak?: boolean;
  breakStart?: string; // '12:00'
  breakEnd?: string; // '13:00'
}

export type PixKeyType = 'celular' | 'cpf' | 'cnpj' | 'email' | 'aleatoria';
export type BankAccountType = 'corrente' | 'poupanca' | 'ahorros' | 'corriente' | 'checking';
export type PaymentPreferenceMethod = 'pix' | 'bank_transfer' | 'both';

export interface BankPaymentDetails {
  enabled: boolean;
  preferenceMethod: PaymentPreferenceMethod;
  // PIX specifics
  pixKeyType: PixKeyType;
  pixKey: string;
  pixBeneficiaryName?: string;
  pixCity?: string;
  // Bank Account specifics
  bankName?: string; // e.g. Nubank, Banco do Brasil, Itaú, BBVA, Santander, Bancolombia
  accountType?: BankAccountType;
  accountNumber?: string;
  agencyNumber?: string;
  accountHolderName?: string;
  accountHolderDocument?: string; // CPF, RFC, RUT, DNI
  interbankCodeOrAlias?: string; // CLABE, CBU, CVU, Alias, Nequi
  // Deposit / Señal policy
  requireDeposit: boolean;
  depositType: 'fixed' | 'percentage';
  depositAmount: number; // e.g. 30 (currency units or %)
  paymentDeadlineHours?: number; // e.g. 2 hours to send proof
  instructions?: string; // e.g. "Enviar comprovante em até 2 horas para garantir a vaga"
}

export interface BeautyProProfile {
  id: string;
  slug: string;
  name: string;
  businessName: string;
  headline: string;
  bio: string;
  whatsapp: string;
  instagram: string;
  tiktok?: string;
  pixKey?: string;
  pixType?: 'celular' | 'cpf' | 'email' | 'aleatoria';
  bankPaymentDetails?: BankPaymentDetails;
  address: string;
  neighborhood?: string; // Bairro
  city: string;
  state?: string; // UF: SP, RJ, etc.
  countryCode: string; // BR, MX, CO, etc.
  modality: 'studio' | 'home_service' | 'both';
  currency: CurrencyCode;
  workingDays: number[]; // 0=Dom, 1=Seg, ..., 6=Sab
  workingHours: {
    start: string; // '09:00'
    end: string; // '19:30'
  };
  weeklySchedule?: DaySchedule[];
  slotDurationMinutes: number; // 30, 45, 60
  requireDeposit: boolean;
  depositPercentage: number; // e.g. 20%
  depositFixedAmount?: number; // e.g. R$ 30,00 sinal
  bookingPolicy: string;
  avatarUrl: string;
  coverUrl?: string;
  themeColor: string; // 'rose', 'amber', 'emerald', 'stone'
  salonPhotos: SalonPhoto[];
  highlights: ProfileHighlight[];
  language?: AppLanguage;
  clientTechnicalNotes?: Record<string, ClientTechnicalNote>;
  // Custom sharing link & text customized by the professional
  customShareText?: string;
  customShareLink?: string;
  customBioText?: string;
}

export interface ClientTechnicalNote {
  id: string;
  clientPhone: string;
  clientName: string;
  serviceCategory?: ServiceCategory;
  // Eyelash / Cejas details
  lashMapping?: string; // e.g. Cat Eye, Ojo de Muñeca, Ardilla, Natural
  lashCurvature?: string; // e.g. C, CC, D, L, M
  lashThickness?: string; // e.g. 0.05, 0.07, 0.15, 0.20
  lashLengths?: string; // e.g. 8-13mm
  lashAdhesive?: string; // e.g. Hipoalergénico 1s
  // Makeup details
  makeupFoundationTone?: string; // e.g. MAC NC25, Subtono Cálido
  skinType?: string; // e.g. Mixta, Seca, Grasa, Sensible
  makeupFinishPreference?: string; // e.g. Mate luminoso, Glow
  makeupLipTone?: string; // e.g. Nude rosado satinado
  // Nails details
  nailTechnique?: string; // e.g. Soft Gel, Fibra de Vidrio, Polygel
  nailShape?: string; // e.g. Almendra, Coffin, Cuadrada
  nailColorFavorite?: string; // e.g. Vía Láctea, Glazed Donut
  // Brow / Hair details
  browOrHairPigment?: string; // e.g. Castaño medio cálido, Henna chocolate
  // Allergies & Sensitivities
  allergies?: string; // e.g. Alérgica a látex, vapores de cianoacrilato
  // Personal client preferences
  personalPreferences?: string; // e.g. Prefiere cita en silencio, café sin azúcar
  // Evolution and general notes
  generalNotes?: string;
  lastUpdated: string;
  tags?: string[];
}

export interface BeautyService {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  galleryUrls?: string[];
  suggestedMaintenanceDays: number; // e.g. 21 days for lash refill or gel nails
  maintenanceNote?: string;
  prepInstructions?: string; // What client should do before arriving
  careInstructions?: string; // Aftercare rules
  isActive: boolean;
  popular?: boolean;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  clientNotes?: string;
  technicalNotes?: ClientTechnicalNote;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  price: number;
  currency: CurrencyCode;
  status: AppointmentStatus;
  createdAt: string;
  depositPaid?: boolean;
  depositAmount?: number;
  reminder24hSent?: boolean;
  reminderTodaySent?: boolean;
  maintenanceAlertSent?: boolean;
}

export type AlertType = 'reminder_24h' | 'reminder_today' | 'maintenance' | 'aftercare' | 'confirmation';

export interface WhatsAppAlertItem {
  id: string;
  type: AlertType;
  appointmentId: string;
  clientName: string;
  clientWhatsapp: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  price: number;
  currency: CurrencyCode;
  daysElapsed?: number;
  suggestedMaintenanceDays?: number;
  messageText: string;
  whatsappUrl: string;
  status: 'pending' | 'sent';
}

export interface WhatsAppTemplate {
  id: string;
  type: AlertType;
  title: string;
  template: string; // placeholders: {cliente}, {servicio}, {fecha}, {hora}, {precio}, {profesional}, {negocio}, {direccion}, {link}, {dias}, {pix}
}

export interface BookingNotification {
  id: string;
  appointmentId: string;
  clientName: string;
  clientWhatsapp: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  currency: CurrencyCode;
  createdAt: string;
  read: boolean;
}

export type AppViewMode = 'client' | 'pro';
export type ProTab = 'agenda' | 'services' | 'alerts' | 'social_profile' | 'share';

export type AiReplyTone = 'warm_friendly' | 'professional_elegant' | 'persuasive_sales' | 'firm_respectful';

export type AiReplyScenario =
  | 'free_inquiry'
  | 'quote_service'
  | 'reschedule_delay'
  | 'aftercare_tips'
  | 'cancellation_policy'
  | 'touchup_maintenance'
  | 'reactivate_client'
  | 'custom';

export interface AiClientReplyRequest {
  clientMessage?: string;
  scenario?: AiReplyScenario;
  clientName?: string;
  clientPhone?: string;
  serviceId?: string;
  tone?: AiReplyTone;
  customInstructions?: string;
}

export interface AiClientReplyResponse {
  reply: string;
  suggestions?: string[];
}
