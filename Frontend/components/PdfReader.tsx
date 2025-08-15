'use client';
import {useEffect, useRef, useState} from 'react';
import Script from 'next/script';

declare global {
  interface Window { 
    AdobeDC?: {
      View: new (config: { clientId: string; divId: string; }) => {
        previewFile: (filePromise: any, viewerConfig: any) => void;
        getAPIs: () => Promise<any>;
      }
    }
  }
}

type JumpTarget = { pageNumber: number };
type Props = {
  fileUrl: string;          // backend-signed URL or public URL
  fileName: string;
  onReady?: (api: any) => void;
  onPageChange?: (page: number) => void;
};

export default function PdfReader({ fileUrl, fileName, onReady, onPageChange }: Props) {
  const divId = 'adobe-dc-view';
  const [api, setApi] = useState<any>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.AdobeDC) return;
    const view = new window.AdobeDC.View({
      clientId: process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID,
      divId
    });
    view.previewFile(
      {
        content: { location: { url: fileUrl } },
        metaData: { fileName }
      },
      {
        embedMode: 'FULL_WINDOW',
        showLeftHandPanel: true,
        enableAnnotationAPIs: true,
        includePDFAnnotations: true
      }
    );
    view.getAPIs().then((apis: any) => {
      setApi(apis);
      onReady?.(apis);
      apis.getCurrentPage().then((p: number) => onPageChange?.(p));
      apis.addEventListener('PAGE_VIEW', (e: any) => onPageChange?.(e.data.pageNumber));
    });
  }, [fileUrl, fileName]);

  // programmatic jump (Adobe supports goToLocation)
  const goTo = (t: JumpTarget) => api?.gotoLocation({ pageNumber: t.pageNumber, zoom: 125 });

  // expose a tiny API via DOM dataset for parent components (optional)
  useEffect(() => {
    if (viewerRef.current) {
      (viewerRef.current as any).setGoTo = goTo;
    }
  }, [api]);

  return (
    <>
      <Script src="https://documentcloud.adobe.com/view-sdk/main.js" strategy="afterInteractive" />
      <div id={divId} ref={viewerRef} style={{height: '100vh', width: '100%'}} />
    </>
  );
}
