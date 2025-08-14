'use client';
import {useState} from 'react';
export default function InsightsBulb({jobId}:{jobId:string}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const run = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adobe/insights/${jobId}`, {method:'POST'});
    setData(await res.json());
    setOpen(true);
  };
  return (
    <>
      <button onClick={run} style={{position:'fixed', right:24, bottom:24, borderRadius:'50%', padding:18}}>💡</button>
      {open && <div style={{position:'fixed', right:24, bottom:84, width:420, background:'#fff', border:'1px solid #eee', padding:16}}>
        <h3>Insights</h3>
        <ul>
          <li><b>Key insights:</b> {data?.keyInsights?.join('; ')}</li>
          <li><b>Did you know:</b> {data?.didYouKnow?.join('; ')}</li>
          <li><b>Contradictions:</b> {data?.contradictions?.join('; ')}</li>
          <li><b>Cross‑doc connections:</b> {data?.connections?.join('; ')}</li>
        </ul>
      </div>}
    </>
  );
}
