import React, { useState } from 'react';
import {
  AppLanguage,
  BeautyProProfile,
  ProTab
} from '../types';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Scissors,
  Share2,
  BellRing,
  MessageSquare,
  ClipboardList,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  Volume2,
  Heart,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';
import { cleanPhoneNumber } from '../utils/whatsapp';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pro' | 'client';
  profile: BeautyProProfile;
  lang?: AppLanguage;
  onNavigateTab?: (tab: ProTab) => void;
  onTestNotification?: () => void;
  onStartBooking?: () => void;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pro',
  profile,
  lang = 'pt',
  onNavigateTab,
  onTestNotification,
  onStartBooking
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  const [activeTab, setActiveTab] = useState<'pro' | 'client'>(defaultTab);
  const [proStep, setProStep] = useState<number>(0);
  const [clientStep, setClientStep] = useState<number>(0);
  const [copiedText, setCopiedText] = useState(false);

  // Sync tab if defaultTab changes when opening
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Professional Tutorial Steps Content
  const PRO_STEPS = [
    {
      title: lang === 'pt'
        ? '1. Configure seu Perfil & Horário Semanal'
        : lang === 'es'
        ? '1. Configura tu Perfil y Horario Semanal'
        : '1. Set Up Your Profile & Weekly Schedule',
      subtitle: lang === 'pt'
        ? 'Personalize seu estúdio e defina exatamente quando você atende'
        : lang === 'es'
        ? 'Personaliza tu estudio y define con precisión cuándo atiendes'
        : 'Customize your studio and set exact operating hours',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Defina seu Nome Profissional, foto de perfil, fotos reais do estúdio e chave PIX.'
          : lang === 'es'
          ? 'Define tu Nombre Profesional, foto de perfil, fotos de tu estudio y datos de pago.'
          : 'Define your Business Name, profile photo, studio photos, and payment details.',
        lang === 'pt'
          ? 'Na aba Horários, marque dia a dia (Seg a Dom) quais dias você abre, horários de início e encerramento.'
          : lang === 'es'
          ? 'En la pestaña Horarios, define día a día qué días abres, hora de inicio, cierre y pausa de almuerzo.'
          : 'In the Hours tab, set each day open/closed status, operating hours, and lunch breaks.',
        lang === 'pt'
          ? 'As clientes só conseguirão agendar nos seus horários livres válidos, sem conflitos nem horas extras indesejadas.'
          : lang === 'es'
          ? 'Las clientas sólo podrán reservar en tus horarios reales disponibles, sin cruces ni horas extras imprevistas.'
          : 'Clients will only book during valid working slots without schedule conflicts.'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Configurar Perfil e Horários' : lang === 'es' ? 'Configurar Perfil y Horarios' : 'Configure Profile & Hours',
        tab: 'social_profile' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Gestão de Disponibilidade' : lang === 'es' ? 'Gestión de Disponibilidad' : 'Availability Setup'
    },
    {
      title: lang === 'pt'
        ? '2. Monte seu Catálogo & Alertas de Retorno'
        : lang === 'es'
        ? '2. Crea tu Catálogo y Alertas de Retorno'
        : '2. Create Your Service Menu & Refill Alerts',
      subtitle: lang === 'pt'
        ? 'Cadastre procedimentos, fotos e prazos ideais para manutenção'
        : lang === 'es'
        ? 'Registra procedimientos, fotos y el tiempo recomendado para mantenimiento'
        : 'Add procedures, photos, and recommended refill intervals',
      icon: <Scissors className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Cadastre serviços por categoria: Cílios, Sobrancelhas, Unhas, Facial, Maquiagem, etc.'
          : lang === 'es'
          ? 'Registra servicios por categoría: Pestañas, Cejas, Uñas, Facial, Maquillaje, etc.'
          : 'Add services by category: Lashes, Brows, Nails, Facial, Makeup, etc.',
        lang === 'pt'
          ? 'Preencha valores, duração em minutos e cuidados prévios para a cliente vir preparada.'
          : lang === 'es'
          ? 'Indica precios, duración en minutos e instrucciones previas para que la clienta llegue preparada.'
          : 'Set prices, duration in minutes, and prep instructions so clients arrive ready.',
        lang === 'pt'
          ? 'Configure os Dias Sugeridos de Manutenção (ex: 21 dias para cílios): isso gera mensagens automáticas para recompras!'
          : lang === 'es'
          ? 'Configura los Días Sugeridos de Mantenimiento (ej: 21 días): ¡genera recompras automáticas para que vuelvan!'
          : 'Set Suggested Maintenance Days (e.g. 21 days for lash refills) for automated repeat bookings!'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Ir ao Catálogo de Serviços' : lang === 'es' ? 'Ir al Catálogo de Servicios' : 'Go to Service Catalog',
        tab: 'services' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Retenção de Clientes' : lang === 'es' ? 'Retención de Clientes' : 'Client Retention'
    },
    {
      title: lang === 'pt'
        ? '3. Compartilhe seu Link & QR Code'
        : lang === 'es'
        ? '3. Comparte tu Enlace y Código QR'
        : '3. Share Your Web Link & QR Code',
      subtitle: lang === 'pt'
        ? 'Coloque na bio do Instagram e no balcão do seu estúdio'
        : lang === 'es'
        ? 'Ponlo en la bio de Instagram y en el mostrador de tu estudio'
        : 'Place it on your Instagram bio and studio counter',
      icon: <Share2 className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Copie o Link direto do seu portal público e coloque na Bio do Instagram e nos Stories.'
          : lang === 'es'
          ? 'Copia el Enlace directo de tu portal público y agrégalo a la Bio de Instagram y estados de WhatsApp.'
          : 'Copy your public portal link into your Instagram Bio and WhatsApp Status.',
        lang === 'pt'
          ? 'Imprima ou exiba o QR Code exclusivo no balcão de atendimento para as clientes escanearem no checkout.'
          : lang === 'es'
          ? 'Imprime o muestra el Código QR exclusivo en el mostrador para que tus clientas agenden el próximo retoque.'
          : 'Print or display your QR Code on your studio front counter for quick checkout rebooking.',
        lang === 'pt'
          ? 'Suas clientes conseguem agendar 24 horas por dia, mesmo quando você estiver atendendo ou descansando.'
          : lang === 'es'
          ? 'Tus clientas pueden agendar las 24 horas del día, incluso mientras estás en atención o descansando.'
          : 'Clients can book 24/7 without needing you to answer messages back and forth.'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Ver Opções de Compartilhamento' : lang === 'es' ? 'Ver Opciones para Compartir' : 'View Share Options',
        tab: 'share' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Atendimento 24h' : lang === 'es' ? 'Atención 24 Horas' : '24/7 Self-Booking'
    },
    {
      title: lang === 'pt'
        ? '4. Notificações Visuais & Alertas Sonoros'
        : lang === 'es'
        ? '4. Notificaciones Visuales y Alertas Sonoras'
        : '4. Visual Notifications & Chime Alerts',
      subtitle: lang === 'pt'
        ? 'Saiba instantaneamente quando uma cliente faz uma reserva'
        : lang === 'es'
        ? 'Recibe avisos al instante cuando una clienta reserva'
        : 'Get instant alerts when a client places a booking',
      icon: <BellRing className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Sempre que uma cliente reservar no seu portal, uma notificação dourada aparece no topo da tela com som de sino!'
          : lang === 'es'
          ? 'Cada vez que una clienta reserve en tu portal, aparecerá una alerta dorada en pantalla con un toque sonoro.'
          : 'Whenever a client books, a golden toast banner appears with an elegant boutique chime sound!',
        lang === 'pt'
          ? 'Ative a permissão de notificações do navegador para ser avisada mesmo com a aba em segundo plano.'
          : lang === 'es'
          ? 'Activa el permiso de notificaciones del navegador para recibir avisos aun con la pestaña en segundo plano.'
          : 'Enable browser notification permission to get alerted even when switching tabs or apps.',
        lang === 'pt'
          ? 'O ícone do sino no cabeçalho guarda o histórico com botão rápido para chamar a cliente no WhatsApp.'
          : lang === 'es'
          ? 'El icono de campana en la barra superior guarda el historial con botón directo para abrir WhatsApp.'
          : 'The bell icon in the top header keeps the alert log with a 1-tap WhatsApp chat button.'
      ],
      testAction: true,
      previewBadge: lang === 'pt' ? 'Alertas em Tempo Real' : lang === 'es' ? 'Alertas en Tiempo Real' : 'Real-Time Alerts'
    },
    {
      title: lang === 'pt'
        ? '5. Gestão de Agenda & Lembretes WhatsApp'
        : lang === 'es'
        ? '5. Gestión de Agenda y Recordatorios WhatsApp'
        : '5. Calendar Management & WhatsApp Reminders',
      subtitle: lang === 'pt'
        ? 'Reduza faltas a zero enviando lembretes prontos com 1 toque'
        : lang === 'es'
        ? 'Reduce faltas enviando recordatorios con 1 toque hacia WhatsApp'
        : 'Zero no-shows with 1-click WhatsApp appointment reminders',
      icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Acompanhe suas clientes do dia, filtre por status (Confirmada, Pendente, Concluída).'
          : lang === 'es'
          ? 'Consulta tus citas del día y filtra por estado (Confirmada, Pendiente, Completada).'
          : 'Track appointments of the day, filter by status (Confirmed, Pending, Completed).',
        lang === 'pt'
          ? 'Na aba WhatsApp, envie lembretes de 24h e do dia da sessão já com o nome da cliente e horário preenchidos.'
          : lang === 'es'
          ? 'En la pestaña WhatsApp, envía recordatorios de 24 horas y del mismo día con nombre y hora ya redactados.'
          : 'In the WhatsApp tab, send 24h & same-day reminders with pre-filled client and timing details.',
        lang === 'pt'
          ? 'Acione o aviso de Retorno para clientes após 20 a 30 dias para garantir agenda cheia todo mês!'
          : lang === 'es'
          ? 'Activa la alerta de Retorno para clientas después de 20 a 30 días para asegurar tu agenda llena.'
          : 'Trigger Refill/Maintenance alerts after 20-30 days to keep your calendar filled every month!'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Ir para Minha Agenda' : lang === 'es' ? 'Ir a Mi Agenda' : 'Go to Calendar',
        tab: 'agenda' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Zero Faltas' : lang === 'es' ? 'Cero Faltas' : 'Zero No-Shows'
    },
    {
      title: lang === 'pt'
        ? '6. Fichas Técnicas & Notas de Cliente'
        : lang === 'es'
        ? '6. Fichas Técnicas y Notas de Cliente'
        : '6. Client Technical Sheets & Notes',
      subtitle: lang === 'pt'
        ? 'Registre curvatura, espessura, tons de base, alergias e preferências'
        : lang === 'es'
        ? 'Registra curvatura, grosor, tonos de base, fórmulas, alergias y preferencias'
        : 'Record lash mapping, foundation tone, formulas, allergies, and preferences',
      icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Na Gestão de Agendamentos, abra a aba "Notas & Fichas Técnicas" ou clique em "Ficha Técnica" diretamente no cartão da cliente.'
          : lang === 'es'
          ? 'En la Gestión de Citas, abre la pestaña "Notas & Fichas Técnicas" o toca "Ficha Técnica" directamente en la cita de la clienta.'
          : 'In Appointments Management, open "Client Technical Notes" or tap "Technical Sheet" directly on any appointment card.',
        lang === 'pt'
          ? 'Anote antecedentes precisos: Mapeamento de Cílios (Curva D, Cat Eye), Tom de Maquiagem (NC25), Formato de Unhas e Alergias críticas.'
          : lang === 'es'
          ? 'Anota antecedentes técnicos: Mapeo de pestañas (Curva D, Cat Eye), tono de maquillaje (NC25), técnica de uñas y alergias críticas.'
          : 'Log exact technical parameters: Lash mapping (D curl, Cat Eye), Foundation tone (NC25), Nail shapes, and allergy alerts.',
        lang === 'pt'
          ? 'Use as Plantilhas Rápidas com 1 toque e copie resumos prontos para colar nas conversas de WhatsApp.'
          : lang === 'es'
          ? 'Usa plantillas rápidas con 1 toque y copia resúmenes listos para pegar en tus chats de WhatsApp.'
          : 'Use 1-tap rapid presets and copy formatted technical summaries for WhatsApp or salon logs.'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Abrir Fichas Técnicas' : lang === 'es' ? 'Abrir Fichas Técnicas' : 'Open Technical Sheets',
        tab: 'agenda' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Ficha Profissional' : lang === 'es' ? 'Ficha Profesional' : 'Pro Client File'
    },
    {
      title: lang === 'pt'
        ? '7. Dados Bancários, PIX & Confirmação Automática'
        : lang === 'es'
        ? '7. Datos Bancarios, PIX y Confirmación Automática'
        : '7. Bank Details, PIX & Dynamic Confirmations',
      subtitle: lang === 'pt'
        ? 'Insira contas bancárias e PIX para cobrar sinais e confirmar horários via WhatsApp'
        : lang === 'es'
        ? 'Ingresa cuentas bancarias y llave PIX para cobrar anticipos y confirmar citas'
        : 'Configure bank accounts and PIX keys to collect deposits and confirm bookings',
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Em "Perfil & Salão", acesse a aba "Dados Bancários & PIX" para registrar sua chave PIX, banco, agência, conta e nome do titular.'
          : lang === 'es'
          ? 'En "Perfil & Salón", ingresa a "Datos Bancarios & PIX" para registrar tu llave PIX, banco, sucursal, cuenta y titular.'
          : 'Under "Profile & Studio", open "Bank Details & PIX" to register your PIX key, bank, branch, account number, and holder.',
        lang === 'pt'
          ? 'Defina o valor do sinal (ex: R$ 30 ou 20%) e o prazo limite para o envio do comprovante pela cliente.'
          : lang === 'es'
          ? 'Establece el monto del anticipo o seña y el plazo de tiempo límite para que la clienta envíe su comprobante.'
          : 'Set your required deposit/retainer amount and the deadline for clients to send their proof of payment.',
        lang === 'pt'
          ? 'Na Agenda, toque no botão "Confirmar & PIX" de qualquer atendimento para abrir o WhatsApp com a mensagem completa formatada!'
          : lang === 'es'
          ? 'En la Agenda, toca el botón "Confirmar & PIX / Banco" de cualquier cita para abrir WhatsApp con los datos insertados automáticamente.'
          : 'In the Calendar, click "Confirm & PIX/Bank" on any booking to open WhatsApp with the dynamic formatted message ready to send!'
      ],
      actionBtn: {
        label: lang === 'pt' ? 'Configurar Dados Bancários' : lang === 'es' ? 'Configurar Datos Bancarios' : 'Configure Bank & PIX',
        tab: 'social_profile' as ProTab
      },
      previewBadge: lang === 'pt' ? 'Sinal Garantido' : lang === 'es' ? 'Anticipo Seguro' : 'Deposit Ready'
    }
  ];

  // Client Tutorial Steps Content
  const CLIENT_STEPS = [
    {
      title: lang === 'pt'
        ? '1. Escolha o Procedimento Desejado'
        : lang === 'es'
        ? '1. Elige el Procedimiento Deseado'
        : '1. Select Your Desired Service',
      subtitle: lang === 'pt'
        ? 'Navegue pelas categorias e veja fotos reais de resultados'
        : lang === 'es'
        ? 'Explora las categorías y revisa fotos reales de resultados'
        : 'Browse categories and inspect real results photos',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Filtre por Cílios, Sobrancelhas, Unhas, Maquiagem ou Facial.'
          : lang === 'es'
          ? 'Filtra por Pestañas, Cejas, Uñas, Maquillaje o Facial según lo que busques.'
          : 'Filter by Lashes, Brows, Nails, Makeup or Facial services.',
        lang === 'pt'
          ? 'Confira o valor transparente, tempo de atendimento estimado e fotos do estúdio.'
          : lang === 'es'
          ? 'Revisa el valor transparente, tiempo estimado de atención e imágenes del estudio.'
          : 'Check transparent pricing, estimated procedure duration, and studio photos.',
        lang === 'pt'
          ? 'Clique em "Agendar Horário" no procedimento que você deseja realizar.'
          : lang === 'es'
          ? 'Haz clic en "Agendar Horario" en el procedimiento que deseas realizar.'
          : 'Click "Book Appointment" on the procedure you wish to receive.'
      ],
      tip: lang === 'pt'
        ? 'Dica: Você também pode conferir orientações pré-atendimento para se preparar!'
        : lang === 'es'
        ? 'Consejo: Puedes leer las recomendaciones previas para llegar bien preparada.'
        : 'Tip: You can read pre-care instructions to prepare beforehand!',
      previewBadge: lang === 'pt' ? 'Catálogo & Valores' : lang === 'es' ? 'Catálogo y Precios' : 'Menu & Pricing'
    },
    {
      title: lang === 'pt'
        ? '2. Escolha o Melhor Dia & Horário'
        : lang === 'es'
        ? '2. Elige el Mejor Día y Horario'
        : '2. Pick the Best Date & Time Slot',
      subtitle: lang === 'pt'
        ? 'O calendário mostra somente vagas reais disponíveis'
        : lang === 'es'
        ? 'El calendario muestra únicamente turnos reales disponibles'
        : 'The calendar displays only real available openings',
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Selecione a data desejada no carrossel de dias abertos da profissional.'
          : lang === 'es'
          ? 'Selecciona la fecha deseada en el calendario de días de atención de la profesional.'
          : 'Select your preferred date from the specialist’s open working days.',
        lang === 'pt'
          ? 'Escolha um dos horários livres listados (manhã ou tarde).'
          : lang === 'es'
          ? 'Elige uno de los turnos libres listados (mañana o tarde).'
          : 'Pick one of the available open time slots listed.',
        lang === 'pt'
          ? 'Dias de folga e intervalos de almoço ficam bloqueados automaticamente, garantindo pontualidade.'
          : lang === 'es'
          ? 'Los días cerrados y pausas quedan bloqueados automáticamente, garantizando puntualidad.'
          : 'Days off and breaks are automatically blocked, ensuring punctuality.'
      ],
      tip: lang === 'pt'
        ? 'Não precisa esperar a profissional responder para saber se há horário!'
        : lang === 'es'
        ? '¡No necesitas esperar que la profesional responda para saber si hay lugar!'
        : 'No need to wait for a text message reply to know if a slot is free!',
      previewBadge: lang === 'pt' ? 'Data & Horário' : lang === 'es' ? 'Fecha y Turno' : 'Date & Slots'
    },
    {
      title: lang === 'pt'
        ? '3. Preencha seu Nome & WhatsApp'
        : lang === 'es'
        ? '3. Ingresa tu Nombre y WhatsApp'
        : '3. Enter Your Name & WhatsApp',
      subtitle: lang === 'pt'
        ? 'Sem senhas complicadas nem downloads de aplicativo'
        : lang === 'es'
        ? 'Sin contraseñas complicadas ni descargas de aplicaciones'
        : 'No tedious passwords or bulky app downloads required',
      icon: <Smartphone className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Informe seu nome completo e seu número de celular com WhatsApp.'
          : lang === 'es'
          ? 'Escribe tu nombre completo y tu número de celular con WhatsApp.'
          : 'Enter your full name and your mobile phone number with WhatsApp.',
        lang === 'pt'
          ? 'Adicione observações se tiver alguma preferência ou alergia importante.'
          : lang === 'es'
          ? 'Agrega comentarios adicionales si tienes alguna preferencia o condición especial.'
          : 'Add optional notes if you have any special style preference or allergy.',
        lang === 'pt'
          ? 'Se o estúdio trabalhar com reserva de sinal (PIX), a chave e valor aparecem na tela de forma segura.'
          : lang === 'es'
          ? 'Si el estudio requiere seña o abono, los datos y valor aparecen en pantalla con total claridad.'
          : 'If the salon requires a deposit to secure your slot, payment details are displayed clearly.'
      ],
      tip: lang === 'pt'
        ? 'Seus dados são protegidos e usados apenas para a confirmação do seu atendimento.'
        : lang === 'es'
        ? 'Tus datos son seguros y se usan exclusivamente para confirmar tu cita.'
        : 'Your contact data is safe and used solely for appointment confirmation.',
      previewBadge: lang === 'pt' ? 'Seus Dados' : lang === 'es' ? 'Tus Datos' : 'Contact Info'
    },
    {
      title: lang === 'pt'
        ? '4. Confirmação Instantânea & WhatsApp'
        : lang === 'es'
        ? '4. Confirmación Instantánea y WhatsApp'
        : '4. Instant Confirmation & Direct WhatsApp',
      subtitle: lang === 'pt'
        ? 'Sua vaga é garantida na hora no sistema da profissional'
        : lang === 'es'
        ? 'Tu lugar queda asegurado de inmediato en el sistema'
        : 'Your slot is secured on the spot in the studio system',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Clique em "Confirmar Agendamento" para reservar a sua vaga.'
          : lang === 'es'
          ? 'Haz clic en "Confirmar Cita" para apartar tu turno.'
          : 'Click "Confirm Appointment" to secure your booking slot.',
        lang === 'pt'
          ? 'Você verá a tela de sucesso com o botão verde "Abrir WhatsApp": basta 1 clique para enviar os dados para a profissional!'
          : lang === 'es'
          ? 'Verás la pantalla de éxito con el botón "Abrir WhatsApp" para enviar el comprobante de tu cita al estudio en 1 clic.'
          : 'You will see the success screen with "Open WhatsApp" to send your appointment card directly!',
        lang === 'pt'
          ? 'Adicione ao calendário do seu celular para nunca esquecer o compromisso.'
          : lang === 'es'
          ? 'Puedes agregar el evento a tu Google Calendar o calendario del móvil.'
          : 'Add the event straight to your Google or Apple Calendar.'
      ],
      tip: lang === 'pt'
        ? 'Você também receberá lembretes carinhosos antes do atendimento.'
        : lang === 'es'
        ? 'También recibirás recordatorios amables antes de tu cita.'
        : 'You will also receive friendly reminders prior to your session.',
      previewBadge: lang === 'pt' ? 'Confirmação' : lang === 'es' ? 'Confirmación' : 'Confirmation'
    },
    {
      title: lang === 'pt'
        ? '5. Dicas de Ouro para o Dia do Atendimento'
        : lang === 'es'
        ? '5. Consejos Clave para el Día de tu Cita'
        : '5. Golden Tips for Your Appointment Day',
      subtitle: lang === 'pt'
        ? 'Aproveite sua experiência de beleza ao máximo'
        : lang === 'es'
        ? 'Disfruta al máximo de tu experiencia de belleza'
        : 'Make the most out of your beauty experience',
      icon: <Heart className="w-5 h-5 text-amber-600" />,
      bullets: [
        lang === 'pt'
          ? 'Chegue com 5 a 10 minutos de antecedência para relaxar no espaço.'
          : lang === 'es'
          ? 'Llega con 5 a 10 minutos de anticipación para acomodarte tranquilamente.'
          : 'Arrive 5 to 10 minutes early to relax and settle in comfortably.',
        lang === 'pt'
          ? 'Para cílios e micropigmentação: venha com a região limpa, sem rímel ou maquiagem pesada nos olhos.'
          : lang === 'es'
          ? 'Para pestañas y cejas: acude con el rostro limpio, sin rímel a prueba de agua ni sombras.'
          : 'For lashes and brows: arrive with clean skin and free of heavy waterproof mascara.',
        lang === 'pt'
          ? 'Se precisar reagendar, avise pelo WhatsApp com pelo menos 24 horas de antecedência.'
          : lang === 'es'
          ? 'Si necesitas reprogramar, avisa por WhatsApp con al menos 24 horas de anticipación.'
          : 'If you need to reschedule, notify the specialist via WhatsApp at least 24 hours ahead.'
      ],
      tip: lang === 'pt'
        ? 'Pronta para realçar sua autoestima e beleza!'
        : lang === 'es'
        ? '¡Lista para realzar tu belleza y consentirte!'
        : 'Ready to enhance your glow and beauty!',
      previewBadge: lang === 'pt' ? 'Dicas de Beleza' : lang === 'es' ? 'Consejos Clave' : 'Beauty Tips'
    }
  ];

  const currentSteps = activeTab === 'pro' ? PRO_STEPS : CLIENT_STEPS;
  const currentStepIndex = activeTab === 'pro' ? proStep : clientStep;
  const setStepIndex = activeTab === 'pro' ? setProStep : setClientStep;
  const stepData = currentSteps[currentStepIndex];

  // Text for WhatsApp sharing so pro can teach clients
  const handleCopyGuideForWhatsApp = () => {
    const text = lang === 'pt'
      ? `✨ *Como Agendar Seu Horário no Studio ${profile.businessName || profile.name}* ✨\n\n` +
        `Meninas, agora ficou super fácil e rápido agendar seu procedimento sem esperar no WhatsApp! 🥰\n\n` +
        `1️⃣ Acesse meu link do catálogo: ${window.location.origin}?pro=${profile.slug || 'studio'}\n` +
        `2️⃣ Escolha o procedimento (Cílios, Sobrancelhas, Unhas, etc.) e veja fotos reais.\n` +
        `3️⃣ Selecione o melhor dia e horário disponível no calendário.\n` +
        `4️⃣ Coloque seu nome e WhatsApp e confirme!\n\n` +
        `Pronto! Sua vaga fica reservada na hora e você já recebe a confirmação. Te espero! 💖`
      : lang === 'es'
      ? `✨ *Cómo Reservar tu Cita en ${profile.businessName || profile.name}* ✨\n\n` +
        `¡Hola hermosa! Ahora puedes apartar tu turno en 1 minuto desde mi portal oficial sin esperar respuesta por mensaje: 🥰\n\n` +
        `1️⃣ Entra a mi enlace: ${window.location.origin}?pro=${profile.slug || 'studio'}\n` +
        `2️⃣ Elige tu servicio favorito (Pestañas, Cejas, Uñas...) y revisa fotos y precios.\n` +
        `3️⃣ Selecciona el día y horario que mejor te convenga en el calendario en vivo.\n` +
        `4️⃣ Ingresa tu nombre y WhatsApp para confirmar al instante.\n\n` +
        `¡Tu lugar queda asegurado de inmediato! Nos vemos pronto para consentirte. 💖`
      : `✨ *How to Book Your Appointment at ${profile.businessName || profile.name}* ✨\n\n` +
        `Booking your beauty session is now instant and hassle-free: 🥰\n\n` +
        `1️⃣ Open my booking link: ${window.location.origin}?pro=${profile.slug || 'studio'}\n` +
        `2️⃣ Pick your favorite service (Lashes, Brows, Nails...) and view photos & pricing.\n` +
        `3️⃣ Choose your preferred day and time from the live schedule.\n` +
        `4️⃣ Enter your name & WhatsApp to confirm on the spot!\n\n` +
        `Can’t wait to see you! 💖`;

    try {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-amber-300/80 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header with Gold Gradient Accent */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-amber-400/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-md flex items-center justify-center text-zinc-950 font-bold">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                  {t.tutorialTitle || 'Guía & Tutorial de Uso'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                  {lang === 'pt' ? 'Interativo' : 'Interactivo'}
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                {t.tutorialSub || 'Aprende a dominar la aplicación y guía a tus clientas para reservar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Professional vs Client */}
        <div className="bg-zinc-100 p-2 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => {
                setActiveTab('pro');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'pro'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 shadow-sm border border-amber-300'
                  : 'bg-white/80 hover:bg-white text-zinc-600 border border-transparent'
              }`}
            >
              <span>{t.tutorialTabPro || '💼 Para el Profesional'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'pro' ? 'bg-black/15 text-zinc-950' : 'bg-zinc-200 text-zinc-600'}`}>
                {PRO_STEPS.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('client');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'client'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 shadow-sm border border-amber-300'
                  : 'bg-white/80 hover:bg-white text-zinc-600 border border-transparent'
              }`}
            >
              <span>{t.tutorialTabClient || '🌸 Para los Clientes'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'client' ? 'bg-black/15 text-zinc-950' : 'bg-zinc-200 text-zinc-600'}`}>
                {CLIENT_STEPS.length}
              </span>
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-zinc-50 px-5 sm:px-6 py-2.5 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentSteps.map((s, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setStepIndex(idx)}
                  className={`flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'w-7 sm:w-8 h-7 sm:h-8 bg-zinc-950 text-amber-400 ring-2 ring-amber-400 shadow-xs'
                      : isDone
                      ? 'w-7 sm:w-8 h-7 sm:h-8 bg-amber-100 text-amber-900 border border-amber-300'
                      : 'w-7 sm:w-8 h-7 sm:h-8 bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                  }`}
                  title={s.title}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-zinc-700">
              {t.tutorialStep} {currentStepIndex + 1} / {currentSteps.length}
            </span>
          </div>
        </div>

        {/* Scrollable Body: Step Details & Mockup Visuals */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
          {/* Step Header Badge and Title */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              {stepData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {stepData.previewBadge || (activeTab === 'pro' ? 'Profissional' : 'Cliente')}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-zinc-950">
                {stepData.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                {stepData.subtitle}
              </p>
            </div>
          </div>

          {/* Bullet explanations */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'pt' ? 'Como Funciona na Prática:' : lang === 'es' ? 'Cómo Funciona en la Práctica:' : 'How It Works:'}</span>
            </h4>
            <div className="space-y-2.5">
              {stepData.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-800 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                    ✓
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Tip box if available for clients */}
            {'tip' in stepData && stepData.tip && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-950">
                <Star className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium">{stepData.tip}</span>
              </div>
            )}
          </div>

          {/* Interactive Step Actions */}
          <div className="pt-1">
            {activeTab === 'pro' ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Specific Pro Step Action Button */}
                {'actionBtn' in stepData && stepData.actionBtn && (
                  <button
                    onClick={() => {
                      if (stepData.actionBtn?.tab && onNavigateTab) {
                        onNavigateTab(stepData.actionBtn.tab);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  >
                    <span>{stepData.actionBtn.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Test notification button in Step 4 */}
                {'testAction' in stepData && stepData.testAction && onTestNotification && (
                  <button
                    onClick={() => {
                      onTestNotification();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 border border-amber-300"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{lang === 'pt' ? 'Tocar Alerta Sonoro de Teste' : lang === 'es' ? 'Probar Alerta Sonora y Notificación' : 'Test Sound Alert & Notification'}</span>
                  </button>
                )}

                {/* Copy guide for WhatsApp button */}
                <button
                  onClick={handleCopyGuideForWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-all ml-auto"
                  title="Copiar texto para enviar no WhatsApp das clientes"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                      <span>{t.tutorialCopied || '¡Copiado!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t.tutorialCopyWhatsApp || 'Copiar Guía para WhatsApp'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Client Tab Actions */
              <div className="flex flex-wrap items-center gap-2.5">
                {onStartBooking && (
                  <button
                    onClick={() => {
                      onStartBooking();
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 border border-amber-300"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    <span>{t.tutorialClientCTA || '¡Entendido, quiero agendar ahora!'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyGuideForWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-xs font-semibold transition-all ml-auto"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>{t.tutorialCopied || '¡Copiado!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{lang === 'pt' ? 'Copiar Passo a Passo' : lang === 'es' ? 'Copiar Paso a Paso' : 'Copy Step-by-Step'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Previous / Next Controls */}
        <div className="bg-zinc-100 px-5 sm:px-6 py-3.5 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              if (currentStepIndex > 0) {
                setStepIndex(currentStepIndex - 1);
              }
            }}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-zinc-400'
                : 'bg-white hover:bg-zinc-200 text-zinc-800 border border-zinc-200 shadow-xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.tutorialPrev || 'Anterior'}</span>
          </button>

          {/* Quick tab switcher hint */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <span>{activeTab === 'pro' ? 'Tutorial Profesional' : 'Tutorial Clientes'}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < currentSteps.length - 1 ? (
              <button
                onClick={() => {
                  setStepIndex(currentStepIndex + 1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-zinc-950 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
              >
                <span>{t.tutorialNext || 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 border border-amber-400/30"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.tutorialFinish || 'Comenzar a Usar'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
