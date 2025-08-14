'use client';
import {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';

export default function Library() {
  const [status, setStatus] = useState<string>('');
  const onDrop = useCallback(async (files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    setStatus('Uploading…');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/adobe/analyze`, { method:'POST', body: fd });
    const data = await res.json(); // {jobId}
    setStatus(`Indexed. Job: ${data.jobId}`);
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {'application/pdf': ['.pdf']}, multiple:true});

  return (
    <main>
      <h2>Upload your past PDFs</h2>
      <div {...getRootProps()} style={{border:'2px dashed #999', padding:24}}>
        <input {...getInputProps()} />
        {isDragActive ? 'Drop here' : 'Drag & drop PDFs or click'}
      </div>
      <p>{status}</p>
    </main>
  );
}
