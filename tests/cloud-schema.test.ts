import { describe, expect, it } from "vitest";
import { gardenSchema, privateGarden, photoPath } from "../lib/cloud-schema";
import { seed } from "../lib/data";
describe("private cloud garden boundary",()=>{
 it("does not publish marketplace or community data",()=>{const g=privateGarden(seed());expect(g).not.toHaveProperty("posts");expect(g).not.toHaveProperty("listings");expect(g.plants).toHaveLength(3);});
 it("rejects orphan timeline records",()=>{const g=privateGarden(seed());g.entries[0].plantId="missing";expect(gardenSchema.safeParse(g).success).toBe(false);});
 it("rejects unsafe image URLs and duplicate IDs",()=>{const g=privateGarden(seed());g.plants[0].image="https://example.com/tracker";expect(gardenSchema.safeParse(g).success).toBe(false);g.plants[0].image="";g.plants[1].id=g.plants[0].id;expect(gardenSchema.safeParse(g).success).toBe(false);});
 it("rejects another account's photo references",()=>{const a="00000000-0000-0000-0000-000000000001",b="00000000-0000-0000-0000-000000000002",h="a".repeat(64);expect(photoPath(a,`private:${a}/${h}.jpg`)).toBe(`${a}/${h}.jpg`);expect(()=>photoPath(a,`private:${b}/${h}.jpg`)).toThrow();});
});
