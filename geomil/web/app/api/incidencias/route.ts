import { z } from 'zod';
import { altaSchema, gestionSchema } from '@/lib/logistica';
import { crear,listar,obtener,historial,gestionar,miembros,ultimosEventos,adjuntos } from '@/db/registro';
import { run,body } from '@/lib/api-servidor';
export const dynamic='force-dynamic';
export async function GET(request:Request){return run(request,false,async user=>{
  const id=new URL(request.url).searchParams.get('id');
  if(id){z.string().uuid().parse(id);return {incidencia:await obtener(id),eventos:await historial(id),adjuntos:await adjuntos(id)};}
  return {incidencias:await listar(),equipo:await miembros(),actualizaciones:await ultimosEventos(),usuario:{id:user.userId,nombre:user.displayName},ahora:new Date().toISOString()};
});}
export async function POST(request:Request){return run(request,true,async user=>({incidencia:await crear(altaSchema.parse(await body(request)),user)}));}
export async function PATCH(request:Request){return run(request,true,async user=>({incidencia:await gestionar(z.string().uuid().parse(new URL(request.url).searchParams.get('id')),gestionSchema.parse(await body(request)),user)}));}
