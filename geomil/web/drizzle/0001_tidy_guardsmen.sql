CREATE TABLE `archivos` (
	`id` text PRIMARY KEY NOT NULL,
	`incidencia_id` text NOT NULL,
	`nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`tamano` integer NOT NULL,
	`clave` text NOT NULL,
	`fecha` text NOT NULL,
	`actor_nombre` text NOT NULL,
	FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_archivos_incidencia` ON `archivos` (`incidencia_id`);--> statement-breakpoint
CREATE TABLE `equipo` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `folios` (
	`numero` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`incidencia_id` text NOT NULL,
	FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `folios_incidencia_id_unique` ON `folios` (`incidencia_id`);