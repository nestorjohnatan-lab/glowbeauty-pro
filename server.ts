import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  BeautyProProfile,
  BeautyService,
  Appointment,
  ClientTechnicalNote
} from './src/types.ts';
import {
  INITIAL_PRO_PROFILE,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_TEMPLATES
} from './src/data/initialData.ts';
import {
  getProfileFromDb,
  saveProfileToDb,
  getServicesFromDb,
  createServiceInDb,
  updateServiceInDb,
  deleteServiceFromDb,
  getAppointmentsFromDb,
  createAppointmentInDb,
  updateAppointmentInDb,
  deleteAppointmentFromDb,
  getTemplatesFromDb,
  updateTemplateInDb,
  getClientTechnicalNotesFromDb,
  saveClientTechnicalNoteToDb,
  verifyAdminLogin,
  getAdminEmail,
  updateAdminCredentials,
  initAdminCredentialsIfEmpty
} from './src/db/queries.ts';
import { requireAuth, optionalAuth, signJwt, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

// Ensure default credentials exist on startup
initAdminCredentialsIfEmpty();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// Health Endpoint
// ----------------------------------------------------
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const [profile, appts, srvs] = await Promise.all([
      getProfileFromDb().catch(() => INITIAL_PRO_PROFILE),
      getAppointmentsFromDb().catch(() => INITIAL_APPOINTMENTS),
      getServicesFromDb().catch(() => INITIAL_SERVICES)
    ]);

    res.json({
      status: 'healthy',
      database: 'SQLite (native node:sqlite WAL mode)',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      pro: profile.name,
      appointmentsCount: appts.length,
      servicesCount: srvs.length
    });
  } catch (error: any) {
    res.json({
      status: 'degraded',
      error: error?.message || 'Error checking status',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// Auth Endpoints (Professional Admin Login)
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' });
    return;
  }

  const isValid = verifyAdminLogin(email, password);
  if (!isValid) {
    res.status(401).json({ error: 'Credenciales inválidas. Revisa tu email o contraseña.' });
    return;
  }

  const token = signJwt(email);
  res.json({
    token,
    user: {
      email,
      role: 'pro'
    }
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

app.put('/api/auth/credentials', requireAuth, (req: AuthRequest, res: Response) => {
  const { email, newPassword, currentPassword } = req.body;
  if (!currentPassword) {
    res.status(400).json({ error: 'Debes ingresar tu contraseña actual para confirmar cambios.' });
    return;
  }

  const currentEmail = req.user?.email || getAdminEmail();
  if (!verifyAdminLogin(currentEmail, currentPassword)) {
    res.status(403).json({ error: 'Contraseña actual incorrecta.' });
    return;
  }

  updateAdminCredentials(email, newPassword);
  const updatedEmail = email || currentEmail;
  const newToken = signJwt(updatedEmail);

  res.json({
    success: true,
    message: 'Credenciales actualizadas exitosamente.',
    token: newToken,
    email: updatedEmail
  });
});

// ----------------------------------------------------
// Professional Profile Endpoints
// ----------------------------------------------------
// Public endpoint for clients to view salon info
app.get('/api/public/profile', async (_req: Request, res: Response) => {
  try {
    const [profile, allServices] = await Promise.all([
      getProfileFromDb(),
      getServicesFromDb()
    ]);
    res.json({
      profile,
      services: allServices.filter((s) => s.isActive)
    });
  } catch (error: any) {
    res.json({
      profile: INITIAL_PRO_PROFILE,
      services: INITIAL_SERVICES.filter((s) => s.isActive)
    });
  }
});

// Admin Profile Endpoints (protected)
app.get('/api/profile', async (_req: Request, res: Response) => {
  try {
    const profile = await getProfileFromDb();
    res.json(profile);
  } catch (error: any) {
    res.json(INITIAL_PRO_PROFILE);
  }
});

app.put('/api/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = await saveProfileToDb(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error guardando perfil' });
  }
});

// ----------------------------------------------------
// Services Catalog Endpoints
// ----------------------------------------------------
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const list = await getServicesFromDb();
    res.json(list);
  } catch (error: any) {
    res.json(INITIAL_SERVICES);
  }
});

