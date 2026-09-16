import { env } from 'cloudflare:workers';
import { normalizar, estadoBase, puedeCambiar, type Alta, type Gestion, type Incidencia, type Evento, type Miembro, type Adjunto } from '@/lib/logistica';
import type { ChatGPTUser } from '@/app/chatgpt-auth';

export class ErrorRegistro extends Error {constructor(message:string,public status:number){super(message);}}
function db(){if(!env.DB)throw new Error('Base de datos no disponible');return env.DB;}
export async function registrarUsuario(user:ChatGPTUser){
  await db().prepare('INSERT INTO equipo (id,nombre) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre').bind(user.userId,user.displayName).run();
}
export async function miembros(){return (await db().prepare('SELECT id,nombre FROM equipo ORDER BY nombre').all<Miembro>()).results;}
async function responsable(id:string){const r=await db().prepare('SELECT nombre FROM equipo WHERE id = ?').bind(id).first<{nombre:string}>();if(!r)throw new ErrorRegistro('Selecciona un responsable del equipo',422);return r.nombre;}
type Row={datos:string;numero:number|null};
const base='SELECT incidencias.datos, folios.numero FROM incidencias LEFT JOIN folios ON folios.incidencia_id = incidencias.id';
export async function listar(){const r=await db().prepare(base+' ORDER BY incidencias.creado_en DESC, incidencias.id DESC').all<Row>();return r.results.map(x=>normalizar(JSON.parse(x.datos),x.numero));}
export async function obtener(id:string){const row=await db().prepare(base+' WHERE incidencias.id = ?').bind(id).first<Row>();if(!row)throw new ErrorRegistro('La incidencia no existe',404);return normalizar(JSON.parse(row.datos),row.numero);}
export async function historial(id:string):Promise<Evento[]>{
  const actual=await obtener(id);
  const r=await db().prepare('SELECT * FROM eventos WHERE incidencia_id = ? ORDER BY fecha, rowid').bind(id).all<Omit<Evento,'anterior'|'nuevo'>&{anterior:string|null;nuevo:string}>();
  return r.results.map(e=>({...e,anterior:e.anterior?{...normalizar(JSON.parse(e.anterior)),referencia:actual.referencia}:null,nuevo:{...normalizar(JSON.parse(e.nuevo)),referencia:actual.referencia}}));
}
export async function ultimosEventos(){return (await db().prepare('SELECT id,incidencia_id,actor_nombre,accion,motivo,fecha FROM eventos ORDER BY fecha DESC, rowid DESC LIMIT 8').all()).results;}
export async function adjuntos(id:string){return (await db().prepare('SELECT id,incidencia_id,nombre,tipo,tamano,fecha,actor_nombre FROM archivos WHERE incidencia_id = ? ORDER BY fecha').bind(id).all<Adjunto>()).results;}
export async function crear(datos:Alta,user:ChatGPTUser){
  const nombre=await responsable(datos.responsableId);const ahora=new Date().toISOString();
  const nuevo:Incidencia={...datos,referencia:'',responsable:nombre,estado:'NUEVA',version:1,creadoPor:user.userId,creadoNombre:user.displayName,creadoEn:ahora,modificadoPor:user.userId,modificadoEn:ahora,resueltoPor:null,resueltoEn:null,cerradoEn:null,resultado:'',confirmacionCliente:false,ultimaGestion:ahora};
  const raw=JSON.stringify(nuevo);
  await db().batch([
    db().prepare('INSERT INTO incidencias (id,estado,version,datos,creado_en) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(datos.id,'ABIERTO',1,raw,ahora),
    db().prepare('INSERT INTO folios (incidencia_id) VALUES (?) ON CONFLICT(incidencia_id) DO NOTHING').bind(datos.id),
    db().prepare("INSERT INTO eventos (id,incidencia_id,actor_id,actor_nombre,accion,motivo,fecha,anterior,nuevo) SELECT ?,id,?,?, 'CREAR','Alta de incidencia',?,NULL,datos FROM incidencias WHERE id = ? AND datos = ? ON CONFLICT(id) DO NOTHING").bind(`${datos.id}:1`,user.userId,user.displayName,ahora,datos.id,raw),
  ]);
  const original=await db().prepare('SELECT nuevo FROM eventos WHERE id = ?').bind(`${datos.id}:1`).first<{nuevo:string}>();
  const altaOriginal=original?JSON.parse(original.nuevo):null;
  if(!altaOriginal||altaOriginal.creadoPor!==user.userId||Object.keys(datos).some(k=>datos[k as keyof Alta]!==altaOriginal[k]))throw new ErrorRegistro('El identificador de alta ya se ha utilizado con otros datos. Conserva el texto y abre un formulario nuevo.',409);
  return obtener(datos.id);
}
function revision(actual:Incidencia,version:number){if(actual.version!==version)throw new ErrorRegistro('Otra persona ha actualizado el expediente. Pulsa Actualizar detalle y revisa los datos antes de guardar.',409);}
async function guardar(anterior:Incidencia,nuevo:Incidencia,motivo:string,accion:string,user:ChatGPTUser,extra:D1PreparedStatement[]=[]){
  const results=await db().batch([
    ...extra,
    db().prepare('INSERT INTO eventos (id,incidencia_id,actor_id,actor_nombre,accion,motivo,fecha,anterior,nuevo) SELECT ?,id,?,?,?,?,?,datos,? FROM incidencias WHERE id = ? AND version = ?').bind(`${nuevo.id}:${nuevo.version}`,user.userId,user.displayName,accion,motivo,nuevo.modificadoEn,JSON.stringify(nuevo),nuevo.id,anterior.version),
    db().prepare('UPDATE incidencias SET estado = ?, version = ?, datos = ? WHERE id = ? AND version = ?').bind(estadoBase(nuevo.estado),nuevo.version,JSON.stringify(nuevo),nuevo.id,anterior.version),
  ]);
  if(results.at(-1)!.meta.changes!==1)throw new ErrorRegistro('El expediente ha cambiado. Actualiza el detalle antes de guardar.',409);
  return nuevo;
}
export async function gestionar(id:string,cambio:Gestion,user:ChatGPTUser){
  const anterior=await obtener(id);revision(anterior,cambio.version);
  if(!puedeCambiar(anterior.estado,cambio.estado))throw new ErrorRegistro('Para cerrar, primero marca la incidencia como solucionada. Un caso cerrado solo puede reabrirse en gestión.',422);
  const ahora=new Date().toISOString();const solucion=['SOLUCIONADA','CERRADA'].includes(cambio.estado);
  const nuevo:Incidencia={...anterior,...cambio,responsable:await responsable(cambio.responsableId),version:anterior.version+1,modificadoPor:user.userId,modificadoEn:ahora,ultimaGestion:ahora,
    resueltoPor:solucion?(anterior.resueltoPor??user.userId):null,resueltoEn:solucion?(anterior.resueltoEn??ahora):null,
    cerradoEn:cambio.estado==='CERRADA'?ahora:null,confirmacionCliente:cambio.estado==='CERRADA'&&cambio.confirmacionCliente,
    resultado:solucion?cambio.resultado:'',proximaAccion:cambio.estado==='CERRADA'?'':cambio.proximaAccion,fechaLimite:cambio.estado==='CERRADA'?'':cambio.fechaLimite};
  // El texto de gestión pertenece al evento, no se mezcla con los datos del envío.
  delete (nuevo as Incidencia & {motivo?:string}).motivo;
  return guardar(anterior,nuevo,cambio.motivo,'GESTION',user);
}
export async function subir(id:string,file:File,version:number,user:ChatGPTUser){
  const anterior=await obtener(id);revision(anterior,version);
  if(!env.BUCKET)throw new Error('Almacenamiento no disponible');
  if(!file.size||file.size>10*1024*1024)throw new ErrorRegistro('El archivo debe tener contenido y ocupar como máximo 10 MB',422);
  const bytes=new Uint8Array(await file.arrayBuffer());
  const header=String.fromCharCode(...bytes.slice(0,12));
  const tipo=header.startsWith('%PDF-')?'application/pdf':bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff?'image/jpeg':bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'?'image/png':header.startsWith('RIFF')&&header.slice(8,12)==='WEBP'?'image/webp':null;
  if(!tipo)throw new ErrorRegistro('Adjunta un PDF o una imagen JPG, PNG o WebP válida',422);
  const aid=crypto.randomUUID();const clave=`incidencias/${id}/${aid}`;const ahora=new Date().toISOString();const nombre=file.name.replace(/[\r\n\/\\]/g,'_').slice(0,160)||'documento';
  await env.BUCKET.put(clave,bytes,{httpMetadata:{contentType:tipo}});
  const nuevo={...anterior,version:anterior.version+1,modificadoPor:user.userId,modificadoEn:ahora};
  try{
    await guardar(anterior,nuevo,`Documento adjunto: ${nombre}`,'ADJUNTO',user,[
      db().prepare('INSERT INTO archivos (id,incidencia_id,nombre,tipo,tamano,clave,fecha,actor_nombre) SELECT ?,id,?,?,?,?,?,? FROM incidencias WHERE id = ? AND version = ?').bind(aid,nombre,tipo,file.size,clave,ahora,user.displayName,id,version),
    ]);
  }catch(e){await env.BUCKET.delete(clave);throw e;}
  return nuevo;
}
export async function descargar(id:string){
  const file=await db().prepare('SELECT * FROM archivos WHERE id = ?').bind(id).first<Adjunto&{clave:string}>();
  if(!file)throw new ErrorRegistro('Documento no encontrado',404);
  if(!env.BUCKET)throw new Error('Almacenamiento no disponible');
  const blob=await env.BUCKET.get(file.clave);if(!blob)throw new ErrorRegistro('No se ha encontrado el archivo',404);
  return new Response(blob.body,{headers:{'Content-Type':file.tipo,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(file.nombre)}`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
}
