# Continuar el proyecto Geomil por tu cuenta

Actualizado: 16 de septiembre de 2026. Esta guía describe la versión con seguimiento por etapas y panel rojo.

## 1. Dónde está y cómo abrirlo

La carpeta que debes abrir en VS Code es:

`/Users/Hermanitos/perdidas-geomil/geomil/web`

En Finder pulsa **Cmd + Mayús + G**, pega esa ruta y pulsa Intro. En VS Code usa **Archivo → Abrir carpeta** y selecciona `web`. No confundas esta carpeta con `geomil/src`: ese directorio contiene el ejercicio inicial, no la web actual.

Los archivos `sources/` de la carpeta superior son referencias sincronizadas; no los edites. Los cambios de la aplicación se hacen dentro de `web`.

## 2. Ejecutarla sin instalar todo otra vez

Abre **Terminal → Nuevo terminal** en VS Code. Comprueba que estás dentro de `web`:

```sh
pwd
node --version
npm --version
npm run dev
```

Necesitas Node.js compatible con el proyecto (22.13 o posterior; se ha probado con 24). Las dependencias ya están instaladas en esta copia: no hace falta repetir `npm install` cada día. Si trabajas en una copia nueva sin `node_modules`, utiliza `npm run install:ci`.

La dirección habitual es `http://localhost:5173/`. Mantén la terminal abierta mientras trabajas. Al guardar un archivo, Vite actualiza el navegador. Para parar un servidor que tú has iniciado, pulsa **Ctrl + C** en su terminal. Si indica que ya hay uno ejecutándose, abre la dirección existente: no inicies otro ni borres archivos de bloqueo.

Si tu terminal no encuentra Node, en este Mac puedes usar el entorno que ya está instalado:

```sh
export PATH="/Users/Hermanitos/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
node --version
npm run dev
```

Este ajuste solo afecta a esa terminal. El servidor local simula la sesión de una persona llamada **Seedy**. No es una cuenta de Geomil. La web publicada utiliza la identificación de la plataforma y conserva acceso privado. La base local y la publicada son independientes: tus ensayos locales no pasan a producción.

## 3. Qué está implementado

- Panel con cinco indicadores, tareas personales, gráficos por tipo y empresa, casos con avisos y actividad reciente.
- Diseño rojo y granate adaptado a la imagen de referencia, sin cifras de ejemplo ni rótulos de boceto.
- Etapas: origen España, tránsito internacional, destino Latinoamérica y después de la entrega. Cada etapa ofrece sus tipos de incidencia.
- Alta con guía, cliente, teléfono, origen/destino, empresa, prioridad, responsable, próxima acción y fecha límite.
- Búsqueda por referencia, guía, expedición, cliente y teléfono; filtros por estado, prioridad, empresa, etapa y fechas de incidencia.
- Estados Nueva, En gestión, Esperando tercero, Esperando cliente, Solucionada y Cerrada.
- Gestiones con nota, autor, fecha, siguiente paso e historial. Se puede registrar una nota sin cambiar de estado.
- Adjuntos PDF, JPG, PNG y WebP de hasta 10 MB, guardados de forma persistente y descargables con sesión.
- Control de edición simultánea, reintentos de alta sin duplicados, cierre confirmado y reapertura.
- Informes mensuales de casos creados, porcentaje con solución, tiempo medio hasta solución y clientes con varios casos.

No se ha importado el Excel. Los casos que hubieras creado antes se conservan. Los que no tengan responsable identificable, próxima acción o fecha límite muestran «Completar seguimiento».

## 4. Recorrido que puedes probar