app.post('/api/services', requireAuth, async (req: Request, res: Response) => {
  try {
    const newService: BeautyService = {
      id: req.body.id || `srv-${Date.now()}`,
      category: req.body.category || 'outro',
      name: req.body.name || 'Novo Serviço',
      description: req.body.description || '',
      durationMinutes: Number(req.body.durationMinutes) || 60,
      price: Number(req.body.price) || 120,
      imageUrl: req.body.imageUrl || '',
      galleryUrls: Array.isArray(req.body.galleryUrls) ? req.body.galleryUrls : [],
      suggestedMaintenanceDays: Number(req.body.suggestedMaintenanceDays) || 21,
      maintenanceNote: req.body.maintenanceNote || '',
      prepInstructions: req.body.prepInstructions || '',
      careInstructions: req.body.careInstructions || '',
      isActive: req.body.isActive ?? true,
      popular: req.body.popular ?? false
    };

    const saved = await createServiceInDb(newService);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creando servicio' });
  }
});

app.put('/api/services/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateServiceInDb(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Servicio no encontrado' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error actualizando servicio' });
  }
});

app.delete('/api/services/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteServiceFromDb(id);
    res.json({ success: true, message: 'Servicio eliminado' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error eliminando servicio' });
  }
});

// ----------------------------------------------------
// Appointments Endpoints
// ----------------------------------------------------
// Clients can create appointments publicly
app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const allServices = await getServicesFromDb().catch(() => INITIAL_SERVICES);
    const matchedService = allServices.find((s) => s.id === body.serviceId);
    const currentProfile = await getProfileFromDb().catch(() => INITIAL_PRO_PROFILE);

    const newAppointment: Appointment = {
      id: body.id || `apt-${Date.now()}`,
      clientName: body.clientName || 'Cliente',
      clientWhatsapp: body.clientWhatsapp || '',
      clientNotes: body.clientNotes || '',
      serviceId: body.serviceId || allServices[0]?.id || 'srv-1',
      serviceName: body.serviceName || matchedService?.name || 'Servicio de Belleza',
      serviceCategory: body.serviceCategory || matchedService?.category || 'outro',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '10:00',
      durationMinutes: Number(body.durationMinutes || matchedService?.durationMinutes) || 60,
      price: Number(body.price || matchedService?.price) || 120,
      currency: body.currency || currentProfile.currency || 'BRL',
      status: body.status || 'confirmed',
      createdAt: new Date().toISOString(),
      depositPaid: body.depositPaid ?? false,
      depositAmount: body.depositAmount ? Number(body.depositAmount) : undefined,
      reminder24hSent: false,
      reminderTodaySent: false,
      maintenanceAlertSent: false
    };

    const saved = await createAppointmentInDb(newAppointment);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creando cita' });
  }
});

// Pro dashboard reads and updates appointments
app.get('/api/appointments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const list = await getAppointmentsFromDb(date as string, status as string);
    res.json(list);
  } catch (error: any) {
    res.json(INITIAL_APPOINTMENTS);
  }
});

// Public read-only booked slots for clients to know which hours are taken
app.get('/api/public/occupied-slots', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      res.json([]);
      return;
    }
    const list = await getAppointmentsFromDb(date as string);
    // Return only active booked times, without disclosing client personal data
    const occupied = list
      .filter((a) => a.status !== 'cancelled')
      .map((a) => ({ time: a.time, durationMinutes: a.durationMinutes }));
    res.json(occupied);
  } catch {
    res.json([]);
  }
});

app.patch('/api/appointments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateAppointmentInDb(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Cita no encontrada' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error actualizando cita' });
  }
});

app.patch('/api/appointments/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateAppointmentInDb(id, { status });
    if (!updated) {
      res.status(404).json({ error: 'Cita no encontrada' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error actualizando estado' });
  }
});

app.delete('/api/appointments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteAppointmentFromDb(id);
    res.json({ success: true, message: 'Cita eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error eliminando cita' });
  }
});

// ----------------------------------------------------
// WhatsApp Templates Endpoints (Protected)
// ----------------------------------------------------
app.get('/api/templates', requireAuth, async (_req: Request, res: Response) => {
  try {
    const list = await getTemplatesFromDb();
    res.json(list);
  } catch (error: any) {
    res.json(INITIAL_TEMPLATES);
  }
});

app.put('/api/templates/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { template, title } = req.body;
    const updated = await updateTemplateInDb(id, template, title);
    if (!updated) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error actualizando plantilla' });
  }
});

// ----------------------------------------------------
// Client Technical Notes Endpoints (Protected)
// ----------------------------------------------------
app.get('/api/technical-notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string | undefined;
    const notes = await getClientTechnicalNotesFromDb(phone);
    res.json(notes);
  } catch (error: any) {
    res.json([]);
  }
});

