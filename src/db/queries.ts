import { getDb } from './index.ts';
import {
  BeautyProProfile,
  BeautyService,
  Appointment,
  WhatsAppTemplate,
  ClientTechnicalNote
} from '../types.ts';
import {
  INITIAL_PRO_PROFILE,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_TEMPLATES
} from '../data/initialData.ts';
import { getBackupProfile, loadBackupFromFile } from './serverBackup.ts';
import { hashPassword, verifyPassword } from '../middleware/auth.ts';

// ----------------------------------------------------
// Admin Credentials Queries (Single Professional)
// ----------------------------------------------------
export function initAdminCredentialsIfEmpty(defaultEmail = 'admin@glowbeauty.pro', defaultPassword = 'admin123*') {
  const db = getDb();
  const row = db.prepare('SELECT id FROM admin_credentials WHERE id = 1').get();
  if (!row) {
    const hashed = hashPassword(defaultPassword);
    db.prepare(`
      INSERT INTO admin_credentials (id, email, password_hash, updated_at)
      VALUES (1, ?, ?, ?)
    `).run(defaultEmail.toLowerCase().trim(), hashed, new Date().toISOString());
  }
}

export function verifyAdminLogin(email: string, password: string): boolean {
  initAdminCredentialsIfEmpty();
  const db = getDb();
  const row = db.prepare('SELECT email, password_hash FROM admin_credentials WHERE id = 1').get() as { email: string; password_hash: string } | undefined;
  if (!row) return false;
  if (row.email.toLowerCase().trim() !== email.toLowerCase().trim()) return false;
  return verifyPassword(password, row.password_hash);
}

export function updateAdminCredentials(email?: string, newPassword?: string) {
  initAdminCredentialsIfEmpty();
  const db = getDb();
  const current = db.prepare('SELECT email, password_hash FROM admin_credentials WHERE id = 1').get() as { email: string; password_hash: string };
  const targetEmail = email ? email.toLowerCase().trim() : current.email;
  const targetHash = newPassword ? hashPassword(newPassword) : current.password_hash;
  db.prepare(`
    UPDATE admin_credentials
    SET email = ?, password_hash = ?, updated_at = ?
    WHERE id = 1
  `).run(targetEmail, targetHash, new Date().toISOString());
}

export function getAdminEmail(): string {
  initAdminCredentialsIfEmpty();
  const db = getDb();
  const row = db.prepare('SELECT email FROM admin_credentials WHERE id = 1').get() as { email: string } | undefined;
  return row ? row.email : 'admin@glowbeauty.pro';
}

// ----------------------------------------------------
// Profile Queries
// ----------------------------------------------------
export async function getProfileFromDb(): Promise<BeautyProProfile> {
  const db = getDb();
  const row = db.prepare('SELECT data FROM profile LIMIT 1').get() as { data: string } | undefined;
  if (row) {
    try {
      return JSON.parse(row.data) as BeautyProProfile;
    } catch (e) {
      console.warn('Failed parsing profile from SQLite, using backup', e);
    }
  }

  // Seed from backup if exists
  const backupState = loadBackupFromFile();
  const defaultProfile = backupState?.profile || getBackupProfile() || INITIAL_PRO_PROFILE;
  
  // Directly insert to avoid recursive call
  const stmt = db.prepare(`
    INSERT INTO profile (id, slug, data, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      data = excluded.data,
      updated_at = excluded.updated_at
  `);
  stmt.run(defaultProfile.id || 'pro-primary', defaultProfile.slug || 'studio', JSON.stringify(defaultProfile), new Date().toISOString());
  return defaultProfile;
}

export async function saveProfileToDb(data: Partial<BeautyProProfile>): Promise<BeautyProProfile> {
  const db = getDb();
  let existingProfile: BeautyProProfile = INITIAL_PRO_PROFILE;
  const row = db.prepare('SELECT data FROM profile LIMIT 1').get() as { data: string } | undefined;
  if (row) {
    try {
      existingProfile = JSON.parse(row.data);
    } catch {}
  } else {
    const backupState = loadBackupFromFile();
    existingProfile = backupState?.profile || getBackupProfile() || INITIAL_PRO_PROFILE;
  }

  const merged: BeautyProProfile = {
    ...existingProfile,
    ...data
  };

  const stmt = db.prepare(`
    INSERT INTO profile (id, slug, data, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      data = excluded.data,
      updated_at = excluded.updated_at
  `);
  stmt.run(merged.id || 'pro-primary', merged.slug || 'studio', JSON.stringify(merged), new Date().toISOString());
  return merged;
}

// ----------------------------------------------------
// Services Queries
// ----------------------------------------------------
export async function getServicesFromDb(): Promise<BeautyService[]> {
  const db = getDb();
  const rows = db.prepare('SELECT data FROM services ORDER BY name ASC').all() as { data: string }[];
  if (rows && rows.length > 0) {
    return rows.map((r) => JSON.parse(r.data) as BeautyService);
  }

  // Seed with initial services or backup
  const backup = loadBackupFromFile();
  const initialList = backup?.services?.length ? backup.services : INITIAL_SERVICES;
  for (const s of initialList) {
    await createServiceInDb(s);
  }
  return initialList;
}

