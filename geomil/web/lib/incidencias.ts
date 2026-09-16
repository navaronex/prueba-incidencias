import { z } from 'zod';

export const estados = { ABIERTO: 'Abierta', EN_INVESTIGACION: 'En investigación', RESUELTO: 'Resuelta' } as const;
export const tipos = { EXTRAVIO: 'Extravío', PERDIDA_TOTAL: 'Pérdida total', RETRASO: 'Retraso', ROBO: 'Robo' } as const;
export type Estado = keyof typeof estados;
const texto = (nombre: string, max = 150) => z.string().trim().min(1, `${nombre} es obligatorio`).max(max, `${nombre}: máximo ${max} caracteres`);
const opcional = (max = 150) => z.string().trim().max(max).default('');
const fecha = z.string().refine(value => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}, 'Fecha inválida').default('');

export const altaSchema = z.object({
  id: z.string().uuid(),
  operacion: texto('Operación', 60), expedicion: opcional(60),
  cliente: texto('Cliente'), agente: texto('Agencia', 100),
  ruta: opcional(), bultos: opcional(60),
  mensajeria: z.enum(['GLS', 'MRW', 'AGENTE']),
  tipo: z.enum(['EXTRAVIO', 'PERDIDA_TOTAL', 'RETRASO', 'ROBO']),
  fechaEnvio: fecha, fechaIncidencia: fecha,
  responsable: opcional(100), observaciones: opcional(3000),
}).strict().refine(d => !d.fechaEnvio || !d.fechaIncidencia || d.fechaIncidencia >= d.fechaEnvio,
  { message: 'La fecha de incidencia no puede ser anterior al envío', path: ['fechaIncidencia'] });

export const cambioSchema = z.object({
  version: z.number().int().positive(),
  estado: z.enum(['ABIERTO', 'EN_INVESTIGACION', 'RESUELTO']),
  motivo: texto('Motivo', 3000),
}).strict();

export type Alta = z.infer<typeof altaSchema>;
export type Incidencia = Alta & {
  estado: Estado; version: number;
  creadoPor: string; creadoNombre: string; creadoEn: string;
  modificadoPor: string; modificadoEn: string;
  resueltoPor: string | null; resueltoEn: string | null;
};
export type Evento = {
  id: string; incidencia_id: string; actor_id: string; actor_nombre: string;
  accion: string; motivo: string; fecha: string;
  anterior: Incidencia | null; nuevo: Incidencia;
};

export function puedeCambiar(actual: Estado, siguiente: Estado) {
  const transiciones: Record<Estado, Estado[]> = {
    ABIERTO: ['EN_INVESTIGACION', 'RESUELTO'],
    EN_INVESTIGACION: ['ABIERTO', 'RESUELTO'], RESUELTO: ['ABIERTO'],
  };
  return transiciones[actual].includes(siguiente);
}

export function fechaVisible(value: string) {
  if (!value) return 'Sin indicar';
  return new Intl.DateTimeFormat('es-ES', { day:'2-digit', month:'short', year:'numeric', timeZone:'Europe/Madrid' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
}
