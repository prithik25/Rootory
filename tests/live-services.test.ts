import { afterEach,describe,expect,it,vi } from "vitest";
import { GET } from "../app/api/weather/route";
import { assessmentSchema,healthRequest } from "../lib/assessment";
import { privateGarden } from "../lib/cloud-schema";
import { seed } from "../lib/data";
afterEach(()=>vi.unstubAllGlobals());
describe("live service boundaries",()=>{
 it("rejects missing and out-of-range coordinates without upstream requests",async()=>{const call=vi.fn();vi.stubGlobal("fetch",call);expect((await GET(new Request('http://localhost/api/weather'))).status).toBe(400);expect((await GET(new Request('http://localhost/api/weather?latitude=91&longitude=0'))).status).toBe(400);expect(call).not.toHaveBeenCalled();});
 it("rounds location and maps timestamp-matched rain probability",async()=>{const call=vi.fn().mockResolvedValue(Response.json({current:{time:"2026-09-12T14:30",temperature_2m:27,relative_humidity_2m:70,wind_speed_10m:9},hourly:{time:["2026-09-12T13:00","2026-09-12T14:00"],precipitation_probability:[5,65]},timezone:"Asia/Kolkata"}));vi.stubGlobal("fetch",call);const result=await GET(new Request('http://localhost/api/weather?latitude=18.52345&longitude=73.85678'));expect(await result.json()).toMatchObject({rainProbability:65,time:"2026-09-12T14:30"});expect(call.mock.calls[0][0]).toContain('latitude=18.52&longitude=73.86');});
 it("returns an error, never sample weather, on upstream failure",async()=>{vi.stubGlobal("fetch",vi.fn().mockRejectedValue(new Error("offline")));expect((await GET(new Request('http://localhost/api/weather?latitude=18&longitude=73'))).status).toBe(502);});
 it("rejects incomplete AI responses and non-image input",()=>{expect(assessmentSchema.safeParse({visibleSymptoms:["spots"]}).success).toBe(false);expect(healthRequest.safeParse({image:"https://example.com",crop:"Tomato",note:"spots"}).success).toBe(false);});
 it("accepts real timeline ISO timestamps for cloud saves",()=>{const s=seed();s.entries[0].date="2026-09-12T10:30:00.123Z";expect(privateGarden(s).entries[0].date).toBe(s.entries[0].date);});
});
