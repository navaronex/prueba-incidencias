import { RegistroIncidencias, calcularBase } from './src/incidencias.mjs';

const registro = new RegistroIncidencias();
const incidencia = registro.crear({
  operacion: 'DEMO-001', expedicion: '0000123', agente: 'DEMO',
  cliente: 'Cliente ficticio', mensajeria: 'GLS', tipo: 'EXTRAVIO',
  fechaEnvio: '2026-09-01', fechaIncidencia: '2026-09-03',
}, 'usuario-demo');
registro.cambiarEstado(incidencia.id, 'RESUELTO', 'Entrega localizada en esta demostración', 'usuario-demo', 1);
console.log('DEMOSTRACIÓN EN MEMORIA. Datos ficticios; no guarda al salir.');
console.log(JSON.stringify({ incidencias: registro.listar(), historial: registro.historial(incidencia.id), baseEjemplo: calcularBase('100', '56,60', 'EUR') }, null, 2));
