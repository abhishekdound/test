declare global {
  interface Window {
    AdobeDC: {
      View: new (config: {
        clientId: string
        divId: string
      }) => {
        previewFile: (
          filePromise: {
            content: { promise: Promise<ArrayBuffer> }
            metaData: { fileName: string }
          },
          viewerConfig: {
            embedMode: string
            defaultViewMode: string
            showAnnotationTools?: boolean
            showLeftHandPanel?: boolean
            showDownloadPDF?: boolean
            showPrintPDF?: boolean
            showZoomControl?: boolean
          },
        ) => void
      }
    }
  }
}

export {}
