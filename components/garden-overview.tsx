import type { State } from '@/lib/data';
import { ArrowUpRight, Sprout, Check } from 'lucide-react';
export function GardenOverview({data,onPlants,onCare}:{data:State;onPlants:()=>void;onCare:()=>void}){
 const categories=Array.from(new Set(data.plants.map(p=>p.category))).map(name=>({name,count:data.plants.filter(p=>p.category===name).length}));
 const done=data.tasks.filter(t=>t.done).length,total=data.tasks.length,percent=total?Math.round(done/total*100):0;
 return <section className="garden-overview" aria-label="Garden at a glance">
  <div className="garden-overview-title"><span className="eyebrow">YOUR GARDEN, AT A GLANCE</span><h2>A little progress adds up.</h2><p>From the plants and care you’ve recorded.</p></div>
  <div className="garden-mix"><div className="row between"><h3><Sprout size={17}/> Growing together</h3><button className="icon-button borderless" aria-label="View all plants" onClick={onPlants}><ArrowUpRight size={18}/></button></div>
   {categories.length?<><div className="garden-mix-bar" aria-hidden="true">{categories.map((c,i)=><span key={c.name} style={{flex:c.count,background:['#345e47','#91aa69','#d5dfad','#b2c6b7'][i%4]}}/>)}</div><div className="garden-mix-legend">{categories.map((c,i)=><span key={c.name}><i style={{background:['#345e47','#91aa69','#d5dfad','#b2c6b7'][i%4]}}/>{c.name}<strong>{c.count}</strong></span>)}</div></>:<p>Add a plant to start your growing collection.</p>}
  </div>
  <button className="care-progress" onClick={onCare} aria-label={`${done} of ${total} care reminders complete. View care reminders.`}><span className="care-ring" style={{background:`conic-gradient(#567b46 ${percent}%, #e8eddf 0)`}}><span>{total?`${percent}%`:<Check size={21}/>}</span></span><span><strong>Your care rhythm</strong><small>{total?`${done} of ${total} reminders complete`:'Your next chapter starts with a reminder'}</small><span className="care-link">View care reminders <ArrowUpRight size={14}/></span></span></button>
 </section>;
}
