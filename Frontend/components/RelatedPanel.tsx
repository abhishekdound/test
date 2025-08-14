'use client';
import {useEffect, useState} from 'react';

type Related = { id: string; title: string; snippet: string; pageNumber: number; score: number };
export default function RelatedPanel({
  jobId, currentSectionId, onJump
}: { jobId: string; currentSectionId: string; onJump: (pageNumber: number)=>void }) {
  const [items, setItems] = useState<Related[]>([]);
  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/adobe/related-sections/${jobId}/${currentSectionId}`;
    fetch(url).then(r => r.json()).then(setItems).catch(()=>setItems([]));
  }, [jobId, currentSectionId]);

  return (
    <aside style={{width: 360, borderLeft: '1px solid #eee', padding: 12}}>
      <h3>Related sections</h3>
      {items.slice(0,3).map(r => (
        <button key={r.id} onClick={() => onJump(r.pageNumber)} style={{display:'block', width:'100%', textAlign:'left', margin:'8px 0'}}>
          <div style={{fontWeight:600}}>{r.title}</div>
          <div style={{fontSize:12, opacity:.75}}>{r.snippet}</div>
        </button>
      ))}
    </aside>
  );
}
