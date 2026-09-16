import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';

// El contenido validado se conserva también como instantánea para el historial.
export const incidencias = sqliteTable('incidencias', {
  id: text('id').primaryKey(),
  estado: text('estado').notNull(),
  version: integer('version').notNull(),
  datos: text('datos').notNull(),
  creadoEn: text('creado_en').notNull(),
}, t => [
  check('estado_valido', sql`${t.estado} IN ('ABIERTO','EN_INVESTIGACION','RESUELTO')`),
  check('version_positiva', sql`${t.version} > 0`),
]);

export const eventos = sqliteTable('eventos', {
  id: text('id').primaryKey(),
  incidenciaId: text('incidencia_id').notNull().references(() => incidencias.id),
  actorId: text('actor_id').notNull(), actorNombre: text('actor_nombre').notNull(),
  accion: text('accion').notNull(), motivo: text('motivo').notNull(),
  fecha: text('fecha').notNull(), anterior: text('anterior'), nuevo: text('nuevo').notNull(),
}, t => [index('idx_eventos_incidencia').on(t.incidenciaId)]);

export const equipo = sqliteTable('equipo', {
  id:text('id').primaryKey(),nombre:text('nombre').notNull(),
});
export const folios = sqliteTable('folios', {
  numero:integer('numero').primaryKey({autoIncrement:true}),
  incidenciaId:text('incidencia_id').notNull().unique().references(()=>incidencias.id),
});
export const archivos = sqliteTable('archivos', {
  id:text('id').primaryKey(),incidenciaId:text('incidencia_id').notNull().references(()=>incidencias.id),
  nombre:text('nombre').notNull(),tipo:text('tipo').notNull(),tamano:integer('tamano').notNull(),
  clave:text('clave').notNull(),fecha:text('fecha').notNull(),actorNombre:text('actor_nombre').notNull(),
},t=>[index('idx_archivos_incidencia').on(t.incidenciaId)]);
