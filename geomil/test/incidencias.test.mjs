import test from 'node:test';
import assert from 'node:assert/strict';
import { RegistroIncidencias, centimos, calcularBase } from '../src/incidencias.mjs';

const datos = () => ({ operacion:'DEMO-001', expedicion:'000123', agente:'DEMO', cliente:'Ficticio', tipo:'EXTRAVIO', mensajeria:'GLS', fechaEnvio:'2026-09-01', fechaIncidencia:'2026-09-02' });
test('dinero: exactitud decimal y cero válido', () => {
  assert.equal(centimos('56,60'),5660);
  assert.deepEqual(calcularBase('0.10','0.20','EUR'),{moneda:'EUR',totalCentimos:30});
  assert.equal(centimos('0'),0);
});
test('dinero: no convierte vacíos, negativos, miles o moneda desconocida', () => {
  for (const v of ['', '-1','1.000,00','1.001','NaN',null,10]) assert.throws(() => centimos(v));
  assert.throws(() => calcularBase('1','1',''));
});
test('alta: conserva ceros iniciales y genera historial', () => {
  const r = new RegistroIncidencias(); const i = r.crear(datos(),'gestor-demo');
  assert.equal(i.expedicion,'000123'); assert.equal(i.estado,'ABIERTO');
  assert.equal(r.historial(i.id)[0].actor,'gestor-demo');
});
test('validaciones: fechas inexistentes, invertidas, campos obligatorios y categorías', () => {
  const r = new RegistroIncidencias();
  for (const cambio of [{fechaEnvio:'2026-02-30'}, {fechaIncidencia:'2025-01-01'}, {cliente:' '}, {agente:1300}, {tipo:'RECIBIDO'}, {mensajeria:'X'}]) {
    assert.throws(() => r.crear({...datos(),...cambio},'demo'));
  }
  assert.equal(r.listar().length,0);
});
test('fechas desconocidas permanecen nulas', () => {
  const r = new RegistroIncidencias();
  assert.equal(r.crear({...datos(),fechaEnvio:null},'demo').fechaEnvio,null);
});
test('cerrar exige motivo y conserva versión previa', () => {
  const r = new RegistroIncidencias(); const i = r.crear(datos(),'demo');
  assert.throws(() => r.cambiarEstado(i.id,'RESUELTO',' ','demo',1));
  assert.equal(r.historial(i.id).length,1);
  const cerrado = r.cambiarEstado(i.id,'RESUELTO','Localizado','otro-demo',1);
  assert.equal(cerrado.resueltoPor,'otro-demo');
  assert.equal(r.historial(i.id)[1].anterior.estado,'ABIERTO');
});
test('reapertura conserva el cierre histórico', () => {
  const r = new RegistroIncidencias(); const i = r.crear(datos(),'demo');
  r.cambiarEstado(i.id,'RESUELTO','Localizado','demo',1);
  const abierto = r.cambiarEstado(i.id,'ABIERTO','Revisión','demo',2);
  assert.equal(abierto.resueltoEn,null);
  assert.ok(r.historial(i.id)[1].nuevo.resueltoEn);
});
test('cambio obsoleto, repetido o de registro inexistente no genera eventos', () => {
  const r = new RegistroIncidencias(); const i = r.crear(datos(),'demo');
  r.cambiarEstado(i.id,'EN_INVESTIGACION','Consulta','demo',1);
  assert.throws(() => r.cambiarEstado(i.id,'RESUELTO','Entrega','demo',1));
  assert.throws(() => r.cambiarEstado(i.id,'EN_INVESTIGACION','Consulta','demo',2));
  assert.throws(() => r.cambiarEstado('ausente','RESUELTO','Entrega','demo',1));
  assert.equal(r.historial(i.id).length,2);
});
test('copias externas no permiten modificar registros o historial internos', () => {
  const r = new RegistroIncidencias(); const i = r.crear(datos(),'demo');
  i.estado = 'RESUELTO'; r.listar()[0].cliente = 'Alterado';
  r.historial(i.id)[0].nuevo.estado = 'RESUELTO';
  assert.equal(r.listar()[0].cliente,'Ficticio');
  assert.equal(r.listar()[0].estado,'ABIERTO');
  assert.equal(r.historial(i.id)[0].nuevo.estado,'ABIERTO');
});
