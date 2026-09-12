import { z } from "zod";
export const assessmentSchema=z.object({
  visibleSymptoms:z.array(z.string().max(500)).max(8),
  possibleCauses:z.array(z.string().max(500)).max(5),
  uncertainty:z.string().max(1200),
  inspectNext:z.array(z.string().max(500)).max(8),
  consultExpert:z.string().max(1000),
  usableImage:z.boolean(),
}).strict();
export type Assessment=z.infer<typeof assessmentSchema>;
export const healthRequest=z.object({image:z.string().max(3_000_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/),crop:z.string().min(1).max(100),note:z.string().min(1).max(1000)}).strict();
