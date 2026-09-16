# Geomil · Gestión de incidencias

Actualizado el 15 de septiembre de 2026. Se ha elegido una aplicación web. Esta entrega es una primera versión funcional para que administración valore el enfoque. El uso futuro previsto es de unas cuatro personas, posiblemente alguna más.

**Decisión actual: empezar desde cero.** No se migrarán incidencias, clientes, pagos ni saldos del Excel. El libro es una referencia funcional. La aplicación arrancará vacía; los datos ficticios pertenecen exclusivamente a la demostración.

## Qué existe hoy

- Análisis reproducible de la copia guardada del Excel, sin modificarla.
- Análisis funcional contrastado y propuesta de modelo relacional.
- Núcleo didáctico de JavaScript: altas, cambios de estado, historial y suma monetaria en una moneda explícita.
- Nueve pruebas automáticas y una demostración con datos ficticios.

La carpeta `web/` contiene ahora interfaz React, servidor, base de datos persistente y acceso mediante la plataforma. Permite registrar, buscar y filtrar incidencias, consultar su detalle y cambiar el estado con historial. Consulta `web/docs/GUIA.md` para la explicación de esta fase y sus límites.

Los archivos `src/`, `demo.mjs` y `test/` de esta carpeta siguen siendo el ejercicio inicial en memoria. La web usa su propia implementación tipada en `web/lib/incidencias.ts`; no confundas el ejercicio con la aplicación persistente.

Quedan fuera de esta entrega las indemnizaciones, adjuntos, exportaciones, edición general de campos y administración de usuarios y roles. No se han importado datos históricos ni habilitado el acceso del equipo.

## Orden de lectura

1. `docs/01-analisis-funcional.md`: qué hace el Excel y qué problemas debemos resolver.
2. `docs/02-modelo-de-datos.md`: cómo repartir esa información entre tablas relacionadas.
3. `docs/03-guia-de-aprendizaje.md`: explicación del código, ejecución, pruebas y próximas fases.

## Ejecutar desde esta carpeta

Con Node.js disponible en tu terminal:

```sh
node demo.mjs
node --test
```

No hay dependencias JavaScript que instalar. `demo.mjs` usa exclusivamente datos ficticios. El analizador de Excel es una utilidad independiente de Python que necesita `openpyxl`; se ha ejecutado con el entorno de herramientas disponible en esta sesión. No determina el lenguaje del futuro servidor.

```sh
python3 scripts/analizar_excel.py '/ruta/INFORME PERDIDAS MENSAJERIAS.xlsx' --salida docs/inspeccion-excel.json
```

La inspección incluye referencias de operaciones y anomalías del libro. Es material de trabajo interno. El Excel original no está copiado dentro del proyecto.