1. Abre **Nueva incidencia**. Usa datos ficticios si estás aprendiendo; la aplicación guarda los datos y todavía no tiene botón de eliminación.
2. Introduce una guía, cliente, origen, destino y empresa. Cambia la etapa y observa cómo cambia la lista de tipos.
3. Asígnate como responsable. Escribe una acción concreta, por ejemplo «Consultar ubicación a MRW», y una fecha límite.
4. Guarda. Se genera una referencia `INC-año-número`. Los números pueden tener saltos por reintentos o pruebas; no representan la cantidad de expedientes.
5. Desde el detalle, registra lo realizado y pasa a **Esperando tercero**, manteniendo la próxima acción y su fecha.
6. Adjunta una prueba en PDF o imagen. Después comprueba su descarga.
7. Cuando exista una solución, elige **Solucionada**, registra su resultado y programa la confirmación con el cliente.
8. Tras comprobarlo con el cliente, elige **Cerrada**, marca la confirmación y explica la gestión. No se permite cerrar directamente una incidencia nueva.
9. Revisa el historial. Si fuera necesario reabrir, se vuelve a **En gestión**, conservando los eventos anteriores.

En el selector de responsables aparecen los usuarios autenticados que ya hayan entrado en la aplicación. No se han inventado cuentas para los empleados. Todavía hay que configurar el acceso de las personas reales y sus permisos antes del uso del equipo.

## 5. Cómo se calculan los avisos

Las fechas de calendario usan la zona horaria de Madrid. Una fecha anterior a hoy está vencida; hoy se destaca como seguimiento del día. Desde la última gestión guardada: 48 horas generan aviso, 72 horas alerta y 120 horas la indicación de escalar a supervisión. Son horas naturales, sin calendario laboral por ahora.

Guardar una gestión reinicia el plazo de inactividad. Leer un caso o adjuntar un documento no lo reinicia. Una incidencia solucionada pero pendiente de cierre sigue teniendo recordatorios. La cerrada deja de producirlos.

La prioridad urgente, los vencimientos, la inactividad y los seguimientos incompletos pueden aparecer en la tarjeta de atención urgente. «Total abiertas» cuenta las que aún no están solucionadas; por eso una solucionada pendiente de confirmación puede aparecer en atención sin sumarse a abiertas. Las tarjetas no son grupos excluyentes y no deben sumarse entre sí.

Los avisos se recalculan cada minuto con la página visible y al regresar a ella. No hay un proceso enviando emails en segundo plano. La marca de supervisión es un aviso dentro de la web, no una notificación enviada a un supervisor.

## 6. Qué archivo estudiar primero

| Archivo dentro de `web` | Qué hace | Asignatura relacionada |
|---|---|---|
| `app/globals.css` | Colores, espacios, distribución y pantallas estrechas | Diseño de interfaces |
| `app/workspace.tsx` | Navegación, búsqueda, filtros, tabla y coordinación de la pantalla | Entorno cliente |
| `app/resumen.tsx` | Tarjetas, gráficos, tareas y actividad | Entorno cliente |
| `app/formularios.tsx` | Formulario de alta, detalle, gestión y adjuntos | Cliente y formularios |
| `app/controles.tsx` | Selector y etiquetas de estado/prioridad | Componentes reutilizables |
| `lib/logistica.ts` | Tipos, validaciones, estados, etapas y plazos | Reglas del negocio |
| `lib/indicadores.ts` | Contadores y agrupaciones calculados | Lógica de aplicación |
| `app/api/incidencias/route.ts` | Consulta, creación y modificación por HTTP | Entorno servidor |
| `app/api/adjuntos/route.ts` | Recibe documentos y permite descargarlos | Entorno servidor |
| `lib/api-servidor.ts` | Sesión, origen de peticiones y respuesta de errores | Entorno servidor |
| `db/registro.ts` | Consultas SQL, guardado, historial y documentos | Bases de datos |
| `db/schema.ts` | Definición de tablas para Drizzle | Bases de datos |
| `drizzle/` | Migraciones SQL versionadas | Despliegue y evolución de datos |
| `test/reglas.test.mjs` | Pruebas unitarias de las reglas | Entornos de desarrollo |
| `scripts/check-api-local.mjs` | Pruebas con servidor y base local reales | Integración |

