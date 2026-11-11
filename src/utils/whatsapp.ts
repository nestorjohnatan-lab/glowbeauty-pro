import { Appointment, BeautyProProfile, BeautyService, WhatsAppTemplate, AppLanguage } from '../types';
import { formatPrice } from './i18n';

/**
 * Cleans and standardizes phone number for WhatsApp wa.me links
 * Strips non-digits, ensures country code is present (defaults to 55 for Brazil).
 */
export function cleanPhoneNumber(phone: string, defaultCountryCode = '55'): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // If 10 or 11 digits (Brazil without country code 55), prepend 55
  if (digits.length === 10 || digits.length === 11) {
    if (!digits.startsWith('55')) {
      digits = `${defaultCountryCode}${digits}`;
    }
  }

  return digits;
}

/**
 * Builds standard WhatsApp direct link
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${clean}?text=${encodedText}`;
}

/**
 * Formats a date string (YYYY-MM-DD) into readable Portuguese or Spanish
 */
export function formatFriendlyDate(dateStr: string, lang: string = 'pt'): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats structured bank or PIX details for inclusion in WhatsApp messages
 */
export function formatBankPaymentDetails(
  pro: BeautyProProfile,
  lang: string = 'pt',
  depositAmount?: number
): string {
  const bank = pro.bankPaymentDetails;
  const isPt = lang === 'pt';
  const isEs = lang === 'es';

  // Determine deposit amount string
  const depositVal = depositAmount !== undefined
    ? depositAmount
    : bank?.depositAmount || pro.depositFixedAmount || 30;
  const depositText = formatPrice(depositVal, pro.currency, lang);

  const lines: string[] = [];

  // Title
  if (isPt) {
    lines.push(`💳 *Dados para Pagamento do Sinal (${depositText}):*`);
  } else if (isEs) {
    lines.push(`💳 *Datos para Pago del Anticipo / Reserva (${depositText}):*`);
  } else {
    lines.push(`💳 *Payment & Deposit Details (${depositText}):*`);
  }

  // Check if PIX details are present
  const hasPix = Boolean((bank?.pixKey && bank.pixKey.trim()) || (pro.pixKey && pro.pixKey.trim()));
  const pixKeyVal = bank?.pixKey || pro.pixKey || '';
  const pixTypeVal = bank?.pixKeyType || pro.pixType || 'celular';
  const pixBeneficiary = bank?.pixBeneficiaryName || pro.name;
  const pixBankName = bank?.bankName || '';

  if (hasPix && bank?.preferenceMethod !== 'bank_transfer') {
    const typeLabel =
      pixTypeVal === 'celular' ? (isPt ? 'Celular' : 'Celular') :
      pixTypeVal === 'cpf' ? 'CPF' :
      pixTypeVal === 'cnpj' ? 'CNPJ' :
      pixTypeVal === 'email' ? 'E-mail' : (isPt ? 'Chave Aleatória' : 'Aleatoria');

    lines.push(`• *Chave PIX (${typeLabel}):* ${pixKeyVal}`);
    if (pixBeneficiary) {
      lines.push(`• *Beneficiário:* ${pixBeneficiary}`);
    }
    if (pixBankName) {
      lines.push(`• *Instituição:* ${pixBankName}`);
    }
    if (bank?.pixCity) {
      lines.push(`• *Cidade:* ${bank.pixCity}`);
    }
  }

  // Check if traditional bank details are present
  const hasBankDetails = Boolean(
    bank?.bankName ||
    bank?.accountNumber ||
    bank?.interbankCodeOrAlias ||
    bank?.accountHolderDocument
  );

  if (hasBankDetails && bank?.preferenceMethod !== 'pix') {
    if (hasPix) {
      lines.push(isPt ? `\n🏦 *Ou via Transferência Bancária:*` : `\n🏦 *O por Transferencia Bancaria:*`);
    }
    if (bank?.bankName && (!hasPix || bank?.preferenceMethod === 'both')) {
      lines.push(`• *Banco:* ${bank.bankName}`);
    }
    if (bank?.accountType) {
      const typeLabel =
        bank.accountType === 'corrente' ? (isPt ? 'Conta Corrente' : 'Cuenta Corriente') :
        bank.accountType === 'poupanca' ? (isPt ? 'Poupança' : 'Ahorros') :
        bank.accountType === 'ahorros' ? 'Ahorros' : 'Corriente';
      lines.push(`• *Tipo:* ${typeLabel}`);
    }
    if (bank?.agencyNumber) {
      lines.push(`• *Agência / Sucursal:* ${bank.agencyNumber}`);
    }
    if (bank?.accountNumber) {
      lines.push(`• *Conta:* ${bank.accountNumber}`);
    }
    if (bank?.interbankCodeOrAlias) {
      const label = pro.currency === 'MXN' ? 'CLABE Interbancaria' :
                    pro.currency === 'ARS' ? 'CBU / Alias' :
                    pro.currency === 'COP' ? 'Nequi / CBU' :
                    'Código / Alias';
      lines.push(`• *${label}:* ${bank.interbankCodeOrAlias}`);
    }
    if (bank?.accountHolderName) {
      lines.push(`• *Titular:* ${bank.accountHolderName}`);
    }
    if (bank?.accountHolderDocument) {
      const docLabel = pro.countryCode === 'BR' ? 'CPF' :
                       pro.countryCode === 'MX' ? 'RFC' :
                       pro.countryCode === 'CO' ? 'C.C.' :
                       pro.countryCode === 'AR' ? 'DNI / CUIT' : 'Documento';
      lines.push(`• *${docLabel}:* ${bank.accountHolderDocument}`);
    }
  }

  // Instructions & deadline
  const instructions = bank?.instructions ||
    (isPt
      ? `Por favor envie o comprovante do sinal por este WhatsApp em até ${bank?.paymentDeadlineHours || 2} horas para confirmar e reservar seu horário.`
      : `Por favor envía el comprobante del anticipo por este WhatsApp dentro de ${bank?.paymentDeadlineHours || 2} horas para apartar tu cupo.`);
  lines.push(`📝 *Instruções:* ${instructions}`);

  return lines.join('\n');
}

