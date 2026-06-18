import { useEffect } from 'react';

export const useAppHealthDebugger = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorReport = {
        timestamp: new Date().toISOString(),
        message: event instanceof ErrorEvent ? event.message : 'Unhandled Promise Rejection',
        source: event instanceof ErrorEvent ? event.filename : 'Promise',
        line: event instanceof ErrorEvent ? event.lineno : null,
      };
      
      console.error('AppHealthDebugger captured a critical failure:', errorReport);
      // Here you could send this to a logging service
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
};
