import { useState, useCallback, useRef } from 'react';
import apiService, { 
  AnalysisRequest, 
  AnalysisResponse, 
  RelatedSection, 
  Insight, 
  PodcastResponse 
} from '@/lib/api';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): ApiResponse<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }));
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return { ...state, execute, reset };
}

// Specific hooks for common operations
export function useDocumentAnalysis() {
  return useApi(apiService.analyzeDocuments);
}

export function useRelatedSections() {
  return useApi(apiService.getRelatedSections);
}

export function useInsightsGeneration() {
  return useApi(apiService.generateInsights);
}

export function usePodcastGeneration() {
  return useApi(apiService.generatePodcast);
}

export function useJobStatus() {
  return useApi(apiService.getJobStatus);
}

export function useDocumentViewer() {
  return useApi(apiService.getDocumentViewerConfig);
}

export function usePdfEmbed() {
  return useApi(apiService.getPdfEmbedConfig);
}

// Hook for managing multiple API calls
export function useMultiApi() {
  const [states, setStates] = useState<Record<string, ApiState<any>>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  const execute = useCallback(async (
    key: string,
    apiFunction: (...args: any[]) => Promise<any>,
    ...args: any[]
  ) => {
    // Cancel previous request if it exists
    if (abortControllers.current[key]) {
      abortControllers.current[key].abort();
    }

    // Create new abort controller
    abortControllers.current[key] = new AbortController();

    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true, error: null }
    }));

    try {
      const result = await apiFunction(...args);
      setStates(prev => ({
        ...prev,
        [key]: { data: result, loading: false, error: null }
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      setStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        }
      }));
    }
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const newStates = { ...prev };
        delete newStates[key];
        return newStates;
      });
      
      if (abortControllers.current[key]) {
        abortControllers.current[key].abort();
        delete abortControllers.current[key];
      }
    } else {
      setStates({});
      Object.values(abortControllers.current).forEach(controller => controller.abort());
      abortControllers.current = {};
    }
  }, []);

  const getState = useCallback((key: string) => {
    return states[key] || { data: null, loading: false, error: null };
  }, [states]);

  return { execute, reset, getState, states };
}

// Hook for polling job status
export function useJobPolling(jobId: string | null, interval = 2000) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        setLoading(true);
        const result = await apiService.getJobStatus(jobId);
        setStatus(result);
        setError(null);
        
        // Stop polling if job is complete or failed
        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Polling failed');
      } finally {
        setLoading(false);
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, interval);
  }, [jobId, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setLoading(false);
    setError(null);
  }, [stopPolling]);

  return {
    status,
    loading,
    error,
    startPolling,
    stopPolling,
    reset,
    isPolling: intervalRef.current !== null
  };
}

// Hook for file upload with progress
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (
    files: File[],
    request: AnalysisRequest
  ): Promise<AnalysisResponse | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for file upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.analyzeDocuments(files, request);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFiles,
    reset
  };
}