/**
 * Interpolates variables inside a template string
 */
export function interpolateTemplate(
  template: string,
  data: {
    cliente?: string;
    servicio?: string;
    fecha?: string;
    hora?: string;
    precio?: number | string;
    currency?: string;
    profesional?: string;
    negocio?: string;
    direccion?: string;
    link?: string;
    dias?: number | string;
    cuidados?: string;
    pix?: string;
    datos_bancarios?: string;
    anticipo?: string;
    banco?: string;
    titular?: string;
    instrucciones_pago?: string;
  }
): string {
  let result = template;
  result = result.replace(/\{cliente\}/g, data.cliente || 'Cliente');
  result = result.replace(/\{servicio\}/g, data.servicio || 'Procedimento');
  result = result.replace(/\{fecha\}/g, data.fecha || '');
  result = result.replace(/\{hora\}/g, data.hora || '');
  result = result.replace(/\{precio\}/g, String(data.precio || ''));
  result = result.replace(/\{currency\}/g, data.currency || 'BRL');
  result = result.replace(/\{profesional\}/g, data.profesional || 'Especialista');
  result = result.replace(/\{negocio\}/g, data.negocio || 'Studio de Beleza');
  result = result.replace(/\{direccion\}/g, data.direccion || '');
  result = result.replace(/\{link\}/g, data.link || '');
  result = result.replace(/\{dias\}/g, String(data.dias || '21'));
  result = result.replace(/\{cuidados\}/g, data.cuidados || '');
  result = result.replace(/\{pix\}/g, data.pix || '');
  result = result.replace(/\{datos_bancarios\}/g, data.datos_bancarios || data.pix || '');
  result = result.replace(/\{anticipo\}/g, data.anticipo || '');
  result = result.replace(/\{banco\}/g, data.banco || '');
  result = result.replace(/\{titular\}/g, data.titular || '');
  result = result.replace(/\{instrucciones_pago\}/g, data.instrucciones_pago || '');
  return result;
}

/**
 * Generates client booking confirmation message sent to the Professional's WhatsApp
 */
