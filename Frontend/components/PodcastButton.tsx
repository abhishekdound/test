'use client';
import {useState} from 'react';
export default function PodcastButton({jobId}:{jobId:string}) {
  const [src, setSrc] = useState<string>('');
  const run = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adobe/podcast/${jobId}`, {method:'POST'});
    const { audioUrl } = await res.json();
    setSrc(audioUrl);
  };
  return (
    <div style={{position:'fixed', left:24, bottom:24}}>
      <button onClick={run}>🎧 Podcast mode</button>
      {src && <audio controls src={src} style={{display:'block', marginTop:8}}/>}
    </div>
  );
}
