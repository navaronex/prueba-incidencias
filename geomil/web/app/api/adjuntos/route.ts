import { z } from 'zod';
import { run } from '@/lib/api-servidor';
import { subir,descargar,ErrorRegistro } from '@/db/registro';
export const dynamic='force-dynamic';
export async function GET(request:Request){return run(request,false,async()=>descargar(z.string().uuid().parse(new URL(request.url).searchParams.get('id'))));}
export async function POST(request:Request){return run(request,true,async user=>{
  if(Number(request.headers.get('content-length')??0)>11*1024*1024)throw new ErrorRegistro('Máximo 10 MB por documento',413);
  const form=await request.formData();const file=form.get('archivo');
  if(!(file instanceof File))throw new ErrorRegistro('Selecciona un archivo',422);
  const id=z.string().uuid().parse(form.get('id'));
  const version=z.coerce.number().int().positive().parse(form.get('version'));
  return {incidencia:await subir(id,file,version,user)};
},true);}