`lib/incidencias.ts` es la lógica antigua, conservada como referencia. La web actual utiliza `lib/logistica.ts`; no añadas reglas nuevas al archivo antiguo.

React construye la pantalla con componentes: funciones que describen una pieza visual y su comportamiento. TypeScript añade tipos a JavaScript para comprobar la forma de los datos. Zod valida los valores durante la ejecución. Vinext/Vite ejecutan la aplicación y generan la compilación. D1 guarda tablas SQL; R2 guarda los bytes de los archivos. Drizzle describe el esquema y genera migraciones.

## 7. Sigue un dato desde el formulario hasta la base

Al pulsar Registrar, `AltaDialog` reúne los campos y los valida con `altaSchema`. Si son válidos, `fetch` envía JSON mediante POST a `/api/incidencias`. JSON es texto estructurado para intercambiar datos. La API comprueba la sesión y vuelve a validar: no confía en que el navegador haya usado nuestro formulario.

`crear()` guarda la incidencia, asigna un número y registra su evento de alta. El identificador UUID se mantiene en los reintentos para no duplicar el caso si la respuesta se pierde. El número visible facilita buscarlo; el UUID identifica internamente el registro.

Cada modificación envía la versión que el usuario ha leído. Si otra persona la ha cambiado, la versión ya no coincide: el servidor devuelve conflicto 409. Se pide actualizar el detalle antes de guardar, en lugar de sobrescribir el cambio ajeno. El historial y el registro se guardan en una transacción, que aplica todas sus consultas o ninguna.

Los adjuntos se guardan en R2 y sus metadatos en la tabla `archivos`. La descarga pasa por una API autenticada. Se revisan tamaño y firma inicial del formato; eso no equivale a un antivirus ni a una validación exhaustiva del contenido.

El detalle del expediente sigue almacenándose como JSON. La columna antigua `estado` mantiene sus tres valores compatibles; `estadoBase()` los relaciona con los seis estados nuevos del JSON. Se evita romper las tablas existentes. Para una evolución mayor convendrá normalizar los campos que se consultan e indexan en SQL, en lugar de cargar todos los casos al navegador.

## 8. Tu primer cambio, paso a paso

Empieza con algo pequeño: cambia el texto «Cada envío, un compromiso.» del menú lateral.

1. Localízalo en `app/workspace.tsx` con **Cmd + F**.
2. Modifica solo el texto entre las etiquetas, guarda y revisa el navegador.
3. Comprueba que el panel y la navegación siguen funcionando.
4. Mira `git diff` para entender exactamente qué has cambiado.

Después añade una prueba de prioridad urgente en `test/reglas.test.mjs`: usa un expediente con fecha futura y gestión reciente, pon `prioridad: 'URGENTE'` y verifica que `alerta(...).nivel` devuelve 3. Así practicas una regla aislada sin cambiar tablas.

Para una categoría nueva, revisa `tiposPorEtapa` en `lib/logistica.ts`: las opciones del formulario proceden de ahí. Añade una prueba que compruebe que se acepta en su etapa y se rechaza en otra. No cambies claves de categorías ya guardadas sin planificar cómo convertir los registros antiguos.

## 9. Comprobar antes de dar un cambio por terminado

En otra terminal, desde `web`:

```sh
npm run typecheck
npm test
npm run build
git diff
```

- `typecheck`: revisa tipos; no ejecuta los recorridos del usuario.
- `test`: ejecuta las 11 pruebas de reglas actuales.
- `build`: compila y prepara los archivos para desplegar; no publica nada por sí sola.
- Revisión manual: abre la pantalla afectada y comprueba campos, botones y mensajes.

Las 34 comprobaciones de integración se ejecutan con el servidor local encendido mediante `node scripts/check-api-local.mjs`. Crean un expediente ficticio y un PDF. Generan `/tmp/geomil-qa-cleanup.sql` y `/tmp/geomil-qa-r2-key.txt` para retirar únicamente sus datos. No las ejecutes repetidamente sin limpiar los expedientes de cada ejecución. No están preparadas para producción.

