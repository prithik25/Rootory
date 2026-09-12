import { assessmentSchema } from "@/lib/assessment";
export function ObservationNote({note}:{note:string}) {
  const marker="AI-assisted observation (not a diagnosis): ";
  const split=note.indexOf(marker);
  if(split<0)return <p style={{whiteSpace:"pre-line"}}>{note}</p>;
  try {
    const a=assessmentSchema.parse(JSON.parse(note.slice(split+marker.length)));
    return <div><p style={{whiteSpace:"pre-line"}}>{note.slice(0,split).trim()}</p>
      <h4>AI-assisted observation</h4><p>Not a confirmed diagnosis.</p>
      <strong>Visible signs</strong><ul>{a.visibleSymptoms.map((s,i)=><li key={i}>{s}</li>)}</ul>
      <strong>Possible causes</strong><ul>{a.possibleCauses.map((s,i)=><li key={i}>{s}</li>)}</ul>
      <p><strong>Uncertainty:</strong> {a.uncertainty}</p>
      <strong>What to inspect</strong><ul>{a.inspectNext.map((s,i)=><li key={i}>{s}</li>)}</ul>
      <p><strong>Expert help:</strong> {a.consultExpert}</p>
    </div>;
  }catch{return <p style={{whiteSpace:"pre-line"}}>{note}</p>;}
}