export async function createServiceInDb(service: BeautyService): Promise<BeautyService> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO services (id, category, name, price, duration_minutes, is_active, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      category = excluded.category,
      name = excluded.name,
      price = excluded.price,
      duration_minutes = excluded.duration_minutes,
      is_active = excluded.is_active,
      data = excluded.data
  `);
  stmt.run(
    service.id,
    service.category,
    service.name,
    service.price,
    service.durationMinutes,
    service.isActive ? 1 : 0,
    JSON.stringify(service),
    new Date().toISOString()
  );
  return service;
}

export async function updateServiceInDb(id: string, data: Partial<BeautyService>): Promise<BeautyService | null> {
  const db = getDb();
  const row = db.prepare('SELECT data FROM services WHERE id = ?').get(id) as { data: string } | undefined;
  if (!row) return null;
  const current = JSON.parse(row.data) as BeautyService;
  const updated: BeautyService = { ...current, ...data };
  await createServiceInDb(updated);
  return updated;
}

export async function deleteServiceFromDb(id: string): Promise<boolean> {
  const db = getDb();
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  return true;
}

// ----------------------------------------------------
// Appointments Queries
// ----------------------------------------------------
export async function getAppointmentsFromDb(date?: string, status?: string): Promise<Appointment[]> {
  const db = getDb();
  let query = 'SELECT data FROM appointments';
  const conditions: string[] = [];
  const params: any[] = [];

  if (date) {
    conditions.push('date = ?');
    params.push(date);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY date DESC, time ASC';

  const rows = db.prepare(query).all(...params) as { data: string }[];
  if (rows && rows.length > 0) {
    return rows.map((r) => JSON.parse(r.data) as Appointment);
  }

  // Seed if brand new
  const backup = loadBackupFromFile();
  const initial = backup?.appointments?.length ? backup.appointments : INITIAL_APPOINTMENTS;
  for (const a of initial) {
    await createAppointmentInDb(a);
  }
  return initial;
}

export async function createAppointmentInDb(apt: Appointment): Promise<Appointment> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO appointments (id, date, time, status, client_name, client_whatsapp, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      date = excluded.date,
      time = excluded.time,
      status = excluded.status,
      client_name = excluded.client_name,
      client_whatsapp = excluded.client_whatsapp,
      data = excluded.data
  `);
  stmt.run(
    apt.id,
    apt.date,
    apt.time,
    apt.status || 'confirmed',
    apt.clientName,
    apt.clientWhatsapp,
    JSON.stringify(apt),
    apt.createdAt || new Date().toISOString()
  );
  return apt;
}

export async function updateAppointmentInDb(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
  const db = getDb();
  const row = db.prepare('SELECT data FROM appointments WHERE id = ?').get(id) as { data: string } | undefined;
  if (!row) return null;
  const current = JSON.parse(row.data) as Appointment;
  const updated: Appointment = { ...current, ...data };
  await createAppointmentInDb(updated);
  return updated;
}

export async function deleteAppointmentFromDb(id: string): Promise<boolean> {
  const db = getDb();
  db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  return true;
}

// ----------------------------------------------------
// WhatsApp Templates Queries
// ----------------------------------------------------
export async function getTemplatesFromDb(): Promise<WhatsAppTemplate[]> {
  const db = getDb();
  const rows = db.prepare('SELECT id, type, title, template FROM templates').all() as WhatsAppTemplate[];
  if (rows && rows.length > 0) {
    return rows;
  }

  const initial = INITIAL_TEMPLATES;
  for (const t of initial) {
    db.prepare(`
      INSERT INTO templates (id, type, title, template, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).run(t.id, t.type, t.title, t.template, new Date().toISOString());
  }
  return initial;
}

export async function updateTemplateInDb(id: string, template: string, title?: string): Promise<WhatsAppTemplate | null> {
  const db = getDb();
  const existing = db.prepare('SELECT id, type, title, template FROM templates WHERE id = ?').get(id) as WhatsAppTemplate | undefined;
  const targetTitle = title || existing?.title || 'Plantilla';
  const targetType = existing?.type || 'reminder_24h';

  db.prepare(`
    INSERT INTO templates (id, type, title, template, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      template = excluded.template,
      title = excluded.title,
      updated_at = excluded.updated_at
  `).run(id, targetType, targetTitle, template, new Date().toISOString());

  return { id, type: targetType, title: targetTitle, template };
}

// ----------------------------------------------------
// Client Technical Notes Queries
// ----------------------------------------------------
export async function getClientTechnicalNotesFromDb(clientPhone?: string): Promise<ClientTechnicalNote[]> {
  const db = getDb();
  let rows: { data: string }[] = [];
  if (clientPhone) {
    rows = db.prepare('SELECT data FROM client_technical_notes WHERE client_phone = ?').all(clientPhone) as { data: string }[];
  } else {
    rows = db.prepare('SELECT data FROM client_technical_notes').all() as { data: string }[];
  }
  return rows.map((r) => JSON.parse(r.data) as ClientTechnicalNote);
}

export async function saveClientTechnicalNoteToDb(note: ClientTechnicalNote): Promise<ClientTechnicalNote> {
  const db = getDb();
  db.prepare(`
    INSERT INTO client_technical_notes (id, client_phone, client_name, data, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      client_phone = excluded.client_phone,
      client_name = excluded.client_name,
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(note.id, note.clientPhone, note.clientName, JSON.stringify(note), new Date().toISOString());
  return note;
}