Las migraciones `0000_chunky_ultragirl.sql` y `0001_tidy_guardsmen.sql` ya están aplicadas en esta copia local. No las repitas ni modifiques. Cuando cambies tablas: edita `db/schema.ts`, ejecuta `npm run db:generate`, revisa el SQL nuevo y aplícalo solo a una copia local antes de publicar. El README explica el comando de aplicación. No borres `.wrangler/state`: contiene tus datos locales.

## 10. Próximas tareas, en orden

1. Validar con administración las etapas, tipos, nombres de estados, obligatoriedad de campos y horas naturales frente a laborables.
2. Definir los usuarios reales y qué puede hacer cada rol. Preparar altas/bajas de empleados y probar varias sesiones reales.
3. Permitir corregir datos generales del envío con historial: ahora se registran gestiones, pero no se edita toda la ficha.
4. Diseñar indemnizaciones e importes, moneda, documentos y aprobación antes de calcular pérdidas económicas.
5. Incorporar volumen real de paquetes para calcular incidencias por cada 1.000 envíos. No deducirlo del número de incidencias.
6. Añadir tareas programadas y envío de avisos por correo, incluyendo destinatarios y prevención de envíos duplicados.
7. Probar pantallas pequeñas, accesibilidad, más volumen de datos, copias de seguridad y recuperación antes de usarlo a diario.

Los informes actuales usan los casos creados en el mes seleccionado y su estado actual. El tiempo medio es el transcurrido hasta la solución actual; al reabrir se limpia esa solución, aunque permanece en el historial. Los clientes repetidos se agrupan por teléfono si existe y, si no, por nombre; no sustituye a una tabla de clientes con identificador propio.

## 11. Verificación de esta entrega

Pasaron 11 pruebas unitarias y 34 comprobaciones API locales: autenticación, origen, validación, alta idempotente, conflicto concurrente, documentos, solución, cierre y reapertura. Se revisaron visualmente panel y formulario en Chrome. Los datos creados por esas pruebas se retiraron, conservando los anteriores.

La revisión de tipos y la compilación también se completan como parte del cierre. No se ha probado todavía el acceso de cuatro empleados reales, el envío de correos, una auditoría de seguridad, todos los tamaños móviles ni WebMCP en un navegador compatible. Estas comprobaciones reducen errores conocidos; no garantizan la ausencia absoluta de fallos.


## Traslado y acceso desde otros equipos (17 de septiembre de 2026)

La carpeta completa se trasladó, sin copia, a `/Users/Hermanitos/perdidas-geomil`. Abre en VS Code `/Users/Hermanitos/perdidas-geomil/geomil/web`. Se detuvo el servidor local antes del traslado. Para arrancarlo de nuevo:

```sh
cd /Users/Hermanitos/perdidas-geomil/geomil/web
npm run dev
```

La web ya está publicada en https://geomil-incidencias.navarone-da.chatgpt.site y funciona sin que el Mac permanezca encendido. Su acceso sigue restringido al propietario: abre ese enlace desde otro ordenador o móvil e inicia sesión con la misma cuenta. Conocer el enlace no concede acceso a otras personas.

Para que administración entre con cuentas propias, hay que autorizar a esas personas en los permisos del sitio. No hace falta hacer pública la aplicación. Los roles internos de trabajo siguen pendientes; no hay que confundir el permiso de entrada de la plataforma con un rol de supervisor dentro de Geomil.

Guardar cambios localmente o ejecutar `npm run build` no actualiza la web publicada. Para publicar una actualización hay que comprobarla, generar la compilación y desplegarla al sitio existente. Conserva el identificador en `.openai/hosting.json` para actualizar el mismo sitio y sus datos. La guía de Sites gestiona ese despliegue; no basta con subir la carpeta `dist` a un alojamiento estático porque esta aplicación usa servidor, D1, R2 y autenticación.
