// Núcleo didáctico en memoria. La identidad aquí recibida todavía NO es un login.
import { randomUUID } from 'node:crypto';

function obligatorio(valor, campo) {
  if (typeof valor !== 'string' || !valor.trim()) throw new Error(`${campo} es obligatorio`);
  return valor.trim();
}

// Convertimos texto decimal a céntimos enteros sin hacer operaciones con decimales binarios.
export function centimos(texto) {
  if (typeof texto !== 'string' || !/^\d{1,9}([.,]\d{1,2})?$/.test(texto.trim())) {
    throw new Error('Importe inválido: usa un número no negativo con hasta dos decimales y sin miles');
  }
  const [entero, decimal = ''] = texto.trim().replace(',', '.').split('.');
  return Number(entero) * 100 + Number(decimal.padEnd(2, '0'));
}

export function calcularBase(valor, flete, moneda) {
  if (!['EUR', 'USD'].includes(moneda)) throw new Error('Confirma una moneda: EUR o USD');
  return { moneda, totalCentimos: centimos(valor) + centimos(flete) };
}

function fechaISO(valor, campo) {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) throw new Error(`${campo}: usa AAAA-MM-DD`);
  const fecha = new Date(`${valor}T00:00:00Z`);
  if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0,10) !== valor) throw new Error(`${campo}: fecha inexistente`);
  return valor;
}

export class RegistroIncidencias {
  #registros = new Map();
  #eventos = [];

  crear(datos, actor) {
    actor = obligatorio(actor, 'Actor de la demostración');
    const fechaEnvio = fechaISO(datos.fechaEnvio, 'Fecha de envío');
    const fechaIncidencia = fechaISO(datos.fechaIncidencia, 'Fecha de incidencia');
    if (fechaEnvio && fechaIncidencia && fechaIncidencia < fechaEnvio) throw new Error('La incidencia precede al envío; revisa las fechas');
    const tipo = obligatorio(datos.tipo, 'Tipo');
    if (!['PERDIDA_TOTAL','EXTRAVIO','RETRASO','ROBO'].includes(tipo)) throw new Error('Tipo no reconocido');
    const mensajeria = obligatorio(datos.mensajeria, 'Mensajería');
    if (!['GLS','MRW','AGENTE'].includes(mensajeria)) throw new Error('Mensajería no reconocida');
    const ahora = new Date().toISOString();
    const registro = {
      id: randomUUID(),
      operacion: obligatorio(datos.operacion, 'Operación'),
      expedicion: datos.expedicion == null ? null : obligatorio(datos.expedicion, 'Expedición'),
      agente: obligatorio(datos.agente, 'Agente'),
      cliente: obligatorio(datos.cliente, 'Cliente'),
      tipo, mensajeria, fechaEnvio, fechaIncidencia,
      estado: 'ABIERTO', version: 1,
      creadoPor: actor, creadoEn: ahora, modificadoPor: actor, modificadoEn: ahora,
      resueltoPor: null, resueltoEn: null,
    };
    this.#registros.set(registro.id, registro);
    this.#eventos.push({ incidenciaId: registro.id, accion: 'CREAR', actor, fecha: ahora, anterior: null, nuevo: structuredClone(registro) });
    return structuredClone(registro);
  }

  cambiarEstado(id, estado, motivo, actor, versionEsperada) {
    actor = obligatorio(actor, 'Actor de la demostración');
    motivo = obligatorio(motivo, 'Motivo del cambio');
    const anterior = this.#registros.get(id);
    if (!anterior) throw new Error('Incidencia no encontrada');
    if (anterior.version !== versionEsperada) throw new Error('La incidencia ha cambiado; vuelve a consultarla');
    const transiciones = {
      ABIERTO: ['EN_INVESTIGACION', 'RESUELTO'],
      EN_INVESTIGACION: ['ABIERTO', 'RESUELTO'],
      RESUELTO: ['ABIERTO'],
    };
    if (!transiciones[anterior.estado].includes(estado)) throw new Error('Transición no permitida');
    const ahora = new Date().toISOString();
    const nuevo = {
      ...anterior, estado, version: anterior.version + 1,
      modificadoPor: actor, modificadoEn: ahora,
      resueltoPor: estado === 'RESUELTO' ? actor : null,
      resueltoEn: estado === 'RESUELTO' ? ahora : null,
    };
    this.#registros.set(id, nuevo);
    this.#eventos.push({ incidenciaId: id, accion: 'CAMBIO_ESTADO', actor, fecha: ahora, motivo, anterior: structuredClone(anterior), nuevo: structuredClone(nuevo) });
    return structuredClone(nuevo);
  }

  listar() { return structuredClone([...this.#registros.values()]); }
  historial(id) { return structuredClone(this.#eventos.filter(e => e.incidenciaId === id)); }
}
