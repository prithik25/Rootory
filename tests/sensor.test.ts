import { describe,it,expect } from 'vitest';
import { sensorInput,moistureBand } from '../lib/sensor';
describe('simulation ingestion boundary',()=>{
 const valid={deviceId:'550e8400-e29b-41d4-a716-446655440000',moisture:24,source:'simulation'};
 it('accepts simulated integer readings at both endpoints',()=>{for(const moisture of [0,24,100])expect(sensorInput.safeParse({...valid,moisture}).success).toBe(true);});
 it('rejects impossible readings, wrong types and physical claims',()=>{for(const moisture of [-1,101,NaN,24.5,'24',null])expect(sensorInput.safeParse({...valid,moisture}).success).toBe(false);expect(sensorInput.safeParse({...valid,source:'physical'}).success).toBe(false);});
 it('rejects client-selected ownership and plant overrides',()=>{expect(sensorInput.safeParse({...valid,userId:'other',plantId:'other'}).success).toBe(false);});
 it('labels thresholds as demo ranges',()=>{expect(moistureBand(29)).toBe('Low demo reading');expect(moistureBand(30)).toBe('Middle demo range');expect(moistureBand(80)).toBe('Middle demo range');expect(moistureBand(81)).toBe('High demo reading');});
});
