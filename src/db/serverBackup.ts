import fs from 'fs';
import path from 'path';
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
  INITIAL_TEMPLATES,
  INITIAL_CLIENT_TECHNICAL_NOTES
} from '../data/initialData.ts';

interface ServerStorageState {
  profile: BeautyProProfile;
  services: BeautyService[];
  appointments: Appointment[];
  templates: WhatsAppTemplate[];
  technicalNotes: Record<string, ClientTechnicalNote>;
  lastSavedAt: string;
}

const PRIMARY_BACKUP_PATH = path.join(process.cwd(), 'data', 'glow_backup.json');
const SECONDARY_BACKUP_PATH = path.join('/tmp', 'glow_backup.json');

// Memory cache initialized with initial data
let inMemoryState: ServerStorageState = {
  profile: INITIAL_PRO_PROFILE,
  services: INITIAL_SERVICES,
  appointments: INITIAL_APPOINTMENTS,
  templates: INITIAL_TEMPLATES,
  technicalNotes: INITIAL_CLIENT_TECHNICAL_NOTES,
  lastSavedAt: new Date().toISOString()
};

function ensureDir(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}
}

export function loadBackupFromFile(): ServerStorageState {
  for (const filePath of [PRIMARY_BACKUP_PATH, SECONDARY_BACKUP_PATH]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profile && parsed.profile.name) {
          inMemoryState = {
            ...inMemoryState,
            ...parsed
          };
          return inMemoryState;
        }
      }
    } catch (err) {
      console.warn(`Failed reading server backup from ${filePath}:`, err);
    }
  }
  return inMemoryState;
}

export function persistBackupToFile() {
  inMemoryState.lastSavedAt = new Date().toISOString();
  const serialized = JSON.stringify(inMemoryState, null, 2);

  let saved = false;
  try {
    ensureDir(PRIMARY_BACKUP_PATH);
    fs.writeFileSync(PRIMARY_BACKUP_PATH, serialized, 'utf8');
    saved = true;
  } catch (err) {
    console.warn('Failed saving primary backup file, falling back to /tmp:', err);
  }

  if (!saved) {
    try {
      ensureDir(SECONDARY_BACKUP_PATH);
      fs.writeFileSync(SECONDARY_BACKUP_PATH, serialized, 'utf8');
    } catch (err) {
      console.warn('Failed saving secondary backup file to /tmp:', err);
    }
  }
}

// Initialize on module load
loadBackupFromFile();

// ----------------------------------------------------
// Profile
// ----------------------------------------------------
export function getBackupProfile(): BeautyProProfile {
  return inMemoryState.profile;
}

export function setBackupProfile(profile: BeautyProProfile) {
  inMemoryState.profile = { ...inMemoryState.profile, ...profile };
  persistBackupToFile();
}

// ----------------------------------------------------
// Services
// ----------------------------------------------------
export function getBackupServices(): BeautyService[] {
  return inMemoryState.services;
}

export function setBackupServices(services: BeautyService[]) {
  inMemoryState.services = services;
  persistBackupToFile();
}

export function saveBackupService(service: BeautyService) {
  const existingIdx = inMemoryState.services.findIndex((s) => s.id === service.id);
  if (existingIdx >= 0) {
    inMemoryState.services[existingIdx] = { ...inMemoryState.services[existingIdx], ...service };
  } else {
    inMemoryState.services = [service, ...inMemoryState.services];
  }
  persistBackupToFile();
}

export function deleteBackupService(id: string) {
  inMemoryState.services = inMemoryState.services.filter((s) => s.id !== id);
  persistBackupToFile();
}

// ----------------------------------------------------
// Appointments
// ----------------------------------------------------
export function getBackupAppointments(): Appointment[] {
  return inMemoryState.appointments;
}

export function setBackupAppointments(appointments: Appointment[]) {
  inMemoryState.appointments = appointments;
  persistBackupToFile();
}

export function saveBackupAppointment(appointment: Appointment) {
  const existingIdx = inMemoryState.appointments.findIndex((a) => a.id === appointment.id);
  if (existingIdx >= 0) {
    inMemoryState.appointments[existingIdx] = { ...inMemoryState.appointments[existingIdx], ...appointment };
  } else {
    inMemoryState.appointments = [appointment, ...inMemoryState.appointments];
  }
  persistBackupToFile();
}

export function deleteBackupAppointment(id: string) {
  inMemoryState.appointments = inMemoryState.appointments.filter((a) => a.id !== id);
  persistBackupToFile();
}

// ----------------------------------------------------
// Templates
// ----------------------------------------------------
export function getBackupTemplates(): WhatsAppTemplate[] {
  return inMemoryState.templates;
}

export function setBackupTemplates(templates: WhatsAppTemplate[]) {
  inMemoryState.templates = templates;
  persistBackupToFile();
}

export function updateBackupTemplate(id: string, template: string, title?: string) {
  inMemoryState.templates = inMemoryState.templates.map((t) =>
    t.id === id ? { ...t, template, ...(title ? { title } : {}) } : t
  );
  persistBackupToFile();
}

// ----------------------------------------------------
// Technical Notes
// ----------------------------------------------------
export function getBackupTechnicalNotes(): Record<string, ClientTechnicalNote> {
  return inMemoryState.technicalNotes;
}

export function saveBackupTechnicalNote(note: ClientTechnicalNote) {
  const key = note.clientPhone || note.clientName || note.id;
  inMemoryState.technicalNotes = {
    ...inMemoryState.technicalNotes,
    [key]: note
  };
  persistBackupToFile();
}
