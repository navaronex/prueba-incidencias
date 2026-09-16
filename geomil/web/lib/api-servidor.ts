import { getChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';
import { registrarUsuario, ErrorRegistro } from '@/db/registro';
import { ZodError } from 'zod';
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function run(request:Request,write:boolean,action:(user:ChatGPTUser)=>Promise<unknown>,multipart=false){
  try{
    const user=await getChatGPTUser();if(!user)return json({error:'Inicia sesión para acceder al registro'},401);
    if(write){
      if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origen no permitido'},403);
      if(!request.headers.get('content-type')?.startsWith(multipart?'multipart/form-data':'application/json'))return json({error:'Formato de solicitud no válido'},415);
    }
    await registrarUsuario(user);const value=await action(user);return value instanceof Response?value:json(value);
  }catch(e){
    if(e instanceof ZodError)return json({error:e.issues[0].message},422);
    if(e instanceof ErrorRegistro)return json({error:e.message},e.status);
    if(e instanceof SyntaxError)return json({error:'Solicitud no válida'},400);
    console.error('Error de incidencias',e instanceof Error?e.message:'Error desconocido');
    return json({error:'No se pudo completar la operación. Tus datos del formulario se conservan; vuelve a intentarlo.'},503);
  }
}
export async function body(request:Request){const text=await request.text();if(text.length>16000)throw new ErrorRegistro('El formulario es demasiado largo',413);return JSON.parse(text);}
