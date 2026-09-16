"use client";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { estados,prioridades,type Estado,type Prioridad } from '@/lib/logistica';
export function Choice({id,label,value,onChange,options,disabled=false}: {id:string;label:string;value:string;onChange:(value:string)=>void;options:Record<string,string>;disabled?:boolean}){
  return <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} aria-label={label} className="choice"><SelectValue placeholder="Selecciona…"/></SelectTrigger><SelectContent>{Object.entries(options).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>;
}
export function Badge({estado}:{estado:Estado}){return <span className={'status status-'+estado}>{estados[estado]}</span>;}
export function Priority({value}:{value:Prioridad}){return <span className={'priority priority-'+value}>{prioridades[value]}</span>;}