export function generateClientBookingMessageForPro(
  appointment: Partial<Appointment>,
  service: BeautyService,
  pro: BeautyProProfile,
  lang: string = 'pt'
): string {
  const friendlyDate = formatFriendlyDate(appointment.date || '', lang);
  const formattedPrice = formatPrice(service.price, pro.currency, lang);
  const paymentSection = formatBankPaymentDetails(pro, lang, appointment.depositAmount);

  if (lang === 'pt') {
    return `Olá ${pro.name}! ✨ Acabei de agendar um horário com você pelo seu catálogo online:

📅 *Data:* ${friendlyDate}
⏰ *Horário:* ${appointment.time}h
✂️ *Procedimento:* ${service.name} (${service.durationMinutes} min)
💰 *Valor:* ${formattedPrice}
👤 *Cliente:* ${appointment.clientName}
📱 *WhatsApp:* ${appointment.clientWhatsapp}
${appointment.clientNotes ? `📝 *Observação:* ${appointment.clientNotes}\n` : ''}
📍 *Local:* ${pro.businessName} (${pro.address})

${paymentSection}

Por favor, confirme se recebeu meu agendamento. Muito obrigada! 💕`;
  }

  // Spanish fallback
  return `¡Hola ${pro.name}! ✨ Acabo de agendar una cita contigo a través de tu link:

📅 *Fecha:* ${friendlyDate}
⏰ *Hora:* ${appointment.time} hrs
✂️ *Servicio:* ${service.name} (${service.durationMinutes} min)
💰 *Precio:* ${formattedPrice}
👤 *Cliente:* ${appointment.clientName}
📱 *WhatsApp:* ${appointment.clientWhatsapp}
${appointment.clientNotes ? `📝 *Notas:* ${appointment.clientNotes}\n` : ''}
📍 *Lugar:* ${pro.businessName} (${pro.address})

${paymentSection}

Por favor confírmame que recibiste mi cita. ¡Muchas gracias! 💕`;
}

/**
 * Generates professional appointment confirmation message sent to the Client's WhatsApp
 */
export function generateProConfirmationMessageForClient(
  appointment: Appointment,
  pro: BeautyProProfile,
  service?: BeautyService,
  lang: string = 'pt'
): string {
  const friendlyDate = formatFriendlyDate(appointment.date, lang);
  const formattedPrice = formatPrice(appointment.price, appointment.currency, lang);
  const isPt = lang === 'pt';
  const paymentBlock = formatBankPaymentDetails(pro, lang, appointment.depositAmount);

  if (isPt) {
    const prep = service?.prepInstructions ? `\n💡 *Recomendação prévia:* ${service.prepInstructions}` : '';
    return `Olá ${appointment.clientName}! ✨ Seu horário foi *CONFIRMADO* com sucesso em *${pro.businessName}*! 💕

📅 *Data:* ${friendlyDate}
⏰ *Horário:* ${appointment.time}h
✂️ *Procedimento:* ${appointment.serviceName}
💰 *Valor Total:* ${formattedPrice}
📍 *Endereço:* ${pro.address}${prep}

${paymentBlock}

⚠️ Em caso de imprevisto ou necessidade de reagendar, avise com antecedência. Estamos ansiosos para te receber! ✨`;
  }

  const prep = service?.prepInstructions ? `\n💡 *Recomendación previa:* ${service.prepInstructions}` : '';
  return `¡Hola ${appointment.clientName}! ✨ Tu cita está *CONFIRMADA* con éxito en *${pro.businessName}*! 💕

📅 *Fecha:* ${friendlyDate}
⏰ *Hora:* ${appointment.time} hrs
✂️ *Servicio:* ${appointment.serviceName}
💰 *Total:* ${formattedPrice}
📍 *Dirección:* ${pro.address}${prep}

${paymentBlock}

⚠️ Si necesitas reagendar, avísanos con anticipación. ¡Te esperamos con mucho cariño! ✨`;
}

/**
 * Generates 24-hour reminder message sent by Pro to Client
 */
export function generate24hReminderMessage(
  appointment: Appointment,
  pro: BeautyProProfile,
  service?: BeautyService,
  lang: string = 'pt'
): string {
  const friendlyDate = formatFriendlyDate(appointment.date, lang);
  const formattedPrice = formatPrice(appointment.price, appointment.currency, lang);

  if (lang === 'pt') {
    const prep = service?.prepInstructions ? `\n💡 *Recomendação prévia:* ${service.prepInstructions}` : '';
    return `Olá ${appointment.clientName}! 🌸 Passando para lembrar do seu atendimento amanhã em *${pro.businessName}*:

📅 *Dia:* ${friendlyDate}
⏰ *Horário:* ${appointment.time}h
✨ *Procedimento:* ${appointment.serviceName}
📍 *Endereço:* ${pro.address}
💰 *Valor:* ${formattedPrice}${prep}

⚠️ Em caso de imprevisto ou necessidade de reagendar, por favor avise com antecedência.
Você confirma sua presença? Estamos ansiosos para te receber com muito carinho! 💕`;
  }

  const prep = service?.prepInstructions ? `\n💡 *Recomendación previa:* ${service.prepInstructions}` : '';
  return `¡Hola ${appointment.clientName}! 🌸 Te escribo de *${pro.businessName}*.

Te recordamos tu cita programada:
📅 *Día:* ${friendlyDate}
⏰ *Hora:* ${appointment.time} hrs
✨ *Servicio:* ${appointment.serviceName}
📍 *Dirección:* ${pro.address}
💰 *Total:* ${formattedPrice}${prep}

⚠️ Si necesitas reagendar, avísanos con al menos 4 horas de anticipación.
¿Nos confirmas tu asistencia respondiendo este mensaje? ¡Te esperamos! 💕`;
}

