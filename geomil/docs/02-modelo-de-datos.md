# Modelo relacional propuesto

Este es un diseño conceptual, no un esquema SQL ejecutado. No obliga a elegir web o escritorio ni un proveedor de base de datos.

El sistema comenzará vacío por decisión del usuario. El modelo no incluye migración del Excel ni precarga de clientes o movimientos históricos.

Una tabla agrupa entidades del mismo tipo. Una fila representa una entidad y una columna uno de sus atributos. La clave primaria identifica una fila; una clave foránea señala una fila de otra tabla. Por ejemplo, una incidencia guarda el identificador de la agencia y no necesita repetir toda su dirección.

| Tabla propuesta | Qué representa | Campos principales |
|---|---|---|
| usuarios | Persona con acceso | id, identidad de autenticación, nombre, rol, activo |
| agencias | Agencia u origen | id, código como texto, nombre |
| transportistas | Empresa de transporte | id, código, nombre |
| operaciones | Envío u operación identificada | id, referencia, expedición, agencia_id, cliente, ruta, bultos_original, fecha_envio |
| incidencias | Un caso de seguimiento | id, operacion_id, tipo, estado, transportista_id, responsable_id, fecha_incidencia, observaciones, versión, creado_por/en, modificado_por/en, resuelto_por/en, archivado_en |
| indemnizaciones | Propuesta o acuerdo económico | id, incidencia_id, moneda, peso_kg opcional, valor_declarado, flete, regla_calculo, importe_propuesto, importe_aprobado opcional, estado_carta |
| movimientos | Pago o aplicación de saldo | id, indemnizacion_id, moneda, importe, clase, fecha, referencia |
| documentos | Metadatos de adjuntos privados | id, incidencia_id, indemnizacion_id opcional, clave_almacenamiento, nombre, tipo, tamaño, autor, fecha |
| eventos | Historial de modificaciones | id, incidencia_id, actor_id, acción, fecha, motivo, anterior, nuevo |

Relaciones propuestas: una agencia tiene muchas operaciones; una operación puede tener varias incidencias; una incidencia puede tener varias indemnizaciones; una indemnización puede tener varios movimientos. La cardinalidad es el número de elementos que pueden relacionarse. Estas relaciones deben validarse con el proceso real antes de crear restricciones definitivas.

No creamos seis tablas de incidencias por las seis pestañas: la selección de MRW o una agencia será normalmente una consulta filtrada. El reparto por hojas es una presentación; no necesariamente representa seis entidades diferentes.

## Importes y estados

En el ejercicio JavaScript guardamos cantidades enteras en céntimos. En una base de datos se puede elegir entero en unidades mínimas o decimal exacto con precisión definida. Nunca se elegirá un decimal binario aproximado para contabilizar dinero. Las sumas se agrupan por moneda. Los saldos de agencia compartidos entre varios expedientes pueden requerir una cuenta y una tabla de aplicaciones adicionales; su diseño queda pendiente de confirmar ese proceso.

Un importe propuesto no equivale a uno aprobado ni pagado. Para un acuerdo aprobado de 150 EUR y dos pagos de 50 EUR, el pendiente sería 50 EUR, siempre que ambos movimientos sean pagos aplicables al mismo acuerdo. No se aplicará esa resta genéricamente a cualquier movimiento sin distinguir abonos, anulaciones y aplicaciones de saldo.

El tipo responde «¿qué sucedió?», el estado «¿en qué punto está la gestión?» y la resolución «¿cómo terminó?». Son conceptos diferentes. Por eso `Recibido` necesita revisión como tipo histórico.

## Diseño para cuatro o más personas

La interfaz se comunicará con un servidor común. El servidor comprueba identidad y permisos y ejecuta operaciones en la base de datos. No se compartirá un archivo local de base de datos mediante una carpeta sincronizada.

Para guardar un cambio y su historial utilizaremos una transacción: un conjunto de operaciones que se confirma completo o se deshace completo. La versión de la incidencia se verificará en la misma operación de escritura. El ejemplo conceptual es «actualizar donde id sea X y versión sea 3». Si no se actualiza ninguna fila, alguien pudo haberla modificado o el registro no existe: se informa al usuario y se vuelve a consultar.

La identidad del autor provendrá de la sesión autenticada del servidor. No se aceptará un `creado_por` elegido por el navegador. Los gestores no podrán editar o borrar eventos. El acceso a documentos también comprobará permisos. El núcleo de esta entrega no proporciona esas garantías: es código local para aprender las reglas.

En lugar de borrar en cascada el expediente y sus importes, se propone archivado con autor, fecha y motivo. Desactivar un usuario preservará su referencia en eventos históricos. La política definitiva de conservación deberá concretarse con Geomil.

## Diferencias frente al SQL de Gemini

El borrador de Gemini no implementa autenticación solo por crear una tabla `usuarios`. Tampoco crea políticas de acceso, disparadores de auditoría o restricciones de roles. Faltan moneda, resolución explícita y reglas de concurrencia. El borrado en cascada puede eliminar indemnizaciones. El nuevo diseño trata estos aspectos antes de convertir el modelo en SQL.
