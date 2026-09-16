# Análisis funcional contrastado

## Fuentes y alcance

Actualización del alcance: el usuario ha indicado que el sistema empezará desde cero. No se importará el histórico. Los hallazgos siguientes documentan lo aprendido del Excel, pero su limpieza no es un requisito para construir la nueva aplicación.

Se ha leído el texto de Gemini y la copia guardada de `INFORME PERDIDAS MENSAJERIAS.xlsx` disponible el 14/09/2026. No se han leído cambios sin guardar de Excel ni se ha modificado el libro. `inspeccion-excel.json` conserva el hash SHA-256 del archivo: una huella que permite identificar exactamente la copia analizada.

## Qué confirma el archivo

| Hoja | Función observada | Consecuencia para el programa |
|---|---|---|
| PERDIDA MENSAJERIAS | Seguimiento de operaciones, transportista, cliente, fechas, tipo, estado y notas | Registro operativo con filtros e historial |
| INDEMNIZACION AG. 1300 | Peso, valor declarado, flete, suma y notas sobre aceptación y pago | Indemnización con seguimiento administrativo |
| MILANO | Operaciones, pesos, valores declarados y notas | No asumir que existe un flete conocido |
| PERDIDAS CLTES VARIOS | Valores a pagar y cálculos de saldo | Distinguir indemnización, pago y saldo |
| PERDIDAS MRW | Valor declarado más flete y notas de solución | Misma estructura económica básica que agencia 1300 |
| PERDIDA 1344 | Importes, seguro y observaciones con formatos monetarios distintos | Revisar moneda y significado de las cantidades |

No se encontraron fórmulas de celda con referencias explícitas entre hojas. La relación comercial entre sus registros debe investigarse mediante identificadores; no está demostrada una conexión automática de las seis hojas. No se han auditado conexiones externas u otros mecanismos del libro.

## Conteo verificable

La cabecera operativa está en A7:M7. Desde la fila 8 se encontraron 130 filas con número de operación en B. No hay otras filas con contenido y B vacía en esa región. El rango utilizado llega hasta la fila 256, pero eso no significa 256 registros: el formato también ocupa espacio.

Son 130 candidatos a registro, no necesariamente 130 expedientes definitivos. Hay 129 valores distintos en la columna de operación y `RECOGIDA` aparece dos veces. No debe imponerse unicidad de operación ni eliminar duplicados automáticamente sin conocer qué representa cada fila.

Distribución literal del estado entre esos candidatos: 121 `Resuelto`, 2 `Abierto/Perdida`, 1 `En investigacion` y 6 `Investigacion`. Si se acepta que las dos últimas etiquetas significan lo mismo, resultarían siete en investigación. Es una propuesta de normalización, no una corrección del Excel.

## Hallazgos del Excel que ayudan a diseñar las validaciones

- I30:I32 de la hoja principal contienen `ecua0410282`, que no es una fecha.
- Hay 15 filas con incidencia anterior al envío: 44–52, 128–129 y 135–138. Deben revisarse los valores originales; no intercambiar día y mes por intuición.
- Hay tres expediciones vacías, dos clientes vacíos, ocho fechas de envío vacías y diez fechas de incidencia vacías entre los candidatos.
- `Extravio` y `EXTRAVIO` son variantes tipográficas. `Recibido` parece un resultado logístico, aunque actualmente está en tipo de incidencia. Mantendremos el dato original hasta decidir su clasificación.
- En `INDEMNIZACION AG. 1300`, H6 mezcla una fecha de 2026 y aceptación de febrero de 2026, mientras I6 contiene despacho de noviembre de 2025. Una misma celda reúne varios hechos y posibles errores.
- En `PERDIDA 1344`, I8 contiene `08/06/20206`; D8 contiene `DOC.`, no un peso numérico.
- En esa misma hoja, E7:F7 tienen formato de dólares, G7 tiene formato de euros y J7 menciona un seguro de 50 dólares frente a un valor declarado de 40. El formato no demuestra la moneda contractual. No convertiremos importes ni deduciremos la cantidad que corresponde pagar.
- Las celdas combinadas agrupan agencias en hojas económicas. Leer cada fila sin reconocer esos grupos perdería la agencia en las filas siguientes.

La suma valor declarado más flete aparece en varias hojas, pero no expresa por sí sola la indemnización aprobada ni cubre todos los casos. No se ha calculado un total económico global válido ni un tiempo medio de resolución: faltan reglas monetarias y fechas de cierre fiables.

## Flujo que construiremos

1. Una persona identificada registra la incidencia vinculada a una operación.
2. Se guarda transportista, agente, cliente, ruta, fechas conocidas y tipo.
3. Un gestor asume el seguimiento y registra novedades.
4. Si procede una indemnización, se registra moneda, componentes y cálculo propuesto. La aprobación se distingue del cálculo.
5. Se sigue la carta y se registran pagos o aplicaciones de saldo con sus justificantes.
6. Se cierra con motivo, autor y fecha. Cerrar la incidencia no implica que haya habido un pago.
7. Una reapertura conserva el cierre anterior en el historial.

Los roles administrador y gestor pertenecen a la propuesta inicial. El acceso de agentes externos es opcional y no está confirmado. Cada persona tendrá su cuenta para que el historial identifique al autor real.

## Reglas propuestas y criterios de aceptación

| Regla | Comprobación esperada |
|---|---|
| Identificadores como texto | `000123` conserva sus ceros |
| Importe desconocido diferente de cero | Un campo vacío no produce una indemnización de cero |
| Moneda explícita | No hay total conjunto de EUR y USD sin conversión documentada |
| Cierre justificado | Sin motivo no se guarda el cambio |
| Historial unido a la modificación | Se guardan ambos o ninguno |
| Edición concurrente | Un usuario no sobrescribe una versión más reciente sin revisarla |
| Permisos del servidor | Un gestor no puede cambiar su rol manipulando la interfaz |
| Conservación del histórico | Archivar no elimina indemnizaciones ni movimientos |

Solo algunas reglas están implementadas en el núcleo didáctico; consulta la guía. Las reglas de identidad, permisos y atomicidad persistente siguen pendientes. El inicio de la aplicación debe mostrar cero incidencias y una acción clara para registrar la primera.

## Histórico fuera de alcance

No se trasladarán registros, adjuntos, pagos o saldos del Excel a la nueva aplicación. No se necesita desarrollar un importador ni resolver las anomalías históricas. El analizador ya creado se conserva como herramienta de lectura y evidencia del análisis inicial.

Las nuevas incidencias tendrán autor y fecha a partir de su creación en el sistema. Los informes se calcularán exclusivamente con esos nuevos datos. No se rellenarán paneles con cantidades del histórico ni con datos de demostración en el uso real.

Para los nuevos registros quedan por confirmar las monedas admitidas, la política de seguro/flete, la relación operación/expediente y cómo se aplican saldos. No impiden construir el registro de incidencias. Las dudas sobre celdas históricas concretas ya no necesitan resolverse.
