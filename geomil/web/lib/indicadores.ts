import { activa,pendiente,alerta,fechaLocal,type Incidencia } from './logistica';
export function indicadores(rows:Incidencia[],now=new Date()){
  const today=fechaLocal(now);
  const pendientes=rows.filter(pendiente);
  return {
    urgentes:pendientes.filter(r=>alerta(r,now).nivel===3).length,
    respuesta:pendientes.filter(r=>r.estado==='ESPERANDO_TERCERO'||r.estado==='ESPERANDO_CLIENTE').length,
    gestion:rows.filter(r=>r.estado==='EN_GESTION').length,
    resueltasHoy:rows.filter(r=>!!r.resueltoEn&&fechaLocal(r.resueltoEn)===today).length,
    abiertas:rows.filter(activa).length,
  };
}
export function atencion(rows:Incidencia[],now=new Date()){
  return rows.filter(r=>pendiente(r)&&alerta(r,now).nivel>0).sort((a,b)=>alerta(b,now).nivel-alerta(a,now).nivel||(a.fechaLimite||'').localeCompare(b.fechaLimite||'')||a.creadoEn.localeCompare(b.creadoEn));
}
export function misTareas(rows:Incidencia[],userId:string,now=new Date()){
  return rows.filter(r=>r.responsableId===userId&&pendiente(r)&&(!r.fechaLimite||r.fechaLimite<=fechaLocal(now)||alerta(r,now).nivel>0));
}
export function agrupar(rows:Incidencia[],field:'tipo'|'mensajeria'){
  const groups=new Map<string,number>();for(const row of rows)groups.set(row[field],(groups.get(row[field])??0)+1);
  return [...groups].map(([nombre,total])=>({nombre,total})).sort((a,b)=>b.total-a.total||a.nombre.localeCompare(b.nombre));
}