app.post('/api/technical-notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const note: ClientTechnicalNote = {
      id: req.body.id || `note-${Date.now()}`,
      clientPhone: req.body.clientPhone,
      clientName: req.body.clientName,
      serviceCategory: req.body.serviceCategory,
      lastUpdated: req.body.lastUpdated || new Date().toISOString().split('T')[0],
      ...req.body
    };
    const saved = await saveClientTechnicalNoteToDb(note);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error guardando ficha técnica' });
  }
});

// ----------------------------------------------------
// AI Beauty Assistant / Copilot (Gemini API with Fallback)
// ----------------------------------------------------
app.post('/api/support/chat', optionalAuth, async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Mensaje requerido' });
    return;
  }

  const currentProfile = await getProfileFromDb().catch(() => INITIAL_PRO_PROFILE);
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
Eres la Asistente Inteligente y Consultora de Negocios de Belleza para ${currentProfile.name} (${currentProfile.businessName}).
Ayudas a la profesional a:
1. Redactar mensajes persuasivos de WhatsApp para confirmaciones, recordatorios y alertas de retoque.
2. Consejos para evitar inasistencias (no-shows) cobrando depósitos o enviando recordatorios con tiempo.
3. Fijación de precios y márgenes de ganancia para servicios de belleza.
Sé cordial, concisa, práctica y usa emojis bonitos.
      `;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: { systemInstruction, temperature: 0.7 }
      });

      res.json({ reply: aiResponse.text || 'Respuesta generada.' });
      return;
    } catch (err) {
      console.error('Gemini call error:', err);
    }
  }

  // Fallback
  res.json({
    reply: `¡Hola! Como asistente de ${currentProfile.businessName}, te sugiero enviar recordatorios por WhatsApp 24 horas antes y agendar los retoques a los 21 días para fidelizar a tus clientas.`
  });
});

app.post('/api/ai/reply-client', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      clientMessage = '',
      scenario = 'free_inquiry',
      clientName = '',
      clientPhone = '',
      serviceId = '',
      tone = 'warm_friendly',
      customInstructions = ''
    } = req.body;

    const [currentProfile, allServices] = await Promise.all([
      getProfileFromDb().catch(() => INITIAL_PRO_PROFILE),
      getServicesFromDb().catch(() => INITIAL_SERVICES)
    ]);

    const activeServices = allServices.filter((s) => s.isActive);
    const targetService = activeServices.find((s) => s.id === serviceId);
    const bookingUrl = currentProfile.customShareLink || `https://${req.headers.host || 'tudominio.com'}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
Eres el Agente de IA para responder clientes de ${currentProfile.name} (${currentProfile.businessName}).
Redacta la respuesta lista para copiar y pegar por WhatsApp.
Enlace de reservas: ${bookingUrl}
Moneda: ${currentProfile.currency}
        `;
        const userPrompt = `Clienta: ${clientName || 'Clienta'}, Escenario: ${scenario}, Mensaje: "${clientMessage}". Instrucción: "${customInstructions}".`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userPrompt,
          config: { systemInstruction, temperature: 0.7 }
        });

        if (aiResponse.text) {
          res.json({ reply: aiResponse.text, suggestions: ['Confirmar turno', 'Enviar datos de seña'] });
          return;
        }
      } catch (err) {
        console.warn('Gemini reply fallback triggered:', err);
      }
    }

    // Dynamic fallback
    const greeting = clientName ? `¡Hola ${clientName}! 🌸` : '¡Hola bella! 🌸';
    let reply = `${greeting} Con gusto te atiendo en *${currentProfile.businessName}*.\n\nPuedes consultar mis horarios disponibles y reservar tu cita directamente en:\n👉 ${bookingUrl}\n\n¡Cualquier duda avísame con confianza! ✨`;
    if (targetService) {
      reply = `${greeting} Con gusto te cuento sobre *${targetService.name}* ✨\n\nTiene un valor de *${currentProfile.currency} ${targetService.price}* y duración de aprox. *${targetService.durationMinutes} min*.\n\nPuedes reservar tu turno aquí:\n👉 ${bookingUrl}\n\n¿Qué día te queda mejor? 💖`;
    }

    res.json({
      reply,
      suggestions: ['Enviar catálogo', 'Ofrecer un turno concreto']
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en respuesta de IA' });
  }
});

// ----------------------------------------------------
// Vite Middleware / Static Production Server
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ GlowBeauty Pro running on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Admin Login: ${getAdminEmail()} / admin123* (cámbiala en tu panel)`);
  });
}

startServer();