/**
 * Generates Maintenance / Retoque alert message sent by Pro to Client (e.g. 18-25 days after)
 */
export function generateMaintenanceAlertMessage(
  appointment: Appointment,
  pro: BeautyProProfile,
  daysElapsed: number,
  bookingUrl: string,
  service?: BeautyService,
  lang: string = 'pt'
): string {
  if (lang === 'pt') {
    const note = service?.maintenanceNote || 'Recomendamos manutenção periódica para manter seus fios ou unhas impecáveis e saudáveis.';
    return `Olá ${appointment.clientName}! ✨ Tudo bem? Aqui é a ${pro.name} do *${pro.businessName}*.

Já se passaram *${daysElapsed} dias* desde a sua última sessão de *${appointment.serviceName}* e queremos saber como você está se sentindo com seus resultados 💕

💅 ${note}

Gostaria de garantir seu horário para retoque ou manutenção esta semana?
👉 Escolha seu melhor dia e horário diretamente no meu catálogo:
${bookingUrl}

Vou amar te receber novamente! ✨`;
  }

  const note = service?.maintenanceNote || `Se recomienda retoque para mantener la densidad y acabado perfecto.`;
  return `¡Hola ${appointment.clientName}! ✨ ¿Cómo estás? Te saluda ${pro.name} de *${pro.businessName}*.

Han pasado *${daysElapsed} días* desde tu última cita de *${appointment.serviceName}* y queremos saber cómo te sientes con tus resultados 💕

💅 ${note}

¿Te gustaría asegurar tu lugar para tu retoque o mantenimiento esta semana?
👉 Puedes ver mis horarios disponibles y agendar directamente aquí:
${bookingUrl}

¡Estaré encantada de atenderte de nuevo! ✨`;
}

/**
 * Generates Aftercare instructions message sent after appointment
 */
export function generateAftercareMessage(
  appointment: Appointment,
  pro: BeautyProProfile,
  service?: BeautyService,
  lang: string = 'pt'
): string {
  if (lang === 'pt') {
    const care = service?.careInstructions || 'Evite água quente e produtos oleosos nas primeiras 24 horas.';
    return `Muito obrigada pela sua visita hoje, ${appointment.clientName}! 💖 Foi um enorme prazer te atender em *${pro.businessName}*.

Para que seu *${appointment.serviceName}* permaneça impecável por muito mais tempo, aqui estão os cuidados essenciais:
🌸 ${care}

Qualquer dúvida estou à sua total disposição por este WhatsApp. Tenha dias incríveis! ✨`;
  }

  const care = service?.careInstructions || 'Evita el agua caliente y productos oleosos durante las primeras 24 horas.';
  return `¡Muchas gracias por tu visita hoy, ${appointment.clientName}! 💖 Nos encantó consentirte en *${pro.businessName}*.

Para que tu *${appointment.serviceName}* se mantenga impecable por más tiempo, aquí tienes los cuidados clave:
🌸 ${care}

Cualquier duda o consulta, estoy siempre a tus órdenes por este medio. ¡Que tengas un día increíble! ✨`;
}

/**
 * Generates calendar iCal file download for client
 */
export function downloadIcsCalendar(appointment: Appointment, pro: BeautyProProfile): void {
  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    const [hours, minutes] = appointment.time.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + (appointment.durationMinutes || 60) * 60000);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatIcsTime = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GlowBeauty Pro//Agendamento Beleza//PT',
      'BEGIN:VEVENT',
      `UID:glow-${appointment.id}@glowbeauty.lat`,
      `DTSTAMP:${formatIcsTime(new Date())}`,
      `DTSTART:${formatIcsTime(startDate)}`,
      `DTEND:${formatIcsTime(endDate)}`,
      `SUMMARY:Agendamento: ${appointment.serviceName} com ${pro.name}`,
      `DESCRIPTION:Atendimento em ${pro.businessName}. Valor: R$ ${appointment.price}. Contato: ${pro.whatsapp}`,
      `LOCATION:${pro.address || pro.businessName}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agendamento-${appointment.date}-${appointment.time.replace(':', 'h')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error generating ics calendar', err);
  }
}
