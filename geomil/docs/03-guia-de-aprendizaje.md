# Guía de la primera entrega

Esta guía corresponde al ejercicio inicial en memoria. La fase web posterior está explicada en `../web/docs/GUIA.md` desde la carpeta Geomil (ruta real: `geomil/web/docs/GUIA.md`). Se ha elegido web y ya existen pantallas y almacenamiento persistente; los apartados de siguientes entregas de este documento describen el plan inicial.

## Qué estamos aprendiendo

Primero hemos separado el problema de las herramientas. El análisis funcional describe qué debe hacer el programa. El modelo de datos describe qué debe recordar. La implementación transforma esas reglas en código. La interfaz permite que una persona utilice ese código.

Esto conecta con Bases de datos del primer curso, con JavaScript de Desarrollo web en entorno cliente y más adelante con Desarrollo web en entorno servidor. Diseño de interfaces nos ayudará a construir formularios comprensibles y Despliegue a poner el sistema en funcionamiento para las cuatro personas.

## Las tres partes de la futura aplicación

La interfaz muestra tablas y recoge formularios. El servidor verifica quién hace la petición, valida datos y aplica las reglas. La base de datos conserva la información compartida. La aplicación de escritorio también puede comunicarse con ese servidor, por lo que el análisis actual sirve para ambas alternativas.

Todavía no escogemos framework ni proveedor. Un framework ofrece una estructura y utilidades para construir aplicaciones. Añadirlo ahora no resuelve las dudas del Excel y podría hacer más difícil entender la primera regla.

## Cómo leer el código

Abre `src/incidencias.mjs`. La extensión `.mjs` señala un módulo JavaScript. Un módulo permite exportar funciones para que otros archivos las importen. La demostración importa `RegistroIncidencias` y `calcularBase`. Node.js ejecuta JavaScript fuera del navegador; aquí lo usamos para probar reglas sin construir pantallas todavía.

`obligatorio` comprueba que recibe una cadena con contenido. `trim()` quita espacios de los extremos. Si el valor no cumple, `throw new Error(...)` interrumpe la operación con una explicación. No se asigna un cliente inventado para sortear un campo vacío. Como el sistema empieza desde cero, podemos validar las nuevas altas sin importar las excepciones del histórico.

`centimos` recibe texto como `56,60`. Su expresión regular comprueba la forma: dígitos, separador decimal opcional y hasta dos decimales. Después separa euros y céntimos, añade un cero si hace falta y devuelve 5660. Se limita el tamaño de entrada. Se rechazan negativos, separadores de miles y cantidades ausentes. Cero sí es un valor válido.

¿Por qué evitar sumar dinero directamente con decimales? En JavaScript, `0.1 + 0.2` produce una aproximación. En cambio, 10 + 20 céntimos da exactamente 30. `calcularBase` exige EUR o USD y calcula dentro de esa moneda; no convierte monedas ni decide el pago debido. Ambos componentes deben estar previamente expresados en la misma moneda.

`fechaISO` acepta una fecha de calendario `AAAA-MM-DD` o ausencia de fecha. Comprueba también que existe: el 30 de febrero no puede convertirse silenciosamente en marzo. Las fechas del envío no tienen hora; las marcas del historial sí utilizan un instante en UTC para evitar ambigüedad entre ordenadores.

`RegistroIncidencias` es una clase: reúne datos y operaciones relacionadas. `#registros` y `#eventos` son campos privados. El primero usa un `Map`, que relaciona cada identificador con su registro. El segundo es una lista de eventos. Ambos están solo en memoria.

`crear` valida todos los campos antes de guardar. Genera un identificador independiente de la operación, registra autor y momento y crea un evento con el contenido inicial. `randomUUID()` genera ese identificador. No se deduce la identidad comercial a partir del número de fila de Excel.

`cambiarEstado` exige un motivo y una versión esperada. Tiene un mapa de transiciones permitido: abierto puede pasar a investigación o resuelto; investigación puede volver a abierto o resolverse; resuelto puede reabrirse. Es una regla provisional del ejercicio que se revisará con Geomil. No representa una política contractual confirmada.

Ejemplo de concurrencia: dos gestores leen versión 1. El primero guarda y la versión pasa a 2. El segundo intenta guardar con versión 1 y recibe un error. En este ejemplo se demuestra secuencialmente; en producción deberá comprobarse de forma atómica dentro de la base de datos.

El evento guarda anterior y nuevo. Al reabrir se vacía la resolución actual, pero el evento de cierre anterior conserva quién cerró y cuándo. `structuredClone` devuelve copias independientes para evitar que modificar un resultado cambie accidentalmente el registro interno. Esto no sustituye permisos de servidor ni hace el historial resistente a quien controle el proceso.

## Práctica reproducible

Desde la carpeta `geomil`, ejecuta `node demo.mjs`. Verás un cliente ficticio, una incidencia cerrada y dos eventos: creación y cambio de estado. El total del ejemplo es 15660 céntimos, equivalente a 156,60 EUR. Terminar el proceso descarta estos datos.

Después ejecuta `node --test`. Cada prueba prepara datos, realiza una acción y compara con un resultado esperado. Para experimentar, cambia el motivo de cierre por espacios en la demostración: debería aparecer el error de motivo obligatorio. Restaura después el ejemplo. Las pruebas usan nuevos registros independientes y no modifican el Excel.

## Qué se ha verificado

Se ejecutaron nueve pruebas automáticas con resultado satisfactorio:

1. Exactitud de céntimos y cero válido.
2. Rechazo de importes vacíos, negativos, ambiguos o moneda desconocida.
3. Conservación de ceros iniciales y evento de alta.
4. Fechas y categorías inválidas no crean registros.
5. Fecha desconocida permanece nula.
6. Cierre con motivo y conservación del estado anterior.
7. Reapertura sin perder el cierre histórico.
8. Rechazo de edición obsoleta, transición repetida y registro inexistente.
9. Las copias devueltas no modifican datos internos.

También se ejecutó la demostración completa. Estas pruebas cubren el núcleo actual, no una aplicación terminada. No se ha probado concurrencia real entre ordenadores, identidad, base de datos, interfaz, permisos o despliegue porque aún no existen.

Implementar es escribir comportamiento. Compilar es transformar código para su ejecución o distribución; aquí no hay una fase de compilación separada. Probar es comprobar resultados. Desplegar es poner la aplicación a disposición de sus usuarios. Pasar las pruebas no significa haber desplegado ni demostrar ausencia total de errores.

## Siguientes entregas

La siguiente unidad útil es construir listado, alta y detalle usando las reglas ya probadas. La pantalla inicial estará vacía y permitirá registrar la primera incidencia. Los datos ficticios se usarán solo en pruebas. Después conectaremos almacenamiento persistente y autenticación, comprobando que la identidad no dependa de un texto enviado por la interfaz. La elección de lenguaje de servidor puede adaptarse cuando conozcas el programa del curso.

Tras ese recorrido se abordarán indemnizaciones, cartas y movimientos y finalmente los informes, copias de seguridad y despliegue. No habrá migración del Excel. Hasta que existan incidencias resueltas, el tiempo medio de resolución se mostrará como no disponible, sin inventar un cero. Cada fase tendrá criterios de aceptación y pruebas proporcionadas a lo que añada.
