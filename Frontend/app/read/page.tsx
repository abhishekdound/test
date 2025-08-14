'use client';
import {useRef, useState} from 'react';
import PdfReader from '@/components/PdfReader';
import RelatedPanel from '@/components/RelatedPanel';

export default function Read() {
  const [jobId, setJobId] = useState<string>('current');     // swap with real job id
  const [sectionId, setSectionId] = useState<string>('s-1'); // update via your chunker
  const [page, setPage] = useState<number>(1);
  const viewerRef = useRef<any>(null);

  const jump = (p: number) => {
    // @ts-ignore
    (document.getElementById('adobe-dc-view') as any)?.setGoTo?.({ pageNumber: p });
  };

  return (
    <div style={{display:'flex'}}>
      <div style={{flex:1}}>
        <PdfReader
          fileUrl={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf-embed/file/${jobId}`}
          fileName={'current.pdf'}
          onPageChange={(p)=>setPage(p)}
        />
      </div>
      <RelatedPanel jobId={jobId} currentSectionId={sectionId} onJump={jump}/>
    </div>
  );
}
