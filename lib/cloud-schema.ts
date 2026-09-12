import { z } from "zod";
import type { State } from "./data";
const text = z.string().max(5000);
const id = z.string().min(1).max(100);
const image = z.string().max(3_000_000).refine(v => v === "" || /^\/assets\/[a-z-]+\.webp$/.test(v) || /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(v) || /^private:[0-9a-f-]{36}\/[0-9a-f]{64}\.jpg$/.test(v), "Unsupported photo format");
const date = z.string().refine(v => v === "" || /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(v), "Invalid date");
export const gardenSchema = z.object({
  version: z.literal(1),
  plants: z.array(z.object({id,name:text,crop:text,category:text,date,location:text,setting:text,quantity:text,soil:text,image,stage:z.enum(["Growing","Harvested"])}).strict()).max(500),
  entries: z.array(z.object({id,plantId:id,kind:text,note:text,image,date} ).strict()).max(3000),
  tasks: z.array(z.object({id,plantId:id,title:text,date,done:z.boolean()}).strict()).max(3000),
  profile: z.object({name:text,location:text,role:text,bio:text,care:z.boolean(),weather:z.boolean(),community:z.boolean(),interested:z.boolean()}).strict(),
}).strict().superRefine((s,ctx)=>{
  const ids=new Set(s.plants.map(p=>p.id));
  for (const rows of [s.plants,s.entries,s.tasks]) if(new Set(rows.map(r=>r.id)).size!==rows.length) ctx.addIssue({code:"custom",message:"Duplicate record IDs"});
  if([...s.entries,...s.tasks].some(r=>!ids.has(r.plantId)))ctx.addIssue({code:"custom",message:"Record refers to a missing plant"});
});
export type Garden = z.infer<typeof gardenSchema>;
export function privateGarden(state: State): Garden {
  return gardenSchema.parse({version:state.version,plants:state.plants,entries:state.entries,tasks:state.tasks,profile:state.profile});
}
export function photoPath(owner: string, image: string) {
  const path=image.slice("private:".length);
  if(!image.startsWith("private:") || !new RegExp(`^${owner}/[0-9a-f]{64}\\.jpg$`).test(path))throw new Error("Photo does not belong to this account.");
  return path;
}
