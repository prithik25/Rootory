import { z } from 'zod';
export const sensorInput=z.object({deviceId:z.string().uuid(),moisture:z.number().int().min(0).max(100),source:z.literal('simulation')}).strict();
export function moistureBand(value:number){return value<30?'Low demo reading':value>80?'High demo reading':'Middle demo range';}
