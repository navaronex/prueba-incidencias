import { z } from 'zod';

export const estados = { NUEVA:'Nueva', EN_GESTION:'En gestión', ESPERANDO_TERCERO:'Esperando tercero', ESPERANDO_CLIENTE:'Esperando cliente', SOLUCIONADA:'Solucionada', CERRADA:'Cerrada' } as const;
export const prioridades = { URGENTE:'Urgente', ALTA:'Alta', MEDIA:'Media', BAJA:'Baja' } as const;
export const etapas = { ESPANA:'Origen España', TRANSITO:'Tránsito internacional', DESTINO:'Destino Latinoamérica', POSTENTREGA:'Después de la entrega' } as const;
export const tiposPorEtapa = {
  ESPANA:{DEMORA_TRANSPORTISTA:'Demora del transportista',NO_RECIBIDO_MADRID:'Paquete no recibido en Madrid',EXTRAVIO_ORIGEN:'Extravío en origen',DANADO_ORIGEN:'Paquete dañado en origen',RECOGIDA:'Incidencia de recogida'},
  TRANSITO:{RETRASO_INTERNACIONAL:'Retraso internacional',ADUANA:'Incidencia aérea / aduanera',EXTRAVIO_TRANSITO:'Extravío en tránsito',DANADO_TRANSITO:'Mercancía dañada en tránsito'},
  DESTINO:{NO_LOCALIZADO:'Corresponsal no localiza paquete',RETRASO_ENTREGA:'Retraso en entrega',EXTRAVIO_DESTINO:'Extravío en destino',ENTREGA_INCORRECTA:'Entrega incorrecta'},
  POSTENTREGA:{FALTAN_ARTICULOS:'Faltan artículos',CONTENIDO_DANADO:'Contenido dañado',MANIPULADO:'Paquete manipulado',DESCONOCE_RECEPCION:'Cliente desconoce recepción'},
} as const;
export const tipos:Record<string,string> = Object.assign({},...Object.values(tiposPorEtapa));
export const resultados = {LOCALIZADO:'Localizado',ENTREGADO:'Entregado',INDEMNIZADO:'Indemnizado',REEMBOLSADO:'Reembolsado',RECHAZADO:'Rechazado',RECUPERADO:'Mercancía recuperada',PERDIDA_DEFINITIVA:'Pérdida definitiva'} as const;
export type Estado = keyof typeof estados;
export type Etapa = keyof typeof etapas;
export type Prioridad = keyof typeof prioridades;
export type Miembro = {id:string;nombre:string};
export const fechaLocal = (value:Date|string = new Date()):string => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
export function fechaVisible(value:string){return value?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(value.length===10?`${value}T12:00:00Z`:value)):'Sin indicar';}
const texto=(nombre:string,max=150)=>z.string().trim().min(1,`${nombre} es obligatorio`).max(max,`${nombre}: máximo ${max} caracteres`);
const opt=(max=150)=>z.string().trim().max(max).default('');
const fecha=z.string().refine(v=>{if(!v)return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;},'Fecha inexistente o formato inválido');
const requerida=fecha.refine(v=>!!v,'La fecha de próximo seguimiento es obligatoria');
export const altaSchema=z.object({
  id:z.string().uuid(),operacion:texto('Guía / referencia',60),expedicion:opt(60),
  cliente:texto('Cliente'),telefono:opt(40),origen:texto('Origen',100),destino:texto('Destino',100),
  mensajeria:texto('Empresa implicada',100),empresaTipo:z.enum(['TRANSPORTISTA','CORRESPONSAL','OTRO']),agente:opt(100),
  etapa:z.enum(['ESPANA','TRANSITO','DESTINO','POSTENTREGA']),tipo:texto('Tipo de incidencia',60),
  prioridad:z.enum(['URGENTE','ALTA','MEDIA','BAJA']),fechaEnvio:fecha.default(''),fechaIncidencia:fecha.default(''),
  responsableId:texto('Responsable',150),proximaAccion:texto('Próxima acción',500),fechaLimite:requerida,
  observaciones:opt(3000),bultos:opt(60),
}).strict().superRefine((d,c)=>{
  if(!(d.tipo in tiposPorEtapa[d.etapa]))c.addIssue({code:'custom',path:['tipo'],message:'El tipo de incidencia no pertenece a esa etapa'});
  if(d.fechaEnvio&&d.fechaIncidencia&&d.fechaIncidencia<d.fechaEnvio)c.addIssue({code:'custom',path:['fechaIncidencia'],message:'La incidencia no puede ser anterior a la recogida'});
});
export const gestionSchema=z.object({
  version:z.number().int().positive(),estado:z.enum(['NUEVA','EN_GESTION','ESPERANDO_TERCERO','ESPERANDO_CLIENTE','SOLUCIONADA','CERRADA']),
  motivo:texto('Gestión realizada',3000),responsableId:texto('Responsable',150),
  proximaAccion:z.string().trim().max(500),fechaLimite:fecha,
  resultado:z.enum(['','LOCALIZADO','ENTREGADO','INDEMNIZADO','REEMBOLSADO','RECHAZADO','RECUPERADO','PERDIDA_DEFINITIVA']),
  confirmacionCliente:z.boolean(),
}).strict().superRefine((d,c)=>{
  if(d.estado!=='CERRADA'&&(!d.proximaAccion||!d.fechaLimite))c.addIssue({code:'custom',message:'Todo caso pendiente de cierre necesita próxima acción y fecha límite'});
  if(['SOLUCIONADA','CERRADA'].includes(d.estado)&&!d.resultado)c.addIssue({code:'custom',message:'Indica el resultado de la solución'});
  if(d.estado==='CERRADA'&&!d.confirmacionCliente)c.addIssue({code:'custom',message:'Confirma con el cliente la solución antes de cerrar'});
});
export type Alta=z.infer<typeof altaSchema>;
export type Gestion=z.infer<typeof gestionSchema>;
export type Incidencia=Alta & {referencia:string;responsable:string;estado:Estado;version:number;creadoPor:string;creadoNombre:string;creadoEn:string;modificadoPor:string;modificadoEn:string;resueltoPor:string|null;resueltoEn:string|null;cerradoEn:string|null;resultado:string;confirmacionCliente:boolean;ultimaGestion:string;};
export type Evento={id:string;incidencia_id:string;actor_id:string;actor_nombre:string;accion:string;motivo:string;fecha:string;anterior:Incidencia|null;nuevo:Incidencia;};
export type Adjunto={id:string;incidencia_id:string;nombre:string;tipo:string;tamano:number;fecha:string;actor_nombre:string;};
export const activa=(r:Incidencia)=>r.estado!=='CERRADA'&&r.estado!=='SOLUCIONADA';
export const pendiente=(r:Incidencia)=>r.estado!=='CERRADA';
export function puedeCambiar(a:Estado,b:Estado){
  if(a===b)return a!=='CERRADA';
  if(a==='CERRADA')return b==='EN_GESTION';
  if(b==='CERRADA')return a==='SOLUCIONADA';
  if(b==='NUEVA')return false;
  return true;
}
// La columna antigua se mantiene compatible; el detalle JSON contiene el flujo nuevo.
export function estadoBase(estado:Estado){return estado==='NUEVA'?'ABIERTO':['SOLUCIONADA','CERRADA'].includes(estado)?'RESUELTO':'EN_INVESTIGACION';}
export function normalizar(raw: Record<string,unknown>, numero?:number|null):Incidencia{
  const legacy:Record<string,Estado>={ABIERTO:'NUEVA',EN_INVESTIGACION:'EN_GESTION',RESUELTO:'SOLUCIONADA'};
  const estado=legacy[String(raw.estado)]??raw.estado as Estado;
  const etapa=(raw.etapa??'ESPANA') as Etapa;
  const tipo=String(raw.tipo);
  const tipoMap:Record<string,string>={EXTRAVIO:'EXTRAVIO_ORIGEN',PERDIDA_TOTAL:'EXTRAVIO_ORIGEN',RETRASO:'DEMORA_TRANSPORTISTA',ROBO:'EXTRAVIO_ORIGEN'};
  return {...raw,estado,etapa,tipo:tipoMap[tipo]??tipo,
    telefono:raw.telefono??'',origen:raw.origen??raw.ruta??'',destino:raw.destino??'',
    empresaTipo:raw.empresaTipo??(raw.mensajeria==='AGENTE'?'CORRESPONSAL':'TRANSPORTISTA'),
    prioridad:raw.prioridad??'MEDIA',responsableId:raw.responsableId??'',responsable:raw.responsable??'',
    proximaAccion:raw.proximaAccion??'',fechaLimite:raw.fechaLimite??'',resultado:raw.resultado??'',confirmacionCliente:raw.confirmacionCliente??false,
    cerradoEn:raw.cerradoEn??null,ultimaGestion:raw.ultimaGestion??raw.modificadoEn??raw.creadoEn,
    referencia:numero?`INC-${String(raw.creadoEn).slice(0,4)}-${String(numero).padStart(4,'0')}`:raw.referencia??`INC-${String(raw.creadoEn).slice(0,4)}-${String(raw.id).slice(0,8).toUpperCase()}`,
  } as Incidencia;
}
export type Alerta={nivel:0|1|2|3;texto:string;vencida:boolean;hoy:boolean;horas:number;};
export function alerta(r:Incidencia,now=new Date()):Alerta{
  const horas=Math.max(0,(now.getTime()-new Date(r.ultimaGestion).getTime())/3600000);
  const hoy=fechaLocal(now);
  if(!pendiente(r))return {nivel:0,texto:'Cerrada',vencida:false,hoy:false,horas};
  const vencida=!!r.fechaLimite&&r.fechaLimite<hoy;
  const paraHoy=r.fechaLimite===hoy;
  if(!r.responsableId||!r.proximaAccion||!r.fechaLimite)return {nivel:3,texto:'Completar seguimiento',vencida,hoy:paraHoy,horas};
  if(horas>=120)return {nivel:3,texto:'Escalar a supervisión · 5 días',vencida,hoy:paraHoy,horas};
  if(vencida)return {nivel:3,texto:'Seguimiento vencido',vencida,hoy:paraHoy,horas};
  if(horas>=72)return {nivel:3,texto:'72 h sin gestión',vencida,hoy:paraHoy,horas};
  if(r.prioridad==='URGENTE')return {nivel:3,texto:'Prioridad urgente',vencida,hoy:paraHoy,horas};
  if(paraHoy)return {nivel:2,texto:'Seguimiento hoy',vencida,hoy:true,horas};
  if(horas>=48)return {nivel:1,texto:'48 h sin gestión',vencida,hoy:false,horas};
  return {nivel:0,texto:'Programado',vencida,hoy:false,horas};
}
export function diasAbierta(r:Incidencia,now=new Date()){
  const fin=r.cerradoEn?new Date(r.cerradoEn):now;
  return Math.max(0,Math.floor((fin.getTime()-new Date(r.creadoEn).getTime())/86400000));
}
