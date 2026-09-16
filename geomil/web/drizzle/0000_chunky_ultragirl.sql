CREATE TABLE `eventos` (
	`id` text PRIMARY KEY NOT NULL,
	`incidencia_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`actor_nombre` text NOT NULL,
	`accion` text NOT NULL,
	`motivo` text NOT NULL,
	`fecha` text NOT NULL,
	`anterior` text,
	`nuevo` text NOT NULL,
	FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_eventos_incidencia` ON `eventos` (`incidencia_id`);--> statement-breakpoint
CREATE TABLE `incidencias` (
	`id` text PRIMARY KEY NOT NULL,
	`estado` text NOT NULL,
	`version` integer NOT NULL,
	`datos` text NOT NULL,
	`creado_en` text NOT NULL,
	CONSTRAINT "estado_valido" CHECK("incidencias"."estado" IN ('ABIERTO','EN_INVESTIGACION','RESUELTO')),
	CONSTRAINT "version_positiva" CHECK("incidencias"."version" > 0)
);
